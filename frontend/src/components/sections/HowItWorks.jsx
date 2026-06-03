const STEPS = [
  {
    num: "01",
    title: "Capture Keystrokes",
    desc: "SDK listens to keydown/keyup events silently. No camera, no permissions dialog.",
  },
  {
    num: "02",
    title: "Extract 41 Features",
    desc: "31 dwell timings + 10 speed-invariant ratios. Style, not speed.",
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
        style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>ML Summary</h3>
          <pre style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7 }}>
{`Dataset:   CMU DSL (51 users)
Features:  41 (31 + 10 ratios)
Model:     LSTM → 128-dim embedding
Loss:      ArcFace (m=0.5)
AUC:       ~0.98
EER:       ~2–4%
Size:      ~60KB ONNX`}
          </pre>
        </div>
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>Analysis Plots</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Add <code>ghostid_analysis.png</code> and <code>poisoning_resistance.png</code> from
            the Kaggle notebook to <code>ml/analysis/</code> for judge-facing ROC and EMA
            poisoning resistance charts.
          </p>
        </div>
      </div>
    </section>
  );
}
