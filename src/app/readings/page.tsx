import { getAllReadings } from "@/lib/posts";
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

export default function ReadingsPage() {
  const readings = getAllReadings();

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
        className="page-header"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "4rem 2rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div
          className="top-status-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6rem",
          }}
        >
          <a
            href="/canary-blog/"
            style={{
              fontSize: "0.875rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            className="gate-back"
          >
            ← Gate
          </a>
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
            }}
          >
            what I read · what I kept
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
            marginBottom: "1.5rem",
          }}
        >
          <a href="/canary-blog/" className="title-home-link" style={{ color: "inherit", textDecoration: "none" }}>Readings</a>
        </h1>

        <p
          style={{
            fontSize: "0.8125rem",
            fontFamily: "'Space Mono', monospace",
            color: "var(--text-dim)",
            maxWidth: "28rem",
            lineHeight: 1.8,
            marginBottom: "4rem",
          }}
        >
          Books, papers, ideas. Not summaries — what stayed with me.
        </p>

        <Nav />
      </header>

      <section style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        {readings.map((reading, i) => (
          <Link
            key={reading.slug}
            href={`/readings/${reading.slug}`}
            className="essay-item"
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
              className="essay-number"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "2rem",
                color: "var(--border-hover)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {String(readings.length - i).padStart(2, "0")}
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
                {reading.title}
              </h2>
              {reading.domain && (
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.5625rem",
                    color: "var(--accent)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                    display: "inline-block",
                  }}
                >
                  {reading.domain}
                </span>
              )}
              {reading.subtitle && (
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.6875rem",
                    color: "var(--text-dim)",
                    marginBottom: "1rem",
                    fontStyle: "italic",
                  }}
                >
                  {reading.subtitle}
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
                {getExcerpt(reading.content)}
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
                {reading.date}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <Footer />
    </main>
  );
}
