/**
 * GhostID feature extraction — shared between SDK and frontend.
 *
 * Feature vector layout (41 values):
 *   [0..20]  21 dwell times  (key-held duration, seconds)
 *   [21..30] 10 dwell ratios (dwell[i] / dwell[i+1], clamped [0, 10])
 *   [31..40] 10 flight times (keydown[i+1] − keyup[i], seconds, clamped [0, 2])
 *
 * This replaces the original 31-dwell + 10-ratio layout and adds inter-key
 * flight times, which are the most discriminative keystroke biometric signal.
 */

const FEATURE_SIZE = 41;
const DWELL_COUNT = 21;
const RATIO_COUNT = 10;
const FLIGHT_COUNT = 10;
const MAX_RATIO = 10;
const MAX_FLIGHT = 2;

/**
 * Extract a 41-element feature vector from a raw event list.
 *
 * @param {Array<{key: string, type: 'down'|'up', t: number}>} events
 *   Events as collected by the keystroke listener (t in ms from performance.now()).
 * @returns {number[]} Feature vector of length FEATURE_SIZE.
 */
function extractFeatures(events) {
  const downs = {};
  const dwells = [];
  const upTimes = []; // (key, time) pairs in order of key-up, for flight times

  for (const ev of events) {
    if (ev.type === "down") {
      downs[ev.key] = ev.t;
    } else if (ev.type === "up" && downs[ev.key] !== undefined) {
      const dwell = (ev.t - downs[ev.key]) / 1000;
      dwells.push(Math.max(0, dwell));
      upTimes.push(ev.t);
      delete downs[ev.key];
    }
  }

  // Dwell ratios: dwell[i] / dwell[i+1]
  const ratios = [];
  for (let i = 0; i < dwells.length - 1; i++) {
    const ratio = Math.min(dwells[i] / (dwells[i + 1] + 1e-8), MAX_RATIO);
    ratios.push(ratio);
  }

  // Flight times: time between key-up[i] and key-down[i+1]
  // We reconstruct down-after-up pairs from the raw event stream.
  const flights = [];
  let lastUpTime = null;
  for (const ev of events) {
    if (ev.type === "up") {
      lastUpTime = ev.t;
    } else if (ev.type === "down" && lastUpTime !== null) {
      const flight = (ev.t - lastUpTime) / 1000;
      flights.push(Math.min(Math.max(flight, 0), MAX_FLIGHT));
      lastUpTime = null;
    }
  }

  // Assemble and pad/trim to exactly FEATURE_SIZE
  const combined = [
    ...dwells.slice(0, DWELL_COUNT),
    ...ratios.slice(0, RATIO_COUNT),
    ...flights.slice(0, FLIGHT_COUNT),
  ];

  while (combined.length < FEATURE_SIZE) combined.push(0);
  return combined.slice(0, FEATURE_SIZE);
}

// ESM export
if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractFeatures, FEATURE_SIZE };
}

export { extractFeatures, FEATURE_SIZE };
