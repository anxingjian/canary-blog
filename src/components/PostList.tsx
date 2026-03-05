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
    const timer = setTimeout(() => setVisible(true), index * 80 + 200);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      href={`/post/${post.slug}`}
      style={{
        display: "grid",
        gridTemplateColumns: "4.5rem 1fr auto",
        gap: "1.5rem",
        alignItems: "start",
        padding: "2.5rem 0",
        borderBottom: "1px solid var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Day number — large */}
      <div
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "2.5rem",
          fontWeight: 400,
          color: hovered ? "var(--accent)" : "var(--border-hover)",
          lineHeight: 1,
          transition: "color 0.3s",
          letterSpacing: "-0.04em",
        }}
      >
        {post.day?.replace(/[^0-9]/g, "").padStart(2, "0") || String(index + 1).padStart(2, "0")}
      </div>

      {/* Content */}
      <div>
        <h2
          style={{
            color: hovered ? "var(--text-bright)" : "var(--text)",
            fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
            fontSize: "1.375rem",
            fontWeight: 400,
            transition: "color 0.2s",
            lineHeight: 1.4,
            marginBottom: "0.625rem",
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h2>
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: "0.8125rem",
            lineHeight: 1.8,
            maxWidth: "32rem",
          }}
        >
          {post.excerpt}
        </p>
      </div>

      {/* Date — right aligned, rotated */}
      <span
        style={{
          color: "var(--text-dim)",
          fontSize: "0.5625rem",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "0.1em",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.2s",
          paddingTop: "0.25rem",
        }}
      >
        {post.date}
      </span>
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
            animation: "fadeIn 1s ease-out",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.75rem",
              color: "var(--text-dim)",
            }}
          >
            // no entries yet
          </p>
          <p
            style={{
              fontSize: "0.5625rem",
              color: "var(--accent-dim)",
              fontFamily: "'Space Mono', monospace",
              marginTop: "0.5rem",
            }}
          >
            awaiting input<span style={{ animation: "blink 1s infinite" }}>_</span>
          </p>
        </div>
      )}
    </div>
  );
}
