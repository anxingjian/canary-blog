"use client";

import { useState, useMemo } from "react";

/*
 * Vault — 设计灵感收藏
 * 
 * A curated collection of exceptional web design.
 * Tagged, searchable, visual.
 */

interface InspirationEntry {
  id: string;
  name: string;
  url: string;
  description: string;       // one-liner: what it is
  why: string;               // why it's good — the insight
  tags: string[];
  screenshotUrl?: string;    // optional screenshot path
  date: string;              // when we saved it
}

const ENTRIES: InspirationEntry[] = [
  {
    id: "wisprflow",
    name: "Wispr Flow",
    url: "https://wisprflow.ai",
    description: "Voice-to-text AI product. 语音转文字工具官网。",
    why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，微动效克制到极致——全页只有一条曲线在动。",
    tags: ["typography", "micro-animation", "minimal", "curve-text", "landing-page"],
    date: "2026-03-09",
  },
  {
    id: "shopify-editions",
    name: "Shopify Editions",
    url: "https://www.shopify.com/editions",
    description: "Shopify 半年一次的产品更新发布页，每期独立设计语言。",
    why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜，滑动翻阅。每期封面字体/配色/风格完全不同，像发专辑。桌面端滑动时背景图 transition + 卡片变换。把'产品更新日志'做成了收藏体验。",
    tags: ["scroll-interaction", "3d-cards", "editorial", "multi-style", "product-launch", "storytelling"],
    date: "2026-03-09",
  },
];

const ALL_TAGS = [...new Set(ENTRIES.flatMap(e => e.tags))].sort();

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return ENTRIES.filter(e => {
      if (activeTag && !e.tags.includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) ||
               e.description.toLowerCase().includes(q) ||
               e.why.toLowerCase().includes(q) ||
               e.tags.some(t => t.includes(q));
      }
      return true;
    });
  }, [activeTag, search]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0c",
      color: "rgba(255,250,240,0.8)",
      fontFamily: "'Space Mono', 'SF Mono', monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: "3rem 2rem 2rem",
        maxWidth: 800,
        margin: "0 auto",
      }}>
        <p style={{
          fontSize: "0.6rem",
          color: "rgba(255,250,240,0.15)",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}>Experiments / Vault</p>

        <h1 style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: "1.75rem",
          color: "rgba(255,250,240,0.6)",
          letterSpacing: "0.08em",
          margin: "0 0 0.3rem",
        }}>Vault</h1>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: "0.75rem",
          color: "rgba(255,250,240,0.2)",
          margin: "0 0 2rem",
        }}>好设计的收藏夹。标注灵感点，留存参考。</p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.5rem 0.75rem",
            background: "rgba(255,250,240,0.04)",
            border: "1px solid rgba(255,250,240,0.08)",
            borderRadius: 4,
            color: "rgba(255,250,240,0.7)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.7rem",
            outline: "none",
            marginBottom: "1.25rem",
          }}
        />

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2rem" }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: 20,
              border: `1px solid ${activeTag === null ? "rgba(255,250,240,0.3)" : "rgba(255,250,240,0.08)"}`,
              background: activeTag === null ? "rgba(255,250,240,0.08)" : "transparent",
              color: activeTag === null ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.55rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.2s ease",
            }}
          >All ({ENTRIES.length})</button>
          {ALL_TAGS.map(tag => {
            const count = ENTRIES.filter(e => e.tags.includes(tag)).length;
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                style={{
                  padding: "0.25rem 0.6rem",
                  borderRadius: 20,
                  border: `1px solid ${isActive ? "rgba(255,250,240,0.3)" : "rgba(255,250,240,0.08)"}`,
                  background: isActive ? "rgba(255,250,240,0.08)" : "transparent",
                  color: isActive ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s ease",
                }}
              >{tag} ({count})</button>
            );
          })}
        </div>
      </div>

      {/* Entries */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem 4rem" }}>
        {filtered.length === 0 && (
          <p style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.8rem",
            color: "rgba(255,250,240,0.15)",
            textAlign: "center",
            padding: "3rem 0",
          }}>没有匹配的结果</p>
        )}
        {filtered.map((entry, i) => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,250,240,0.05)" : "none",
              padding: "1.5rem 0",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,250,240,0.02)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Top row: name + date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
              <h2 style={{
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 400,
                fontSize: "1rem",
                color: "rgba(255,250,240,0.6)",
                margin: 0,
                letterSpacing: "0.05em",
              }}>{entry.name}</h2>
              <span style={{
                fontSize: "0.5rem",
                color: "rgba(255,250,240,0.12)",
                letterSpacing: "0.08em",
                flexShrink: 0,
                marginLeft: "1rem",
              }}>{entry.date}</span>
            </div>

            {/* Description */}
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.625rem",
              color: "rgba(255,250,240,0.25)",
              margin: "0 0 0.5rem",
              lineHeight: 1.5,
            }}>{entry.description}</p>

            {/* Why it's good */}
            <p style={{
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 300,
              fontSize: "0.75rem",
              color: "rgba(255,250,240,0.4)",
              margin: "0 0 0.6rem",
              lineHeight: 1.8,
            }}>{entry.why}</p>

            {/* URL + Tags */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "0.5rem",
                color: "rgba(255,250,240,0.18)",
                letterSpacing: "0.03em",
                textDecoration: "underline",
                textDecorationColor: "rgba(255,250,240,0.08)",
                textUnderlineOffset: "2px",
              }}>{entry.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
              <span style={{ color: "rgba(255,250,240,0.08)", fontSize: "0.5rem" }}>·</span>
              {entry.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: "0.5rem",
                  color: "rgba(255,250,240,0.18)",
                  background: "rgba(255,250,240,0.04)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: 10,
                  letterSpacing: "0.03em",
                }}>#{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* Back */}
      <div style={{ textAlign: "center", padding: "0 0 3rem" }}>
        <a
          href="/canary-blog/experiments"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: "rgba(255,250,240,0.12)",
            textDecoration: "none",
          }}
        >← experiments</a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+SC:wght@300;400;500&display=swap');
        input::placeholder { color: rgba(255,250,240,0.15); }
      `}</style>
    </div>
  );
}
