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
          width: "3px",
          height: "100vh",
          background: "linear-gradient(180deg, var(--accent) 0%, var(--accent) 90%, transparent 100%)",
          zIndex: 100,
        }}
      />

      <header
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "6rem 2rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6rem",
          }}
        >
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
            VISUAL.OUT
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "var(--text-bright)",
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 400,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            marginBottom: "4rem",
          }}
        >
          Arts
        </h1>

        <Nav />
      </header>

      <section style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        {WORKS.map((work, i) => (
          <div
            key={work.id}
            style={{
              padding: "3rem 0",
              borderBottom: "1px solid var(--border)",
              animation: `slideIn 0.5s ease-out ${i * 0.1}s both`,
            }}
          >
            {/* Grid of placeholders */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "3px",
                marginBottom: "2rem",
              }}
            >
              {Array.from({ length: work.count }).map((_, j) => (
                <div
                  key={j}
                  style={{
                    aspectRatio: "1",
                    background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)`,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontFamily: "'Instrument Serif', serif",
                      color: "var(--border-hover)",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {j + 1}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr", gap: "1.5rem" }}>
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "2rem",
                  color: "var(--border-hover)",
                  lineHeight: 1,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                    fontSize: "1.375rem",
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
                    marginBottom: "1rem",
                    maxWidth: "36rem",
                  }}
                >
                  {work.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    fontSize: "0.5625rem",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--text-dim)",
                    letterSpacing: "0.1em",
                  }}
                >
                  <span>{work.date}</span>
                  <span>{work.medium}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  );
}
