import { getAllEssays } from "@/lib/posts";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function getExcerpt(content: string): string {
  return content
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/^#+\s.+$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^>\s.+$/gm, "")
    .replace(/^-\s.+$/gm, "")
    .replace(/\n{2,}/g, " ")
    .trim()
    .slice(0, 200);
}

export default function EssaysPage() {
  const essays = getAllEssays();

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background: "linear-gradient(180deg, var(--accent) 0%, var(--accent) 60%, transparent 100%)",
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
            LONG.FORM
          </span>
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
            }}
          >
            [{essays.length}]
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
          Essays
        </h1>

        <Nav />
      </header>

      <section style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        {essays.map((essay, i) => (
          <Link
            key={essay.slug}
            href={`/essays/${essay.slug}`}
            style={{
              display: "grid",
              gridTemplateColumns: "4.5rem 1fr",
              gap: "1.5rem",
              padding: "3rem 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
              animation: `slideIn 0.5s ease-out ${i * 0.1}s both`,
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "2rem",
                color: "var(--border-hover)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  color: "var(--text-bright)",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.75rem",
                }}
              >
                {essay.title}
              </h2>
              {essay.subtitle && (
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.6875rem",
                    color: "var(--text-dim)",
                    marginBottom: "1rem",
                    fontStyle: "italic",
                  }}
                >
                  {essay.subtitle}
                </p>
              )}
              <p
                style={{
                  color: "var(--text)",
                  fontSize: "0.875rem",
                  lineHeight: 1.9,
                  maxWidth: "36rem",
                }}
              >
                {getExcerpt(essay.content)}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  fontSize: "0.5625rem",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                {essay.date}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <Footer />
    </main>
  );
}
