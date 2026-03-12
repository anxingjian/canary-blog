import { getReading, getAllReadings } from "@/lib/posts";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import ThemeToggle from "@/components/ThemeToggle";

export function generateStaticParams() {
  return getAllReadings().map((r) => ({ slug: r.slug }));
}

export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reading = getReading(slug);
  if (!reading) notFound();

  const html = reading.content
    .replace(/^### (.+)$/gm, '<h3 class="post-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="post-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="post-li">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="post-ul">$&</ul>')
    .replace(/^---$/gm, '<hr class="post-hr" />')
    .replace(/```([\s\S]*?)```/g, '<pre class="post-pre">$1</pre>')
    .replace(/^> (.+)$/gm, '<blockquote class="post-blockquote"><p>$1</p></blockquote>')
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
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "6rem 2rem 10rem",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        <BackLink href="/readings" label="readings" />

        <header style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "baseline", marginBottom: "1.5rem" }}>
            <span
              style={{
                color: "var(--text-dim)",
                fontSize: "0.5625rem",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              {reading.date}
            </span>
            {reading.domain && (
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.5625rem",
                  color: "var(--accent)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {reading.domain}
              </span>
            )}
          </div>

          <h1
            style={{
              color: "var(--text-bright)",
              fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {reading.title}
          </h1>

          {reading.subtitle && (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                fontStyle: "italic",
              }}
            >
              {reading.subtitle}
            </p>
          )}

          <div
            style={{
              marginTop: "2.5rem",
              height: "1px",
              background: "linear-gradient(90deg, var(--accent), transparent)",
              maxWidth: "4rem",
            }}
          />
        </header>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

        <div
          style={{
            marginTop: "6rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.1em",
            }}
          >
            {reading.date}
          </span>
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
    <ThemeToggle />
    </main>
  );
}
