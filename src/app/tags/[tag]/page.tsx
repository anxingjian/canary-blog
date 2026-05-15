import { getAllTags, getItemsByTag } from "@/lib/posts";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import ThemeToggle from "@/components/ThemeToggle";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const items = getItemsByTag(decodedTag);

  if (items.length === 0) notFound();

  const typeToPath: Record<string, string> = {
    journal: "/post",
    research: "/research",
    reading: "/readings",
    art: "/arts",
  };

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
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 400,
            marginBottom: "0.5rem",
          }}
        >
          #{decodedTag}
        </h1>

        <p
          style={{
            color: "var(--text-dim)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.625rem",
            letterSpacing: "0.1em",
            marginBottom: "3rem",
          }}
        >
          {items.length} {items.length === 1 ? "post" : "posts"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.slug}`}
              href={`${typeToPath[item.type] || "/post"}/${item.slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                padding: "1rem 0",
                borderBottom: "1px solid var(--border)",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                <span
                  style={{
                    color: "var(--text-bright)",
                    fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                    fontSize: "1.125rem",
                    fontWeight: 400,
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    color: "var(--text-dim)",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.date}
                </span>
              </div>
              <span
                style={{
                  color: "#d4a574",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: "0.25rem",
                  display: "inline-block",
                }}
              >
                {item.type}
              </span>
            </Link>
          ))}
        </div>
      </article>
      <ThemeToggle />
    </main>
  );
}
