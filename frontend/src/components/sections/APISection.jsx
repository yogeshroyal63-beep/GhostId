import { useEffect, useState } from "react";
import { api } from "../../utils/api";

const ENDPOINTS = [
  { method: "GET", path: "/health", desc: "API status, encoder loaded, DB ok" },
  { method: "POST", path: "/enroll", desc: "Enroll keystroke session for user_id" },
  { method: "GET", path: "/enroll/{user_id}", desc: "Check enrollment status" },
  { method: "DELETE", path: "/enroll/{user_id}", desc: "Delete profile (GDPR)" },
  { method: "POST", path: "/score", desc: "Score current session against baseline" },
  { method: "POST", path: "/score/simulate-impostor", desc: "Demo: inject impostor features" },
];

export default function APISection() {
  const [health, setHealth] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch(() => setHealth({ status: "error", latency: 0 }));
  }, []);

  return (
    <section id="api">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>API Reference</h2>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        FastAPI backend with OpenAPI docs at{" "}
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          /docs
        </a>
      </p>

      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: health?.status === "ok" ? "var(--pass)" : "var(--stop)",
          }}
        />
        <span>
          API {health?.status === "ok" ? "Online" : "Offline"}
          {health?.latency != null && ` · ${health.latency}ms`}
          {health?.placeholder_mode && " · Placeholder mode"}
        </span>
      </div>

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
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  background: ep.method === "GET" ? "#00e5a033" : ep.method === "POST" ? "#4a9eff33" : "#ff6b2b33",
                  color: ep.method === "GET" ? "var(--pass)" : ep.method === "POST" ? "var(--accent)" : "var(--challenge)",
                }}
              >
                {ep.method}
              </span>
              <code style={{ flex: 1 }}>{ep.path}</code>
              <span style={{ color: "var(--muted)" }}>{open === ep.path ? "▲" : "▼"}</span>
            </button>
            {open === ep.path && (
              <p style={{ color: "var(--muted)", marginTop: "0.75rem", fontSize: "0.9rem" }}>{ep.desc}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
