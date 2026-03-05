export default function Footer() {
  return (
    <footer
      style={{
        maxWidth: "52rem",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
      }}
    >
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: "0.625rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.1em",
          }}
        >
          CANARY — KEEPER.LOG
        </p>
        <span
          style={{
            color: "var(--accent)",
            fontSize: "0.625rem",
            fontFamily: "'Space Mono', monospace",
            animation: "blink 2s infinite",
          }}
        >
          ▮
        </span>
      </div>
    </footer>
  );
}
