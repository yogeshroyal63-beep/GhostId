import { getTierConfig } from "../utils/tiers";

export default function EventLog({ events }) {
  return (
    <div
      className="card"
      style={{
        maxHeight: 220,
        overflowY: "auto",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "0.75rem" }}>
        EVENT LOG
      </div>
      {events.length === 0 && (
        <div style={{ color: "var(--muted)" }}>Waiting for events…</div>
      )}
      {events.map((ev, i) => {
        const tier = getTierConfig(ev.tier);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.75rem",
              padding: "0.35rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--muted)", minWidth: 70 }}>{ev.time}</span>
            <span style={{ color: tier.color, minWidth: 120 }}>{ev.tier}</span>
            <span>{ev.message}</span>
          </div>
        );
      })}
    </div>
  );
}
