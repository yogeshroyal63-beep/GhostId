/**
 * GhostID v3 — Continuous Behavioral Session Verification SDK
 * Drop-in vanilla JS — no dependencies.
 *
 * @example
 * const ghost = new GhostID({
 *   userId: 'user-123',
 *   apiUrl: 'http://localhost:8000',
 *   apiKey: 'your-secret-key',       // matches GHOSTID_API_KEY on the server
 *   scoreIntervalMs: 60000,
 *   onTierChange: (r) => console.log(r.tier, r.confidence_score),
 *   onHardStop: () => window.location.href = '/login',
 * });
 * await ghost.start();
 */

import { extractFeatures as _extractFeatures, FEATURE_SIZE } from "./features.js";

class GhostID {
  static ERROR_CODES = {
    NETWORK_ERROR: "NETWORK_ERROR",
    API_ERROR: "API_ERROR",
    NOT_ENROLLED: "NOT_ENROLLED",
    INSUFFICIENT_KEYSTROKES: "INSUFFICIENT_KEYSTROKES",
  };

  constructor(config = {}) {
    this.userId = config.userId;
    this.apiUrl = (config.apiUrl || "http://localhost:8000").replace(/\/$/, "");
    this.apiKey = config.apiKey || "";
    this.scoreIntervalMs = config.scoreIntervalMs ?? 60000;
    this.minKeystrokes = config.minKeystrokes ?? 10;
    this.autoEnroll = config.autoEnroll ?? true;

    this.onTierChange = config.onTierChange || (() => {});
    this.onHardStop = config.onHardStop || (() => {});
    this.onSoftNudge = config.onSoftNudge || (() => {});
    this.onTypingChallenge = config.onTypingChallenge || (() => {});
    this.onError =
      config.onError ||
      ((err) => console.error("[GhostID]", err.code, err.message));

    this._events = [];
    this._downs = {};
    this._scoreTimer = null;
    this._typingIdleTimer = null;
    this._running = false;
    this._lastTier = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  async start() {
    if (!this.userId) {
      this._emitError(GhostID.ERROR_CODES.API_ERROR, "userId is required");
      return;
    }
    if (this._running) return;
    this._running = true;
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    this._scheduleScoreCheck();
  }

  stop() {
    this._running = false;
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    clearTimeout(this._scoreTimer);
    clearTimeout(this._typingIdleTimer);
  }

  async isEnrolled() {
    try {
      const res = await fetch(
        `${this.apiUrl}/enroll/${encodeURIComponent(this.userId)}`,
        { headers: this._headers() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { enrolled: false, session_count: 0 };
    }
  }

  async enroll() {
    const features = this.extractFeatures();
    if (!this._hasEnoughKeystrokes()) {
      this._emitError(
        GhostID.ERROR_CODES.INSUFFICIENT_KEYSTROKES,
        `Need at least ${this.minKeystrokes} keystrokes to enroll`
      );
      return null;
    }
    return this._post("/enroll", { user_id: this.userId, features });
  }

  async score() {
    const features = this.extractFeatures();
    if (!this._hasEnoughKeystrokes()) {
      this._emitError(
        GhostID.ERROR_CODES.INSUFFICIENT_KEYSTROKES,
        `Need at least ${this.minKeystrokes} keystrokes to score`
      );
      return null;
    }
    return this._post("/score", { user_id: this.userId, features });
  }

  async simulateImpostor() {
    // Send a placeholder body; server generates realistic random features.
    return this._post("/score/simulate-impostor", {
      user_id: this.userId,
      features: Array(FEATURE_SIZE).fill(0),
    });
  }

  /** Extract the 41-feature vector from buffered events (shared logic). */
  extractFeatures() {
    return _extractFeatures(this._events);
  }

  clearKeystrokes() {
    this._events = [];
    this._downs = {};
  }

  _onKeyDown(e) {
    if (e.repeat) return;
    this._downs[e.key] = performance.now();
    this._events.push({ key: e.key, type: "down", t: performance.now() });
    this._resetTypingIdleTimer();
  }

  _onKeyUp(e) {
    this._events.push({ key: e.key, type: "up", t: performance.now() });
    this._resetTypingIdleTimer();
  }

  _resetTypingIdleTimer() {
    clearTimeout(this._typingIdleTimer);
    this._typingIdleTimer = setTimeout(
      () => this.clearKeystrokes(),
      this.scoreIntervalMs
    );
  }

  _scheduleScoreCheck() {
    clearTimeout(this._scoreTimer);
    if (!this._running) return;
    this._scoreTimer = setTimeout(
      () => this._runScoreCycle(),
      this.scoreIntervalMs
    );
  }

  async _runScoreCycle() {
    try {
      const status = await this.isEnrolled();
      if (!status.enrolled && this.autoEnroll) {
        await this.enroll();
      } else if (status.enrolled) {
        const result = await this.score();
        if (result) this._handleTier(result);
      }
    } catch (err) {
      this._emitError(GhostID.ERROR_CODES.NETWORK_ERROR, err.message);
    } finally {
      this._scheduleScoreCheck();
    }
  }

  _handleTier(result) {
    if (result.tier === this._lastTier) return;
    this._lastTier = result.tier;
    this.onTierChange(result);
    switch (result.tier) {
      case "HARD_STOP":
        this.onHardStop(result);
        break;
      case "SOFT_NUDGE":
        this.onSoftNudge(result);
        break;
      case "TYPING_CHALLENGE":
        this.onTypingChallenge(result);
        break;
    }
  }

  _hasEnoughKeystrokes() {
    return this._events.filter((e) => e.type === "up").length >= this.minKeystrokes;
  }

  _headers() {
    const h = { "Content-Type": "application/json" };
    if (this.apiKey) h["X-GhostID-Key"] = this.apiKey;
    return h;
  }

  async _post(path, body) {
    try {
      const res = await fetch(`${this.apiUrl}${path}`, {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        this._emitError(
          GhostID.ERROR_CODES.API_ERROR,
          data.detail || `HTTP ${res.status}`,
          data
        );
        return null;
      }
      return data;
    } catch (err) {
      this._emitError(GhostID.ERROR_CODES.NETWORK_ERROR, err.message);
      return null;
    }
  }

  _emitError(code, message, data = null) {
    this.onError({ code, message, data });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GhostID;
}
if (typeof window !== "undefined") {
  window.GhostID = GhostID;
}
