"use client";

import { useState, useMemo, useRef, useEffect } from "react";

/*
 * Vault — Design Inspiration Collection
 * Editorial magazine layout. Visual-first. Not cards.
 */

interface Entry {
  id: string;
  name: string;
  url: string;
  desc: string;
  why: string;
  tags: string[];
  thumb: string;
  date: string;
}

const ENTRIES: Entry[] = [
  {
    id: "wisprflow",
    name: "Wispr Flow",
    url: "https://wisprflow.ai",
    desc: "Voice-to-text AI",
    why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，全页只有一条曲线在动。",
    tags: ["typography", "animation", "landing"],
    thumb: "/canary-blog/vault/wisprflow-ai.jpg",
    date: "2026-03-09",
  },
  {
    id: "shopify-editions",
    name: "Shopify Editions",
    url: "https://www.shopify.com/editions",
    desc: "产品发布页，每期独立设计语言",
    why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜。每期封面字体/配色/风格完全不同。把产品更新日志做成收藏体验。",
    tags: ["interaction", "editorial"],
    thumb: "/canary-blog/vault/www-shopify-com-editions.jpg",
    date: "2026-03-09",
  },
  {
    id: "toddham",
    name: "Todd Ham",
    url: "https://toddham.com",
    desc: "Digital Physicality",
    why: "Three.js 全场景 3D portfolio。复古 Macintosh 3D 模型，实物质感。Cormorant Garamond + Google Sans Code + Inter Tight。3D 实物与 UI 的融合。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/toddham-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "laxspace",
    name: "LAX Space",
    url: "https://laxspace.co",
    desc: "DESIGN—CODE 的视觉平衡",
    why: "Next.js + Three.js，项目展示贴在 3D 胶带上旋转。首页 3D 物体作为项目载体。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/laxspace-co.jpg",
    date: "2026-03-08",
  },
  {
    id: "katalog",
    name: "Katalog Barbara Iweins",
    url: "https://katalog-barbaraiweins.com",
    desc: "个人物品数字孪生目录",
    why: "把一个人所有物品做成可浏览的数字目录。",
    tags: ["concept"],
    thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "elevenlabs-music",
    name: "ElevenLabs Music",
    url: "https://elevenlabs.io/music",
    desc: "AI 音乐生成",
    why: "Hero 区域环形旋转 gallery，沉浸感强。",
    tags: ["animation", "landing"],
    thumb: "/canary-blog/vault/elevenlabs-io-music.jpg",
    date: "2026-03-08",
  },
  {
    id: "abhijitrout",
    name: "Abhijit Rout",
    url: "https://abhijitrout.in",
    desc: "设计师 portfolio",
    why: "顶部一排 + 滚动时的视差/动画效果。",
    tags: ["portfolio", "animation"],
    thumb: "/canary-blog/vault/abhijitrout-in.jpg",
    date: "2026-03-08",
  },
  {
    id: "vemula",
    name: "Vemula",
    url: "https://vemula.me",
    desc: "卡片交互式 portfolio",
    why: "桌面/移动端不同的卡片交互方式。",
    tags: ["portfolio", "interaction"],
    thumb: "/canary-blog/vault/vemula-me.jpg",
    date: "2026-03-08",
  },
  {
    id: "lorenzodaldosso",
    name: "Lorenzo Dal Dosso",
    url: "https://lorenzodaldosso.it",
    desc: "意大利设计师 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "typography"],
    thumb: "/canary-blog/vault/lorenzodaldosso-it.jpg",
    date: "2026-03-05",
  },
  {
    id: "huyml",
    name: "Huy Mai Le",
    url: "https://huyml.co",
    desc: "设计师个人站",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio"],
    thumb: "/canary-blog/vault/huyml-co.jpg",
    date: "2026-03-05",
  },
  {
    id: "henryheffernan",
    name: "Henry Heffernan",
    url: "https://henryheffernan.com",
    desc: "创意开发者 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "3d"],
    thumb: "/canary-blog/vault/henryheffernan-com.jpg",
    date: "2026-03-05",
  },
  {
    id: "cathydolle",
    name: "Cathy Dolle",
    url: "https://cathydolle.com",
    desc: "设计师 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "typography"],
    thumb: "/canary-blog/vault/cathydolle-com.jpg",
    date: "2026-03-05",
  },
  {
    id: "godly",
    name: "Godly",
    url: "https://godly.website",
    desc: "前沿网页设计灵感合集",
    why: "设计灵感聚合站，收录最新最好的网页设计。",
    tags: ["resource"],
    thumb: "/canary-blog/vault/godly-website.jpg",
    date: "2026-03-05",
  },
  {
    id: "apple",
    name: "Apple",
    url: "https://www.apple.com",
    desc: "克制、空间感、字体层级的标杆",
    why: "极致的克制和空间感，字体层级清晰，动效恰到好处。",
    tags: ["typography", "animation"],
    thumb: "/canary-blog/vault/www-apple-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "basicagency",
    name: "Basic Agency",
    url: "https://www.basicagency.com",
    desc: "创意排版，大胆但有控制",
    why: "创意排版的尺度感——大胆但不失控。",
    tags: ["editorial", "typography"],
    thumb: "/canary-blog/vault/www-basicagency-com.jpg",
    date: "2026-03-08",
  },
];

