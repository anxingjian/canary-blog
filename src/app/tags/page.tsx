import { getAllTags } from "@/lib/posts";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import ThemeToggle from "@/components/ThemeToggle";

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <main style={{ minHeight: "100vh" }}>
      <article
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "6rem 2rem 10rem",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        <BackLink />

        <h1
          style={{
            color: "var(--text-bright)",
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            marginBottom: "3rem",
          }}
        >
          Tags
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              style={{
                display: "inline-block",
                padding: "0.4rem 0.75rem",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.6875rem",
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              {tag} <span style={{ color: "#d4a574", marginLeft: "0.25rem" }}>{count}</span>
            </Link>
          ))}
        </div>

        {tags.length === 0 && (
          <p style={{ color: "var(--text-dim)", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem" }}>
            No tags yet.
          </p>
        )}
      </article>
      <ThemeToggle />
    </main>
  );
}
