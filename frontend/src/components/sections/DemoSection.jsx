import { useState, useEffect, useCallback } from "react";
import ScoreRing from "../ScoreRing";
import EventLog from "../EventLog";
import { useKeystroke } from "../../hooks/useKeystroke";
import { api } from "../../utils/api";
import { getTierConfig } from "../../utils/tiers";

const USER_ID = "demo-user";

export default function DemoSection({ onHardStop, onTierChange }) {
  const { count, recentKeys, extractFeatures, clear, ready, minKeystrokes, pasteDetectedRef } = useKeystroke();
  const [score, setScore] = useState(0);
  const [tier, setTier] = useState("NOT_ENROLLED");
  const [enrolled, setEnrolled] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [autoScore, setAutoScore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const addEvent = useCallback((tierName, message) => {
    const time = new Date().toLocaleTimeString();
    setEvents((prev) => [{ time, tier: tierName, message }, ...prev].slice(0, 30));
  }, []);

  const applyResult = useCallback(
    (result) => {
      setScore(result.confidence_score ?? 0);
      setTier(result.tier);
      setEnrolled(result.enrolled ?? enrolled);
      setSessionCount(result.session_count ?? sessionCount);
      addEvent(result.tier, `Score ${result.confidence_score} — ${result.action || ""}`);
      onTierChange?.(result);
      if (result.tier === "HARD_STOP") onHardStop?.();
    },
    [addEvent, enrolled, onHardStop, onTierChange, sessionCount]
  );

  const handleEnroll = async () => {
    if (!ready) return;
    setLoading(true);
    try {
      const result = await api.enroll(USER_ID, extractFeatures());
      setEnrolled(result.enrolled);
      setSessionCount(result.session_count);
      addEvent("MONITORING", result.message);
    } catch (err) {
      addEvent("NOT_ENROLLED", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScore = useCallback(async () => {
    if (pasteDetectedRef.current) {
      pasteDetectedRef.current = false;
      applyResult({
        confidence_score: 0,
        tier: "HARD_STOP",
        action: "paste_detected",
        enrolled: true,
        session_count: sessionCount,
      });
      return;
    }
    if (!ready) return;
    setLoading(true);
    try {
      const result = await api.score(USER_ID, extractFeatures());
      applyResult(result);
    } catch (err) {
      addEvent("NOT_ENROLLED", err.message);
    } finally {
      setLoading(false);
    }
  }, [pasteDetectedRef, ready, extractFeatures, applyResult, addEvent, sessionCount]);

  const handleImpostor = async () => {
    setLoading(true);
    try {
      const result = await api.simulateImpostor(USER_ID);
      applyResult(result);
    } catch (err) {
      addEvent("HARD_STOP", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.deleteProfile(USER_ID);
    } catch {
      /* profile may not exist */
    }
    clear();
    setText("");
    setScore(0);
    setTier("NOT_ENROLLED");
    setEnrolled(false);
    setSessionCount(0);
    addEvent("NOT_ENROLLED", "Profile reset");
  };

  useEffect(() => {
    api.getStatus(USER_ID).then((s) => {
      setEnrolled(s.enrolled);
      setSessionCount(s.session_count);
      if (s.enrolled) setTier("MONITORING");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!autoScore || !ready || !enrolled) return;
    const timer = setInterval(handleScore, 30000);
    return () => clearInterval(timer);
  }, [autoScore, ready, enrolled, handleScore]);

  const tierConfig = getTierConfig(tier);
  const progress = Math.min((count / minKeystrokes) * 100, 100);

  return (
    <section id="demo">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Live Demo</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Type in the box below to build your behavioral profile, then simulate an impostor takeover.
      </p>

      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: tierConfig.color,
          marginBottom: "1.5rem",
          boxShadow: `0 0 12px ${tierConfig.glow}`,
          transition: "background 0.4s, box-shadow 0.4s",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <label style={{ fontSize: "0.8rem", color: "var(--muted)" }}>TYPE HERE</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing to capture keystroke dynamics…"
            rows={6}
            style={{
              width: "100%",
              marginTop: "0.75rem",
              background: "#0a0e14",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              padding: "1rem",
              fontFamily: "inherit",
              fontSize: "1rem",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              Keystrokes: {count} / {minKeystrokes}
            </span>
            <div
              style={{
                flex: 1,
                height: 6,
                background: "var(--border)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--accent)",
                  transition: "width 0.2s",
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem", color: "var(--muted)" }}>
            Recent: {recentKeys.join(" ") || "—"}
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ScoreRing score={score} color={tierConfig.color} />
          <div
            style={{
              marginTop: "1rem",
              padding: "0.4rem 1rem",
              borderRadius: 20,
              background: `${tierConfig.color}22`,
              color: tierConfig.color,
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {tierConfig.icon} {tierConfig.label}
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem", textAlign: "center" }}>
            {tierConfig.description}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}>
            Sessions: {sessionCount} · {enrolled ? "Enrolled" : "Not enrolled"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={handleEnroll} disabled={!ready || loading}>
          Enroll Session
        </button>
        <button className="btn-primary" onClick={handleScore} disabled={!ready || !enrolled || loading}>
          Score Now
        </button>
        <button className="btn-danger" onClick={handleImpostor} disabled={!enrolled || loading}>
          Simulate Impostor
        </button>
        <button className="btn-ghost" onClick={handleReset}>
          Reset
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", color: "var(--muted)", fontSize: "0.85rem" }}>
          <input type="checkbox" checked={autoScore} onChange={(e) => setAutoScore(e.target.checked)} />
          Auto-score every 30s
        </label>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <EventLog events={events} />
      </div>
    </section>
  );
}