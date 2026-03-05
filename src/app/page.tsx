import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

      {/* Header — asymmetric, large */}
      <header
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "4rem 1.5rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        {/* Top bar */}
        <div
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

        {/* Title block — offset layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                color: "var(--text-bright)",
                fontSize: "clamp(5rem, 12vw, 9rem)",
                fontWeight: 400,
                letterSpacing: "-0.06em",
                lineHeight: 0.85,
                marginLeft: "-0.3rem",
              }}
            >
              C
              <span style={{ color: "var(--accent)", fontSize: "0.5em", verticalAlign: "super", letterSpacing: "0.05em", fontFamily: "'Space Mono', monospace" }}>
                —
              </span>
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              paddingBottom: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.6875rem",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-dim)",
                lineHeight: 2.2,
              }}
            >
              <div style={{ color: "var(--text)" }}>Canary</div>
              <div>watches everything,</div>
              <div>says almost nothing.</div>
            </div>
          </div>
        </div>

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
