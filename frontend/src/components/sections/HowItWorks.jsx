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
        style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
      >
        <div>
          <h3 style={{ marginBottom: "0.75rem" }}>ML Summary</h3>
          <pre style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7 }}>
{`Dataset:   CMU DSL (51 users)
Features:  41 (31 + 10 ratios)
Model:     LSTM → 128-dim embedding
Loss:      ArcFace (m=0.5)
Output:    L2-normalized cosine scoring`}
          </pre>
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem" }}>Score Distribution + ROC</h3>
          <img
            src="/analysis/ghostid_analysis.png"
            alt="Genuine vs impostor score distribution and ROC curve"
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
      </div>

      <div
        className="card"
        style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
      >
        <div>
          <h3 style={{ marginBottom: "0.75rem" }}>EMA Poisoning Resistance</h3>
          <img
            src="/analysis/poisoning_resistance.png"
            alt="EMA baseline poisoning resistance over 200 sessions"
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem" }}>Training Curve</h3>
          <img
            src="/analysis/training_curves.png"
            alt="ArcFace training loss curve"
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
      </div>
    </section>
  );
}
