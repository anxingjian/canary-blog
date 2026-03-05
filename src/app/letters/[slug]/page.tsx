import { getLetter, getAllLetters } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return getAllLetters().map((l) => ({ slug: l.slug }));
}

export default async function LetterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const letter = getLetter(slug);
  if (!letter) notFound();

  const html = letter.content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^(?!<[huplobr])((?!<\/)[^\n<].+)$/gm, '<p class="post-p">$1</p>')
    .replace(/\n{2,}/g, "\n");

  return (
    <main style={{ minHeight: "100vh" }}>
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

      <article
        style={{
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "8rem 2rem 10rem",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        <Link
          href="/letters"
          style={{
            color: "var(--text-dim)",
            fontSize: "0.5625rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.15em",
            textDecoration: "none",
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: "4rem",
          }}
        >
          ← LETTERS
        </Link>

        <header style={{ marginBottom: "4rem" }}>
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "1.5rem",
            }}
          >
            {letter.date}
          </span>

          <div
            style={{
              marginTop: "1rem",
              height: "1px",
              background: "linear-gradient(90deg, var(--accent), transparent)",
              maxWidth: "3rem",
            }}
          />
        </header>

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ lineHeight: 2.2 }}
        />

        <div
          style={{
            marginTop: "6rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            textAlign: "right",
          }}
        >
          <span
            style={{
              color: "var(--accent-dim)",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
            }}
          >
            —C
          </span>
        </div>
      </article>
    </main>
  );
}