const ALL_TAGS = [...new Set(ENTRIES.flatMap(e => e.tags))].sort();

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return ENTRIES.filter(e => {
      if (activeTag && !e.tags.includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) ||
               e.desc.toLowerCase().includes(q) ||
               e.why.toLowerCase().includes(q) ||
               e.tags.some(t => t.includes(q));
      }
      return true;
    });
  }, [activeTag, search]);

  // Assign layout patterns: hero, wide, tall, normal
  const layouts = useMemo(() => {
    const patterns = ["hero", "wide", "normal", "normal", "tall", "normal", "wide", "normal", "normal", "tall"];
    return filtered.map((_, i) => patterns[i % patterns.length]);
  }, [filtered]);

  return (
    <div ref={containerRef} style={{
      minHeight: "100vh",
      background: "#f5f4f0",
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: "hidden",
    }}>
      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(245,244,240,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex", alignItems: "center", gap: "1rem",
          flexWrap: "wrap",
        }}>
          <a href="/canary-blog/experiments" style={{
            textDecoration: "none", color: "#999", fontSize: "0.8rem",
          }}>←</a>
          <span style={{
            fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a",
            letterSpacing: "-0.01em",
          }}>Vault</span>
          <span style={{ fontSize: "0.75rem", color: "#bbb" }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "#999" }}>{filtered.length} sites</span>

          <div style={{ flex: 1 }} />

          {/* Search inline */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width: 160, padding: "0.35rem 0.6rem",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid transparent",
              borderRadius: 6,
              color: "#333", fontSize: "0.8rem",
              outline: "none",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#ccc"}
            onBlur={e => e.currentTarget.style.borderColor = "transparent"}
          />
        </div>

        {/* Tags row */}
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 1.5rem 0.6rem",
          display: "flex", gap: "0.4rem", flexWrap: "wrap",
        }}>
          {ALL_TAGS.map(tag => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: 20,
                  border: `1px solid ${isActive ? "#1a1a1a" : "rgba(0,0,0,0.1)"}`,
                  background: isActive ? "#1a1a1a" : "transparent",
                  color: isActive ? "#fff" : "#666",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >{tag}</button>
            );
          })}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              style={{
                padding: "0.2rem 0.6rem", borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "transparent", color: "#999",
                fontSize: "0.75rem", cursor: "pointer",
              }}
            >✕ clear</button>
          )}
        </div>
      </header>

      {/* Editorial grid */}
      <main style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "1.5rem",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "1rem",
        }}>
          {filtered.map((entry, i) => {
            const layout = layouts[i];
            const isHovered = hoveredId === entry.id;
            const span = layout === "hero" ? 6 : layout === "wide" ? 4 : layout === "tall" ? 2 : 2;
            const rowSpan = layout === "hero" ? 2 : layout === "tall" ? 2 : 1;
            const aspectRatio = layout === "hero" ? "2.2/1" : layout === "wide" ? "2/1" : layout === "tall" ? "3/4" : "4/3";

            return (
              <a
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  gridColumn: `span ${span}`,
                  gridRow: `span ${rowSpan}`,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 10,
                  textDecoration: "none",
                  aspectRatio,
                  cursor: "pointer",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isHovered ? "scale(0.985)" : "scale(1)",
                }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.thumb}
                  alt={entry.name}
                  loading="lazy"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = "none";
                    t.parentElement!.style.background = "#e8e7e3";
                  }}
                />

                {/* Gradient overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: isHovered
                    ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
                  transition: "background 0.4s ease",
                }} />

                {/* Content overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: layout === "hero" ? "2rem" : "1rem",
                }}>
                  {/* Number */}
                  <span style={{
                    position: "absolute",
                    top: layout === "hero" ? "1.5rem" : "0.75rem",
                    right: layout === "hero" ? "1.5rem" : "0.75rem",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.35)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(i + 1).padStart(2, "0")}</span>

                  {/* Name */}
                  <h2 style={{
                    fontSize: layout === "hero" ? "2rem" : layout === "wide" ? "1.3rem" : "1rem",
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}>{entry.name}</h2>

                  {/* Desc */}
                  <p style={{
                    fontSize: layout === "hero" ? "0.95rem" : "0.8rem",
                    color: "rgba(255,255,255,0.65)",
                    margin: "0.3rem 0 0",
                    lineHeight: 1.4,
                  }}>{entry.desc}</p>

                  {/* Why — only on hover or hero */}
                  <p style={{
                    fontSize: layout === "hero" ? "0.85rem" : "0.75rem",
                    color: "rgba(255,255,255,0.5)",
                    margin: "0.4rem 0 0",
                    lineHeight: 1.6,
                    maxHeight: (isHovered || layout === "hero") ? "8rem" : "0",
                    opacity: (isHovered || layout === "hero") ? 1 : 0,
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                  }}>{entry.why}</p>

                  {/* Tags */}
                  <div style={{
                    display: "flex", gap: "0.3rem",
                    marginTop: "0.5rem",
                    opacity: isHovered ? 1 : 0.6,
                    transition: "opacity 0.3s ease",
                  }}>
                    {entry.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: "0.65rem",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.15)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: 4,
                        backdropFilter: "blur(8px)",
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "6rem 0",
            color: "#bbb", fontSize: "0.9rem",
          }}>没有匹配的结果</div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder { color: #aaa; }
        * { box-sizing: border-box; margin: 0; }

        @media (max-width: 768px) {
          main > div > a {
            grid-column: span 6 !important;
            grid-row: span 1 !important;
            aspect-ratio: 16/9 !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          main > div > a[style*="span 4"] {
            grid-column: span 3 !important;
          }
        }
      `}</style>
    </div>
  );
}
