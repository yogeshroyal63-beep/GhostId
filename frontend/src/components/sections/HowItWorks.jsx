const STEPS = [
  {
    num: "01",
    title: "Capture Keystrokes",
    desc: "SDK listens to keydown/keyup events silently. No camera, no permissions dialog.",
  },
  {
    num: "02",
    title: "Extract 41 Features",
    desc: "31 dwell timings + 10 speed-invariant ratios per keystroke pair. Style, not speed.",
  },
  {
    num: "03",
    title: "Encode to 128-dim Embedding",
    desc: "LSTM encoder (ONNX, ~60KB) maps features into a learned behavioral space.",
  },
  {
    num: "04",
    title: "Score & Escalate",
    desc: "Cosine similarity vs enrolled baseline. Four tiers from silent pass to hard stop.",
  },
];

const METRICS = [
  { label: "Dataset", value: "CMU DSL (51 users, 20,400 sessions)" },
  { label: "Features", value: "41 — 31 dwell times + 10 ratios" },
  { label: "Model", value: "LSTM → 128-dim L2-normalized embedding" },
  { label: "Loss", value: "ArcFace (angular margin m = 0.5)" },
  { label: "FAR", value: "2.1%  (impostors falsely accepted)" },
  { label: "FRR", value: "3.8%  (real users falsely rejected)" },
  { label: "EER", value: "~3.0%" },
  { label: "Latency", value: "< 1ms  (CPU, ONNX)" },
];

export default function HowItWorks() {
  return (
    <section id="how">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>How It Works</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Trained on CMU DSL Keystroke Dynamics — 51 users, 20,400 sessions, ArcFace loss.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {STEPS.map((step) => (
          <div key={step.num} className="card">
            <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.5rem" }}>{step.num}</div>
            <h3 style={{ margin: "0.5rem 0" }}>{step.title}</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{ marginTop: "2rem" }}
      >
        <h3 style={{ marginBottom: "1rem" }}>ML Benchmarks</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2rem" }}>
          {METRICS.map((m) => (
            <div
              key={m.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ color: "var(--muted)" }}>{m.label}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text)" }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}