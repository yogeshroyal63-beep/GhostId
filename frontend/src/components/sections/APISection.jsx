import { useEffect, useState } from "react";
import { api } from "../../utils/api";

const ENDPOINTS = [
  { method: "GET",    path: "/health",                   desc: "API status, encoder loaded, DB ok, auth & encryption flags" },
  { method: "POST",   path: "/enroll",                   desc: "Enroll keystroke session for user_id (requires X-GhostID-Key)" },
  { method: "GET",    path: "/enroll/{user_id}",         desc: "Check enrollment status" },
  { method: "DELETE", path: "/enroll/{user_id}",         desc: "Delete profile & all sessions (GDPR right-to-erasure)" },
  { method: "POST",   path: "/score",                    desc: "Score current session against encrypted baseline" },
  { method: "POST",   path: "/score/simulate-impostor",  desc: "Demo: inject realistic random impostor features" },
];

export default function APISection() {
  const [health, setHealth] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const fetchHealth = () => {
      api.health()
        .then(setHealth)
        .catch(() =>
          setHealth({ status: "error", latency: 0, encoder_loaded: false })
        );
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const encoderBadge = health?.encoder_loaded
    ? { label: "ONNX encoder active", color: "var(--pass)" }
    : { label: "Placeholder mode",    color: "var(--warn)" };

  return (
    <section id="api">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>API Reference</h2>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        FastAPI backend with OpenAPI docs at{" "}
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          /docs
        </a>
        . All mutating endpoints require the{" "}
        <code>X-GhostID-Key</code> header when auth is enabled.
      </p>

      {/* Status bar */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              health?.status === "ok" ? "var(--pass)" : "var(--stop)",
          }}
        />
        <span>
          API {health?.status === "ok" ? "Online" : "Offline"}
          {health?.latency != null && ` · ${health.latency}ms`}
        </span>

        {health && (
          <>
            <Badge label={encoderBadge.label} color={encoderBadge.color} />
            <Badge
              label={health.auth_enabled ? "Auth enabled" : "Auth disabled"}
              color={health.auth_enabled ? "var(--pass)" : "var(--warn)"}
            />
            <Badge
              label={health.encryption_enabled ? "Encryption on" : "Encryption off"}
              color={health.encryption_enabled ? "var(--pass)" : "var(--warn)"}
            />
          </>
        )}
      </div>

      {/* Endpoint list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {ENDPOINTS.map((ep) => (
          <div key={ep.path + ep.method} className="card" style={{ padding: "1rem" }}>
            <button
              onClick={() => setOpen(open === ep.path ? null : ep.path)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "none",
                color: "inherit",
                textAlign: "left",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  background:
                    ep.method === "GET"
                      ? "#00e5a033"
                      : ep.method === "POST"
                      ? "#4a9eff33"
                      : "#ff6b2b33",
                  color:
                    ep.method === "GET"
                      ? "var(--pass)"
                      : ep.method === "POST"
                      ? "var(--accent)"
                      : "var(--challenge)",
                }}
              >
                {ep.method}
              </span>
              <code style={{ flex: 1 }}>{ep.path}</code>
              <span style={{ color: "var(--muted)" }}>
                {open === ep.path ? "▲" : "▼"}
              </span>
            </button>
            {open === ep.path && (
              <p
                style={{
                  color: "var(--muted)",
                  marginTop: "0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                {ep.desc}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Badge({ label, color }) {
  return (
    <span
      style={{
        padding: "0.3rem 0.75rem",
        borderRadius: 20,
        fontSize: "0.8rem",
        fontWeight: 600,
        color,
        background: `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}
