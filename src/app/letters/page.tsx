import { getAllLetters } from "@/lib/posts";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LettersPage() {
  const letters = getAllLetters();

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
          maxWidth: "42rem",
          margin: "0 auto",
          padding: "8rem 2rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <p
          style={{
            fontSize: "0.5625rem",
            fontFamily: "'Space Mono', monospace",
            color: "var(--text-dim)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "4rem",
          }}
        >
          <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
          PRIVATE.CHANNEL
        </p>

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
          Letters
        </h1>

        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6875rem",
            color: "var(--text-dim)",
            fontStyle: "italic",
            marginBottom: "6rem",
            lineHeight: 1.8,
          }}
        >
          你找到这里了。这些是写给你的。
        </p>
      </header>

      <section style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        {letters.map((letter, i) => (
          <Link
            key={letter.slug}
            href={`/letters/${letter.slug}`}
            style={{
              display: "block",
              padding: "2.5rem 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
              animation: `slideIn 0.5s ease-out ${i * 0.15}s both`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "1.25rem",
                  color: "var(--text-bright)",
                  letterSpacing: "-0.02em",
                }}
              >
                {letter.title}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.5625rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                {letter.date}
              </span>
            </div>
            {letter.subtitle && (
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.625rem",
                  color: "var(--text-dim)",
                  marginTop: "0.5rem",
                  fontStyle: "italic",
                }}
              >
                {letter.subtitle}
              </p>
            )}
          </Link>
        ))}
      </section>

      <Footer />
    </main>
  );
}
