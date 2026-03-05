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
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, var(--accent) 0%, var(--accent) 60%, transparent 60%)",
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
            <span style={{ color: "var(--accent)" }}>●</span> LONG FORM
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
            Essays
          </h1>
        </div>

        <Nav />

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <span
            style={{
              color: "var(--accent-dim)",
              fontSize: "0.625rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            ESSAYS [{essays.length}]
          </span>
          <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>
      </header>

      <section style={{ maxWidth: "52rem", margin: "0 auto", padding: "0 1.5rem 10rem" }}>
        {essays.map((essay) => (
          <Link
            key={essay.slug}
            href={`/essays/${essay.slug}`}
            style={{
              display: "block",
              padding: "2.5rem 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  color: "var(--text-bright)",
                  letterSpacing: "-0.02em",
                }}
              >
                {essay.title}
              </h2>
            </div>
            {essay.subtitle && (
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.75rem",
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
                fontSize: "0.9375rem",
                lineHeight: 1.9,
                maxWidth: "40rem",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {getExcerpt(essay.content)}...
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: "1rem",
                fontSize: "0.625rem",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-dim)",
              }}
            >
              {essay.date}
            </span>
          </Link>
        ))}
      </section>

      <Footer />
    </main>
  );
}
