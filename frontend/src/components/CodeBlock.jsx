import { useState } from "react";

export default function CodeBlock({ code, language = "javascript" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: "0.7rem",
          padding: "0.3rem 0.6rem",
          background: "var(--border)",
          color: "var(--text)",
          borderRadius: 6,
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre
        style={{
          background: "#0a0e14",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.25rem",
          overflow: "auto",
          fontSize: "0.8rem",
          lineHeight: 1.6,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
