/**
 * GhostID feature extraction — shared between SDK and frontend.
 *
 * Feature vector layout (41 values):
 *   [0..30]  31 dwell times  (key-held duration, seconds)
 *   [31..40] 10 dwell ratios (dwell[i] / dwell[i+1], clamped [0, 10])
 *
 * Matches the CMU DSL training layout used by ghostid_encoder.onnx.
 */

const FEATURE_SIZE = 41;
const DWELL_COUNT = 31;
const RATIO_COUNT = 10;
const MAX_RATIO = 10;

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

  for (const ev of events) {
    if (ev.type === "down") {
      downs[ev.key] = ev.t;
    } else if (ev.type === "up" && downs[ev.key] !== undefined) {
      const dwell = (ev.t - downs[ev.key]) / 1000;
      dwells.push(Math.max(0, dwell));
      delete downs[ev.key];
    }
  }

  // Dwell ratios: dwell[i] / dwell[i+1], clamped to [0, MAX_RATIO]
  const ratios = [];
  for (let i = 0; i < dwells.length - 1; i++) {
    const ratio = Math.min(dwells[i] / (dwells[i + 1] + 1e-8), MAX_RATIO);
    ratios.push(ratio);
  }

  // Assemble and pad/trim to exactly FEATURE_SIZE
  const combined = [
    ...dwells.slice(0, DWELL_COUNT),
    ...ratios.slice(0, RATIO_COUNT),
  ];

  while (combined.length < FEATURE_SIZE) combined.push(0);
  return combined.slice(0, FEATURE_SIZE);
}

// CJS compat
if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractFeatures, FEATURE_SIZE };
}

export { extractFeatures, FEATURE_SIZE };