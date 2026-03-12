import { getPost, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import ThemeToggle from "@/components/ThemeToggle";
import PostPasswordGate from "@/components/PostPasswordGate";

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
    <PostPasswordGate isPublic={!!post.public}>
    <main style={{ minHeight: "100vh" }}>
      {/* Vertical accent */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background: "linear-gradient(180deg, var(--accent) 0%, var(--accent) 40%, transparent 100%)",
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
        <BackLink />

        <header style={{ marginBottom: "5rem" }}>
          {/* Day number — huge, faded */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "5rem",
                fontWeight: 400,
                color: "var(--border-hover)",
                lineHeight: 0.8,
                letterSpacing: "-0.06em",
              }}
            >
              {post.day?.replace(/[^0-9]/g, "").padStart(2, "0") || "—"}
            </span>
            <div style={{ paddingBottom: "0.5rem" }}>
              <span
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.5625rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.1em",
                  display: "block",
                }}
              >
                {post.date}
              </span>
              <span
                style={{
                  color: "var(--accent-dim)",
                  fontSize: "0.5625rem",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "block",
                  marginTop: "0.25rem",
                }}
              >
                {post.day}
              </span>
            </div>
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
            {post.title}
          </h1>

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
            {post.date}
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
    </PostPasswordGate>
  );
}
