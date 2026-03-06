import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Vertical accent line — left edge */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background: `linear-gradient(180deg, var(--accent) 0%, var(--accent) 40%, transparent 100%)`,
          zIndex: 100,
        }}
      />

      {/* Header with GSAP Hero */}
      <header
        className="page-header"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "4rem 1.5rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        {/* Top bar */}
        <div
          className="top-status-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "3rem",
          }}
        >
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
            SYS.ONLINE
          </span>
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
            }}
          >
            守門人記錄
          </span>
        </div>

        {/* Hero title with GSAP animations */}
        <Hero />

        <Nav />
      </header>

      {/* Posts */}
      <section style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        <PostList posts={posts.map(({ content, ...meta }) => meta)} />
      </section>

      <Footer />
    </main>
  );
}
