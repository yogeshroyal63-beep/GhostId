const LINKS = [
  { id: "hero", label: "Home" },
  { id: "demo", label: "Demo" },
  { id: "sdk", label: "SDK" },
  { id: "how", label: "How It Works" },
  { id: "api", label: "API" },
];

export default function Nav() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "rgba(6,8,12,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
        <span style={{ color: "var(--accent)" }}>Ghost</span>ID
        <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: 8 }}>v3</span>
      </div>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {LINKS.map((link) => (
          <button
            key={link.id}
            className="btn-ghost"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            onClick={() => scrollTo(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
