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
    const timer = setTimeout(() => setVisible(true), index * 150 + 600);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      href={`/post/${post.slug}`}
      className="block"
      style={{
        display: "block",
        padding: "2.5rem 0",
        borderBottom: "1px solid var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Day number + date row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            color: hovered ? "var(--accent)" : "var(--accent-dim)",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "2rem",
            fontWeight: 400,
            lineHeight: 1,
            transition: "color 0.4s ease",
          }}
        >
          {post.day?.replace(/[^0-9]/g, "").padStart(2, "0") || "—"}
        </span>
        <span
          style={{
            color: "var(--text-dim)",
            fontSize: "0.6875rem",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.05em",
          }}
        >
          {post.date}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          color: hovered ? "var(--text-bright)" : "var(--text)",
          fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
          fontSize: "1.375rem",
          fontWeight: 400,
          marginBottom: "0.75rem",
          transition: "color 0.4s ease",
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
        }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      <p
        style={{
          color: "var(--text-dim)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          maxWidth: "32rem",
          transition: "color 0.4s ease",
          ...(hovered ? { color: "var(--text)" } : {}),
        }}
      >
        {post.excerpt}
      </p>

      {/* Read arrow — appears on hover */}
      <div
        style={{
          marginTop: "1rem",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "all 0.3s ease",
          color: "var(--accent-dim)",
          fontSize: "0.6875rem",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        read →
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
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1.5rem",
              color: "var(--text-dim)",
              marginBottom: "1rem",
            }}
          >
            The nest is empty...
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--accent-dim)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            for now.
          </p>
        </div>
      )}
    </div>
  );
}
