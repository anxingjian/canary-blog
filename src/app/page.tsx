import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Hero from "@/components/Hero";

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

      {/* Hero with GSAP animations */}
      <Hero />

      {/* Spacer before entries */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 2.5rem" }} />

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
