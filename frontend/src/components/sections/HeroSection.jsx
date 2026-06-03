const STATS = [
  { value: "< 5ms", label: "Scoring latency" },
  { value: "4 tiers", label: "Escalation levels" },
  { value: "0 bytes", label: "Model in browser" },
  { value: "∞ users", label: "No retraining" },
];

export default function HeroSection() {
  return (
    <section id="hero" style={{ paddingTop: "7rem", textAlign: "center" }}>
      <p
        style={{
          color: "var(--accent)",
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          marginBottom: "1rem",
        }}
      >
        GITHUB DEVDAYS · JUNE 2026
      </p>
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.1, marginBottom: "1rem" }}>
        Your typing fingerprint.
        <br />
        <span style={{ color: "var(--accent)" }}>GhostID</span> watches it.
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1.15rem",
          maxWidth: 620,
          margin: "0 auto 2.5rem",
          lineHeight: 1.6,
        }}
      >
        Drop one script into any web app. Silently verify the person typing is the
        same person who logged in — no camera, no OTP, zero friction for real users.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ padding: "1rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
