export const TIERS = {
  SILENT_PASS: {
    label: "VERIFIED",
    color: "#00e5a0",
    glow: "rgba(0,229,160,0.3)",
    icon: "✓",
    description: "Behavioral signature matches. Session continues.",
  },
  SOFT_NUDGE: {
    label: "LOW CONFIDENCE",
    color: "#f5a623",
    glow: "rgba(245,166,35,0.3)",
    icon: "⚠",
    description: "Slight deviation detected. One-tap confirm required.",
  },
  TYPING_CHALLENGE: {
    label: "ANOMALY DETECTED",
    color: "#ff6b2b",
    glow: "rgba(255,107,43,0.3)",
    icon: "⚡",
    description: "Significant anomaly. Re-verify by typing a phrase.",
  },
  HARD_STOP: {
    label: "BREACH DETECTED",
    color: "#ff2d55",
    glow: "rgba(255,45,85,0.5)",
    icon: "✕",
    description: "Behavioral mismatch. Session terminated.",
  },
  NOT_ENROLLED: {
    label: "NOT ENROLLED",
    color: "#7b7f8a",
    glow: "transparent",
    icon: "○",
    description: "User has not enrolled yet.",
  },
  MONITORING: {
    label: "MONITORING",
    color: "#4a9eff",
    glow: "rgba(74,158,255,0.2)",
    icon: "◉",
    description: "Session monitoring active.",
  },
};

export function getTierConfig(tier) {
  return TIERS[tier] || TIERS.MONITORING;
}
