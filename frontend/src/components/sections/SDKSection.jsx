import { useState } from "react";
import CodeBlock from "../CodeBlock";

const TABS = ["Vanilla JS", "React", "Next.js", "Config"];

const SNIPPETS = {
  "Vanilla JS": `<script src="/sdk/ghostid.js"></script>
<script>
  const ghost = new GhostID({
    userId: "user-123",
    apiUrl: "https://ghostid.onrender.com",
    scoreIntervalMs: 60000,
    onTierChange: (r) => console.log(r.tier, r.confidence_score),
    onHardStop: () => { window.location.href = "/login"; },
  });
  ghost.start();
</script>`,

  React: `import { useEffect } from "react";

export function useGhostID(userId) {
  useEffect(() => {
    const ghost = new GhostID({
      userId,
      apiUrl: import.meta.env.VITE_API_URL,
      onHardStop: () => window.location.href = "/login",
    });
    ghost.start();
    return () => ghost.stop();
  }, [userId]);
}`,

  "Next.js": `// app/providers/GhostIDProvider.tsx
"use client";
import { useEffect } from "react";

export function GhostIDProvider({ userId, children }) {
  useEffect(() => {
    const ghost = new GhostID({
      userId,
      apiUrl: process.env.NEXT_PUBLIC_GHOSTID_API,
      onHardStop: () => window.location.href = "/login",
    });
    ghost.start();
    return () => ghost.stop();
  }, [userId]);
  return children;
}`,

  Config: `// All GhostID constructor options
{
  userId: string,              // required
  apiUrl: string,              // default: http://localhost:8000
  scoreIntervalMs: number,     // default: 60000
  minKeystrokes: number,       // default: 10
  autoEnroll: boolean,         // default: true
  onTierChange: (result) => {},
  onHardStop: (result) => {},
  onSoftNudge: (result) => {},
  onTypingChallenge: (result) => {},
  onError: ({ code, message }) => {},
}`,
};

export default function SDKSection() {
  const [tab, setTab] = useState("Vanilla JS");

  return (
    <section id="sdk">
      <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>SDK Integration</h2>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        One script. Five minutes. Any web app protected.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? "btn-primary" : "btn-ghost"}
            onClick={() => setTab(t)}
            style={{ fontSize: "0.85rem" }}
          >
            {t}
          </button>
        ))}
      </div>

      <CodeBlock code={SNIPPETS[tab]} />
    </section>
  );
}
