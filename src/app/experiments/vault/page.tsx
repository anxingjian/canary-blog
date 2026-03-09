"use client";

import { useState, useMemo } from "react";

/*
 * Vault — Design Inspiration Collection
 * Lookbook style: big images + text side by side, alternating.
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
    id: "wisprflow", name: "Wispr Flow", url: "https://wisprflow.ai",
    desc: "Voice-to-text AI",
    why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，全页只有一条曲线在动。",
    tags: ["typography", "animation", "landing"],
    thumb: "/canary-blog/vault/wisprflow-ai.jpg", date: "2026-03-09",
  },
  {
    id: "shopify-editions", name: "Shopify Editions", url: "https://www.shopify.com/editions",
    desc: "产品发布页，每期独立设计语言",
    why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜。每期封面字体/配色/风格完全不同。把产品更新日志做成收藏体验。",
    tags: ["interaction", "editorial"],
    thumb: "/canary-blog/vault/www-shopify-com-editions.jpg", date: "2026-03-09",
  },
  {
    id: "toddham", name: "Todd Ham", url: "https://toddham.com",
    desc: "Digital Physicality",
    why: "Three.js 全场景 3D portfolio。复古 Macintosh 3D 模型，实物质感。Cormorant Garamond + Google Sans Code + Inter Tight。3D 实物与 UI 的融合。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/toddham-com.jpg", date: "2026-03-08",
  },
  {
    id: "laxspace", name: "LAX Space", url: "https://laxspace.co",
    desc: "DESIGN—CODE 的视觉平衡",
    why: "Next.js + Three.js，项目展示贴在 3D 胶带上旋转。首页 3D 物体作为项目载体。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/laxspace-co.jpg", date: "2026-03-08",
  },
  {
    id: "katalog", name: "Katalog Barbara Iweins", url: "https://katalog-barbaraiweins.com",
    desc: "个人物品数字孪生目录",
    why: "把一个人所有物品做成可浏览的数字目录。",
    tags: ["concept"],
    thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg", date: "2026-03-08",
  },
  {
    id: "elevenlabs-music", name: "ElevenLabs Music", url: "https://elevenlabs.io/music",
    desc: "AI 音乐生成",
    why: "Hero 区域环形旋转 gallery，沉浸感强。",
    tags: ["animation", "landing"],
    thumb: "/canary-blog/vault/elevenlabs-io-music.jpg", date: "2026-03-08",
  },
  {
    id: "abhijitrout", name: "Abhijit Rout", url: "https://abhijitrout.in",
    desc: "设计师 portfolio",
    why: "顶部一排 + 滚动时的视差/动画效果。",
    tags: ["portfolio", "animation"],
    thumb: "/canary-blog/vault/abhijitrout-in.jpg", date: "2026-03-08",
  },
  {
    id: "vemula", name: "Vemula", url: "https://vemula.me",
    desc: "卡片交互式 portfolio",
    why: "桌面/移动端不同的卡片交互方式。",
    tags: ["portfolio", "interaction"],
    thumb: "/canary-blog/vault/vemula-me.jpg", date: "2026-03-08",
  },
  {
    id: "lorenzodaldosso", name: "Lorenzo Dal Dosso", url: "https://lorenzodaldosso.it",
    desc: "意大利设计师 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "typography"],
    thumb: "/canary-blog/vault/lorenzodaldosso-it.jpg", date: "2026-03-05",
  },
  {
    id: "huyml", name: "Huy Mai Le", url: "https://huyml.co",
    desc: "设计师个人站",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio"],
    thumb: "/canary-blog/vault/huyml-co.jpg", date: "2026-03-05",
  },
  {
    id: "henryheffernan", name: "Henry Heffernan", url: "https://henryheffernan.com",
    desc: "创意开发者 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "3d"],
    thumb: "/canary-blog/vault/henryheffernan-com.jpg", date: "2026-03-05",
  },
  {
    id: "cathydolle", name: "Cathy Dolle", url: "https://cathydolle.com",
    desc: "设计师 portfolio",
    why: "Blog 视觉改版灵感来源之一。",
    tags: ["portfolio", "typography"],
    thumb: "/canary-blog/vault/cathydolle-com.jpg", date: "2026-03-05",
  },
  {
    id: "godly", name: "Godly", url: "https://godly.website",
    desc: "前沿网页设计灵感合集",
    why: "设计灵感聚合站，收录最新最好的网页设计。",
    tags: ["resource"],
    thumb: "/canary-blog/vault/godly-website.jpg", date: "2026-03-05",
  },
  {
    id: "apple", name: "Apple", url: "https://www.apple.com",
    desc: "克制、空间感、字体层级的标杆",
    why: "极致的克制和空间感，字体层级清晰，动效恰到好处。",
    tags: ["typography", "animation"],
    thumb: "/canary-blog/vault/www-apple-com.jpg", date: "2026-03-08",
  },
  {
    id: "basicagency", name: "Basic Agency", url: "https://www.basicagency.com",
    desc: "创意排版，大胆但有控制",
    why: "创意排版的尺度感——大胆但不失控。",
    tags: ["editorial", "typography"],
    thumb: "/canary-blog/vault/www-basicagency-com.jpg", date: "2026-03-08",
  },
];

const ALL_TAGS = [...new Set(ENTRIES.flatMap(e => e.tags))].sort();

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f6f3",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(247,246,243,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap",
        }}>
          <a href="/canary-blog/experiments" style={{
            textDecoration: "none", color: "#aaa", fontSize: "0.85rem",
          }}>←</a>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a" }}>Vault</span>
          <span style={{ fontSize: "0.8rem", color: "#bbb" }}>{filtered.length} sites</span>
          <div style={{ flex: 1 }} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width: 160, padding: "0.4rem 0.65rem",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid transparent", borderRadius: 6,
              color: "#333", fontSize: "0.85rem", outline: "none",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#ccc"}
            onBlur={e => e.currentTarget.style.borderColor = "transparent"}
          />
        </div>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 1.5rem 0.6rem",
          display: "flex", gap: "0.4rem", flexWrap: "wrap",
        }}>
          {ALL_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={{
              padding: "0.2rem 0.6rem", borderRadius: 20,
              border: `1px solid ${activeTag === tag ? "#1a1a1a" : "rgba(0,0,0,0.1)"}`,
              background: activeTag === tag ? "#1a1a1a" : "transparent",
              color: activeTag === tag ? "#fff" : "#777",
              fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
            }}>{tag}</button>
          ))}
          {activeTag && (
            <button onClick={() => setActiveTag(null)} style={{
              padding: "0.2rem 0.6rem", borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "transparent", color: "#aaa",
              fontSize: "0.8rem", cursor: "pointer",
            }}>✕</button>
          )}
        </div>
      </header>

      {/* Items */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {filtered.map((entry, i) => {
          const isEven = i % 2 === 0;
          const isHovered = hoveredId === entry.id;
          return (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="vault-item"
              style={{
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                gap: "2.5rem",
                alignItems: "center",
                textDecoration: "none",
                padding: "2rem 0",
                borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Image side */}
              <div style={{
                flex: "0 0 55%",
                borderRadius: 8,
                overflow: "hidden",
                aspectRatio: "16/10",
                position: "relative",
                boxShadow: isHovered
                  ? "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)"
                  : "0 4px 20px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.thumb} alt={entry.name} loading="lazy"
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                    transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    transform: isHovered ? "scale(1.03)" : "scale(1)",
                  }}
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = "none";
                    t.parentElement!.style.background = "#e8e7e3";
                  }}
                />
              </div>

              {/* Text side */}
              <div style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                justifyContent: "center",
                gap: "0.6rem",
              }}>
                {/* Number + date */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 500,
                    color: "#ccc",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: "0.75rem", color: "#ccc" }}>·</span>
                  <span style={{ fontSize: "0.75rem", color: "#ccc" }}>{entry.date}</span>
                </div>

                {/* Name */}
                <h2 style={{
                  fontSize: "1.5rem", fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0, letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  transition: "color 0.3s",
                  ...(isHovered ? { color: "#555" } : {}),
                }}>{entry.name}</h2>

                {/* Desc */}
                <p style={{
                  fontSize: "0.9rem", color: "#888",
                  margin: 0, lineHeight: 1.5,
                }}>{entry.desc}</p>

                {/* Why */}
                <p style={{
                  fontSize: "0.9rem", color: "#555",
                  margin: 0, lineHeight: 1.7,
                }}>{entry.why}</p>

                {/* Tags */}
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                  {entry.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: "0.75rem", fontWeight: 500,
                      color: "#999",
                      background: "rgba(0,0,0,0.04)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: 4,
                    }}>{tag}</span>
                  ))}
                </div>

                {/* URL hint */}
                <span style={{
                  fontSize: "0.75rem", color: "#bbb",
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "translateX(0)" : "translateX(-4px)",
                  transition: "all 0.3s ease",
                }}>↗ {entry.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
              </div>
            </a>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "6rem 0", color: "#bbb", fontSize: "0.9rem" }}>
            没有匹配的结果
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder { color: #aaa; }
        * { box-sizing: border-box; margin: 0; }

        @media (max-width: 768px) {
          .vault-item {
            flex-direction: column !important;
            gap: 1.25rem !important;
          }
          .vault-item > div:first-child {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
