"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";

interface SearchItem {
  type: "journal" | "research" | "reading" | "art";
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  url: string;
}

const TYPE_LABELS: Record<string, string> = {
  journal: "JOURNAL",
  research: "RESEARCH",
  reading: "READING",
  art: "ART",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/canary-blog/search-index.json")
      .then((r) => r.json())
      .then((data) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(
    (q: string): SearchItem[] => {
      if (!q.trim()) return [];
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      return index
        .filter((item) => {
          const haystack = `${item.title} ${item.excerpt} ${item.body}`.toLowerCase();
          return terms.every((t) => haystack.includes(t));
        })
        .slice(0, 30);
    },
    [index]
  );

  const results = search(query);

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background:
            "linear-gradient(180deg, var(--accent) 0%, var(--accent) 90%, transparent 100%)",
          zIndex: 100,
        }}
      />

      <header
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "4rem 2rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-dim)")
            }
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
            {loading ? "loading index…" : `${index.length} entries`}
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
          Search
        </h1>

        <div style={{ marginBottom: "4rem" }}>
          <Nav />
        </div>

        <div
          style={{
            borderBottom: "1px solid var(--border)",
            marginBottom: "3rem",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search…"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.5rem",
              color: "var(--text-bright)",
              padding: "0.75rem 0",
              letterSpacing: "-0.02em",
            }}
          />
        </div>
      </header>

      <section
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 2rem 10rem",
        }}
      >
        {query.trim() && (
          <p
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
              marginBottom: "2rem",
            }}
          >
            {results.length} RESULT{results.length !== 1 ? "S" : ""}
          </p>
        )}

        {results.map((item, i) => (
          <a
            key={`${item.type}-${item.slug}`}
            href={item.url}
            style={{
              display: "block",
              padding: "1.5rem 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
              animation: `slideIn 0.4s ease-out ${i * 0.05}s both`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--bg-hover, rgba(255,255,255,0.03))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "baseline",
                marginBottom: "0.375rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.5625rem",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--accent)",
                  letterSpacing: "0.15em",
                }}
              >
                {TYPE_LABELS[item.type] || item.type.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "0.5625rem",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                {item.date}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                fontSize: "1.25rem",
                fontWeight: 400,
                color: "var(--text-bright)",
                letterSpacing: "-0.02em",
                marginBottom: "0.375rem",
              }}
            >
              {item.title}
            </h2>

            <p
              style={{
                fontSize: "0.8125rem",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-dim)",
                lineHeight: 1.6,
                maxWidth: "40rem",
              }}
            >
              {item.excerpt.slice(0, 150)}
              {item.excerpt.length > 150 ? "…" : ""}
            </p>
          </a>
        ))}

        {query.trim() && results.length === 0 && !loading && (
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.8125rem",
              color: "var(--text-dim)",
              textAlign: "center",
              padding: "4rem 0",
            }}
          >
            No results for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>

      <footer
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 2rem 3rem",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.5rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
            }}
          >
            C://KEEPER.SYS
          </span>
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.5rem",
              fontFamily: "'Space Mono', monospace",
              animation: "blink 2.5s infinite",
            }}
          >
            ▮
          </span>
        </div>
      </footer>
      <ThemeToggle />
    </main>
  );
}
