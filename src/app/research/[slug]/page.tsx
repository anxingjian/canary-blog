import { getResearch, getAllResearch } from "@/lib/posts";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingProgress from "@/components/ReadingProgress";
import ScrollToTop from "@/components/ScrollToTop";

export function generateStaticParams() {
  return getAllResearch().map((r) => ({ slug: r.slug }));
}

export default async function ResearchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getResearch(slug);
  if (!post) notFound();

  // Parse markdown tables into HTML
  function parseTables(md: string): string {
    return md.replace(
      /(^\|.+\|\n)(^\|[-| :]+\|\n)((?:^\|.+\|\n?)+)/gm,
      (_match, headerRow: string, _sep: string, bodyRows: string) => {
        const headers = headerRow.trim().split("|").filter(Boolean).map((c: string) => c.trim());
        const rows = bodyRows.trim().split("\n").map((r: string) =>
          r.split("|").filter(Boolean).map((c: string) => c.trim())
        );
        const ths = headers.map((h: string) => `<th>${h}</th>`).join("");
        const trs = rows.map((r: string[]) => `<tr>${r.map((c: string) => `<td>${c}</td>`).join("")}</tr>`).join("");
        return `<div class="table-wrap"><table class="research-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>\n`;
      }
    );
  }

  const html = parseTables(post.content)
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
          background: "linear-gradient(180deg, #d4a574 0%, #d4a574 40%, transparent 100%)",
          zIndex: 100,
        }}
      />

      <article
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "6rem 2rem 10rem",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        <BackLink />

        <header style={{ marginBottom: "5rem" }}>
          {post.rating && (
            <div
              style={{
                display: "inline-block",
                fontSize: "0.625rem",
                fontFamily: "'Space Mono', monospace",
                color: "#d4a574",
                marginBottom: "1rem",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border)",
                letterSpacing: "0.1em",
              }}
            >
              Rating: {post.rating}
            </div>
          )}

          <h1
            style={{
              color: "var(--text-bright)",
              fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            {post.title}
          </h1>

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
            <span>{post.date}</span>
            {post.day && <span>{post.day}</span>}
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              height: "1px",
              background: "linear-gradient(90deg, #d4a574, transparent)",
              maxWidth: "4rem",
            }}
          />
        </header>

        <div className="post-content research-content" dangerouslySetInnerHTML={{ __html: html }} />

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
            {post.date}
          </span>
          <span
            style={{
              color: "#d4a574",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
            }}
          >
            —C
          </span>
        </div>
      </article>
      <ReadingProgress />
      <ScrollToTop />
      <ThemeToggle />
    </main>
  );
}
