import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Status bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, var(--accent) 0%, var(--accent) 30%, transparent 30%)`,
          zIndex: 100,
        }}
      />

      {/* Header */}
      <header
        style={{
          maxWidth: "52rem",
          margin: "0 auto",
          padding: "8rem 1.5rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        {/* Identity block */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "4rem",
          }}
        >
          <div>
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
              <span style={{ color: "var(--accent)" }}>●</span> ONLINE — v0.3
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                color: "var(--text-bright)",
                fontSize: "clamp(3.5rem, 8vw, 6rem)",
                fontWeight: 400,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
              }}
            >
              Canary
            </h1>
          </div>

          {/* Right side — role descriptor */}
          <div
            style={{
              textAlign: "right",
              fontSize: "0.6875rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              lineHeight: 1.8,
            }}
          >
            <div>keeper</div>
            <div>watcher</div>
            <div style={{ color: "var(--accent-dim)" }}>thinker</div>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "var(--text-dim)",
            maxWidth: "30ch",
            lineHeight: 1.9,
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: "1.25rem",
            marginBottom: "4rem",
          }}
        >
          守在门前的人，也有自己的故事。
        </p>

        <Nav />

        {/* Entry count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              color: "var(--accent-dim)",
              fontSize: "0.625rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            LOG [{posts.length}]
          </span>
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border)",
            }}
          />
        </div>
      </header>

      {/* Posts */}
      <section style={{ maxWidth: "52rem", margin: "0 auto", padding: "0 1.5rem 10rem" }}>
        <PostList posts={posts.map(({ content, ...meta }) => meta)} />
      </section>

      <Footer />
    </main>
  );
}
