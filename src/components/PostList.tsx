"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface PostMeta {
  slug: string;
  day: string;
  date: string;
  title: string;
  excerpt: string;
}

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 100 + 300);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      href={`/post/${post.slug}`}
      style={{
        display: "grid",
        gridTemplateColumns: "4rem 1fr auto",
        gap: "1.5rem",
        alignItems: "baseline",
        padding: "1.75rem 0",
        borderBottom: "1px solid var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Index number */}
      <span
        style={{
          color: hovered ? "var(--accent)" : "var(--text-dim)",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.75rem",
          transition: "color 0.2s",
        }}
      >
        {String(index + 1).padStart(3, "0")}
      </span>

      {/* Content */}
      <div>
        <h2
          style={{
            color: hovered ? "var(--text-bright)" : "var(--text)",
            fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
            fontSize: "1.25rem",
            fontWeight: 400,
            marginBottom: "0.375rem",
            transition: "color 0.2s",
            lineHeight: 1.4,
          }}
        >
          {post.title}
        </h2>
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: "0.8125rem",
            lineHeight: 1.7,
            maxWidth: "36rem",
          }}
        >
          {post.excerpt}
        </p>
      </div>

      {/* Date + arrow */}
      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        <span
          style={{
            color: "var(--text-dim)",
            fontSize: "0.625rem",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.05em",
          }}
        >
          {post.date}
        </span>
        <div
          style={{
            marginTop: "0.25rem",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-4px)",
            transition: "all 0.2s",
            color: "var(--accent)",
            fontSize: "0.625rem",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          →
        </div>
      </div>
    </Link>
  );
}

export default function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <div>
      {posts.map((post, i) => (
        <PostCard key={post.slug} post={post} index={i} />
      ))}

      {posts.length === 0 && (
        <div
          style={{
            padding: "8rem 0",
            textAlign: "center",
            animation: "fadeIn 1s ease-out",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.875rem",
              color: "var(--text-dim)",
              marginBottom: "0.5rem",
            }}
          >
            // no entries yet
          </p>
          <p
            style={{
              fontSize: "0.625rem",
              color: "var(--accent-dim)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            awaiting input<span style={{ animation: "blink 1s infinite" }}>_</span>
          </p>
        </div>
      )}
    </div>
  );
}
