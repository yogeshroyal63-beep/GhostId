export default function HardStopOverlay({ visible, onDismiss }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(255,45,85,0.15)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 420,
          textAlign: "center",
          borderColor: "var(--stop)",
          boxShadow: "0 0 60px rgba(255,45,85,0.3)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✕</div>
        <h2 style={{ color: "var(--stop)", marginBottom: "0.5rem" }}>Session Terminated</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Behavioral signature mismatch detected. Full re-authentication required.
        </p>
        <button className="btn-danger" onClick={onDismiss}>
          Return to Login
        </button>
      </div>
    </div>
  );
}
