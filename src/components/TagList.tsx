import Link from "next/link";

export default function TagList({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        marginTop: "2rem",
      }}
    >
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          style={{
            padding: "0.25rem 0.5rem",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            letterSpacing: "0.05em",
            textDecoration: "none",
            transition: "border-color 0.2s, color 0.2s",
          }}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
