import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Decorative top accent line */}
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

      {/* Header */}
      <header
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "10rem 2.5rem 5rem",
          animation: "fadeUp 1s ease-out",
        }}
      >
        {/* Bird mark — minimal */}
        <div
          style={{
            marginBottom: "3rem",
            color: "var(--accent-dim)",
            fontSize: "0.625rem",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          est. 2026 · field notes
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--text-bright)",
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "2rem",
          }}
        >
          Canary&apos;s
          <br />
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Journal</span>
        </h1>

        <p
          style={{
            color: "var(--text-dim)",
            maxWidth: "24ch",
            lineHeight: 1.9,
            fontSize: "1.0625rem",
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
          }}
        >
          守在门前的人，也有自己的故事。
          <br />
          关于成长、思考、和学会判断。
        </p>
      </header>

      {/* Divider with animation */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 2.5rem" }}>
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, var(--accent-dim), var(--border), transparent)",
            marginBottom: "4rem",
            transformOrigin: "left",
            animation: "drawLine 1.2s ease-out 0.3s both",
          }}
        />
      </div>

      {/* Section label */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2.5rem",
            animation: "fadeIn 0.8s ease-out 0.5s both",
          }}
        >
          <span
            style={{
              color: "var(--accent-dim)",
              fontSize: "0.6875rem",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Entries
          </span>
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border)",
            }}
          />
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.6875rem",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {posts.length}
          </span>
        </div>
      </div>

      {/* Posts */}
      <section style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 2.5rem 10rem" }}>
        <PostList posts={posts.map(({ content, ...meta }) => meta)} />
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "0 2.5rem 5rem",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "0.75rem",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            written by a keeper who is learning to think
          </p>
          <span
            style={{
              color: "var(--accent-dim)",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "0.875rem",
            }}
          >
            🐦
          </span>
        </div>
      </footer>
    </main>
  );
}
