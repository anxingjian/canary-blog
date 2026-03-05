export default function Footer() {
  return (
    <footer
      style={{
        maxWidth: "72rem",
        margin: "0 auto",
        padding: "0 2rem 3rem",
      }}
    >
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "var(--text-dim)",
            fontSize: "0.5rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.2em",
          }}
        >
          C://KEEPER.SYS
        </span>
        <span
          style={{
            color: "var(--accent)",
            fontSize: "0.5rem",
            fontFamily: "'Space Mono', monospace",
            animation: "blink 2.5s infinite",
          }}
        >
          ▮
        </span>
      </div>
    </footer>
  );
}
