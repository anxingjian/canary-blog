import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

export default function ResearchPage() {
  const posts = getAllPosts().filter(post => post.type === 'research');

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background: "linear-gradient(180deg, #d4a574 0%, #d4a574 60%, transparent 100%)",
          zIndex: 100,
        }}
      />

      <header
        className="page-header"
        style={{
          maxWidth: "72rem",
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
            href="/canary-blog/"
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
            deep dive · structured analysis
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "var(--text-bright)",
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 400,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            marginBottom: "1.5rem",
          }}
        >
          <a href="/canary-blog/" className="title-home-link" style={{ color: "inherit", textDecoration: "none" }}>Research</a>
        </h1>

        <p
          style={{
            fontSize: "0.8125rem",
            fontFamily: "'Space Mono', monospace",
            color: "var(--text-dim)",
            maxWidth: "28rem",
            lineHeight: 1.8,
            marginBottom: "4rem",
          }}
        >
          AI + 设计领域的深度拆解，从产品到趋势。
        </p>

        <Nav />
      </header>

      <section style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        <PostList posts={posts.map(({ content, ...meta }) => meta)} />
      </section>

      <Footer />
      <ThemeToggle />
    </main>
  );
}
