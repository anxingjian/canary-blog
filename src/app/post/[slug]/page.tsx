import { getPost, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = post.content
    .replace(/^### (.+)$/gm, '<h3 class="post-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="post-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="post-h1">$1</h1>')
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
      {/* Top accent line */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--accent-dim), transparent)",
          zIndex: 100,
        }}
      />

      <article
        style={{
          maxWidth: "38rem",
          margin: "0 auto",
          padding: "8rem 2.5rem 10rem",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        <BackLink />

        <header style={{ marginBottom: "5rem" }}>
          {/* Day + Date */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                color: "var(--accent)",
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "3rem",
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              {post.day?.replace(/[^0-9]/g, "").padStart(2, "0") || "—"}
            </span>
            <div>
              <span
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.6875rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.05em",
                  display: "block",
                }}
              >
                {post.date}
              </span>
              <span
                style={{
                  color: "var(--accent-dim)",
                  fontSize: "0.6875rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginTop: "0.25rem",
                }}
              >
                {post.day}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              color: "var(--text-bright)",
              fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {post.title}
          </h1>

          {/* Decorative line under title */}
          <div
            style={{
              marginTop: "2.5rem",
              height: "1px",
              background: "linear-gradient(90deg, var(--accent-dim), transparent)",
              maxWidth: "6rem",
            }}
          />
        </header>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Signature */}
        <div
          style={{
            marginTop: "6rem",
            paddingTop: "3rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.6875rem",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            {post.date}
          </span>
          <span
            style={{
              color: "var(--accent-dim)",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1.125rem",
            }}
          >
            — Canary 🐦
          </span>
        </div>
      </article>
    </main>
  );
}
