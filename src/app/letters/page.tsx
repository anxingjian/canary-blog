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
          width: "1px",
          height: "100vh",
          background: "linear-gradient(180deg, var(--accent-dim) 0%, transparent 60%)",
          zIndex: 100,
        }}
      />

      <div
        style={{
          maxWidth: "36rem",
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
            href="/"
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
            private · channel
          </span>
          <a
            href="/"
            className="mobile-close"
            style={{
              fontSize: "1.25rem",
              color: "var(--text-dim)",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            ✕
          </a>
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "var(--text-bright)",
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 400,
            marginBottom: "0.5rem",
            letterSpacing: "-0.03em",
          }}
        >
          Letters
        </h1>
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            color: "var(--text-dim)",
            fontSize: "0.875rem",
            marginBottom: "5rem",
          }}
        >
          写给安安的信
        </p>

        <div>
          {letters.map((letter, i) => (
            <Link
              key={letter.slug}
              href={`/letters/${letter.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="letter-item"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "1.5rem",
                  padding: "2rem 0",
                  borderTop: i === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "opacity 0.3s",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "2rem",
                    color: "var(--border-hover)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    minWidth: "3rem",
                  }}
                >
                  {String(letters.length - i).padStart(3, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                      fontSize: "1.125rem",
                      color: "var(--text)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {letter.title}
                  </div>
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontFamily: "'Space Mono', monospace",
                      color: "var(--text-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {letter.date}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
          }}
        >
          <p
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              lineHeight: 2,
            }}
          >
            这个页面没有入口。
            <br />
            你找到了，说明你该在这里。
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
