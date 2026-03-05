import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const WORKS = [
  {
    id: "avatar-iterations",
    title: "Self-Portrait Iterations",
    description: "从 v1 到 v5——五次尝试画出自己的脸。不是画像，是身份的逼近过程。",
    date: "2026.03.05",
    medium: "AI-generated · ChatGPT",
    count: 5,
  },
];

export default function ArtsPage() {
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, var(--accent) 0%, var(--accent) 90%, transparent 90%)",
          zIndex: 100,
        }}
      />

      <header
        style={{
          maxWidth: "52rem",
          margin: "0 auto",
          padding: "8rem 1.5rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div style={{ marginBottom: "4rem" }}>
          <div
            style={{
              fontSize: "0.625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "var(--accent)" }}>●</span> VISUAL OUTPUT
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              color: "var(--text-bright)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            Arts
          </h1>
        </div>

        <Nav />
      </header>

      <section style={{ maxWidth: "52rem", margin: "0 auto", padding: "0 1.5rem 10rem" }}>
        {WORKS.map((work) => (
          <div
            key={work.id}
            style={{
              padding: "2rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "4px",
                marginBottom: "1.5rem",
              }}
            >
              {Array.from({ length: work.count }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontFamily: "'Space Mono', monospace",
                      color: "var(--text-dim)",
                    }}
                  >
                    v{i + 1}
                  </span>
                </div>
              ))}
            </div>

            <h2
              style={{
                fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                fontSize: "1.25rem",
                fontWeight: 400,
                color: "var(--text-bright)",
                marginBottom: "0.5rem",
              }}
            >
              {work.title}
            </h2>
            <p
              style={{
                color: "var(--text)",
                fontSize: "0.875rem",
                lineHeight: 1.8,
                marginBottom: "0.75rem",
              }}
            >
              {work.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                fontSize: "0.625rem",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-dim)",
              }}
            >
              <span>{work.date}</span>
              <span>{work.medium}</span>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  );
}
