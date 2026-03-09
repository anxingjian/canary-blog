"use client";

import { useState, useMemo, useRef, useCallback } from "react";

/*
 * Vault — Design Inspiration Collection
 * Desktop: typographic list + cursor-following preview image
 * Mobile: vertical cards
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
  { id: "wisprflow", name: "Wispr Flow", url: "https://wisprflow.ai", desc: "Voice-to-text AI", why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，全页只有一条曲线在动。", tags: ["typography", "animation", "landing"], thumb: "/canary-blog/vault/wisprflow-ai.jpg", date: "2026-03-09" },
  { id: "shopify-editions", name: "Shopify Editions", url: "https://www.shopify.com/editions", desc: "产品发布页，每期独立设计语言", why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜。每期封面字体/配色/风格完全不同。把产品更新日志做成收藏体验。", tags: ["interaction", "editorial"], thumb: "/canary-blog/vault/www-shopify-com-editions.jpg", date: "2026-03-09" },
  { id: "toddham", name: "Todd Ham", url: "https://toddham.com", desc: "Digital Physicality", why: "Three.js 全场景 3D portfolio。复古 Macintosh 3D 模型，实物质感。3D 实物与 UI 的融合。", tags: ["3d", "portfolio"], thumb: "/canary-blog/vault/toddham-com.jpg", date: "2026-03-08" },
  { id: "laxspace", name: "LAX Space", url: "https://laxspace.co", desc: "DESIGN—CODE 的视觉平衡", why: "Next.js + Three.js，项目展示贴在 3D 胶带上旋转。首页 3D 物体作为项目载体。", tags: ["3d", "portfolio"], thumb: "/canary-blog/vault/laxspace-co.jpg", date: "2026-03-08" },
  { id: "katalog", name: "Katalog", url: "https://katalog-barbaraiweins.com", desc: "个人物品数字孪生目录", why: "把一个人所有物品做成可浏览的数字目录。", tags: ["concept"], thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg", date: "2026-03-08" },
  { id: "elevenlabs-music", name: "ElevenLabs Music", url: "https://elevenlabs.io/music", desc: "AI 音乐生成", why: "Hero 区域环形旋转 gallery，沉浸感强。", tags: ["animation", "landing"], thumb: "/canary-blog/vault/elevenlabs-io-music.jpg", date: "2026-03-08" },
  { id: "abhijitrout", name: "Abhijit Rout", url: "https://abhijitrout.in", desc: "设计师 portfolio", why: "顶部一排 + 滚动时的视差/动画效果。", tags: ["portfolio", "animation"], thumb: "/canary-blog/vault/abhijitrout-in.jpg", date: "2026-03-08" },
  { id: "vemula", name: "Vemula", url: "https://vemula.me", desc: "卡片交互式 portfolio", why: "桌面/移动端不同的卡片交互方式。", tags: ["portfolio", "interaction"], thumb: "/canary-blog/vault/vemula-me.jpg", date: "2026-03-08" },
  { id: "lorenzodaldosso", name: "Lorenzo Dal Dosso", url: "https://lorenzodaldosso.it", desc: "意大利设计师 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["portfolio", "typography"], thumb: "/canary-blog/vault/lorenzodaldosso-it.jpg", date: "2026-03-05" },
  { id: "huyml", name: "Huy Mai Le", url: "https://huyml.co", desc: "设计师个人站", why: "Blog 视觉改版灵感来源之一。", tags: ["portfolio"], thumb: "/canary-blog/vault/huyml-co.jpg", date: "2026-03-05" },
  { id: "henryheffernan", name: "Henry Heffernan", url: "https://henryheffernan.com", desc: "创意开发者 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["portfolio", "3d"], thumb: "/canary-blog/vault/henryheffernan-com.jpg", date: "2026-03-05" },
  { id: "cathydolle", name: "Cathy Dolle", url: "https://cathydolle.com", desc: "设计师 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["portfolio", "typography"], thumb: "/canary-blog/vault/cathydolle-com.jpg", date: "2026-03-05" },
  { id: "godly", name: "Godly", url: "https://godly.website", desc: "前沿网页设计灵感合集", why: "设计灵感聚合站，收录最新最好的网页设计。", tags: ["resource"], thumb: "/canary-blog/vault/godly-website.jpg", date: "2026-03-05" },
  { id: "apple", name: "Apple", url: "https://www.apple.com", desc: "克制、空间感、字体层级的标杆", why: "极致的克制和空间感，字体层级清晰，动效恰到好处。", tags: ["typography", "animation"], thumb: "/canary-blog/vault/www-apple-com.jpg", date: "2026-03-08" },
  { id: "basicagency", name: "Basic Agency", url: "https://www.basicagency.com", desc: "创意排版，大胆但有控制", why: "创意排版的尺度感——大胆但不失控。", tags: ["editorial", "typography"], thumb: "/canary-blog/vault/www-basicagency-com.jpg", date: "2026-03-08" },
];

const ALL_TAGS = [...new Set(ENTRIES.flatMap(e => e.tags))].sort();

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const hoveredEntry = hoveredId ? ENTRIES.find(e => e.id === hoveredId) : null;

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        cursor: "default",
      }}
    >
      {/* Floating preview image — desktop only */}
      <div
        ref={previewRef}
        className="vault-preview"
        style={{
          position: "fixed",
          left: mousePos.x + 20,
          top: mousePos.y - 120,
          width: 360,
          aspectRatio: "16/10",
          borderRadius: 8,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1000,
          opacity: hoveredEntry ? 1 : 0,
          transform: hoveredEntry ? "scale(1) rotate(2deg)" : "scale(0.8) rotate(0deg)",
          transition: "opacity 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        {hoveredEntry && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoveredEntry.thumb}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      {/* Nav — minimal */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0.6rem clamp(1rem, 4vw, 2rem)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        <a href="/canary-blog/experiments" style={{
          textDecoration: "none", color: "#aaa", fontSize: "0.85rem",
          pointerEvents: "auto",
        }}>←</a>
        <div style={{ pointerEvents: "auto" }}>
          {searchOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem",
              background: "rgba(242,241,237,0.95)", backdropFilter: "blur(12px)",
              padding: "0.2rem 0.5rem", borderRadius: 20,
            }}>
              <input
                autoFocus type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: 160, padding: "0.35rem 0.5rem",
                  background: "transparent", border: "none",
                  color: "#333", fontSize: "0.85rem", outline: "none",
                }}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                onKeyDown={e => { if (e.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
              />
              <button onClick={() => { setSearch(""); setSearchOpen(false); }} style={{
                background: "none", border: "none", color: "#aaa", fontSize: "0.8rem",
                cursor: "pointer", padding: "0.2rem",
              }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "0.3rem",
              color: "#999",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: "calc(2.5rem + 44px) clamp(1.5rem, 5vw, 4rem) 1.5rem",
      }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(3rem, 10vw, 7rem)",
          fontWeight: 400,
          color: "#1a1a1a",
          margin: 0,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
        }}>Vault</h1>
      </section>

      {/* Tags — horizontal scroll */}
      <div style={{
        position: "sticky", top: 0, zIndex: 90,
        background: "rgba(242,241,237,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{
          display: "flex", gap: "0.35rem",
          padding: "0.6rem clamp(1.5rem, 5vw, 4rem)",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {ALL_TAGS.map(tag => {
            const isActive = activeTag === tag;
            return (
              <button key={tag} onClick={() => setActiveTag(isActive ? null : tag)} style={{
                padding: "0.3rem 0.75rem",
                borderRadius: 24, border: "none",
                background: isActive ? "#1a1a1a" : "rgba(0,0,0,0.05)",
                color: isActive ? "#f2f1ed" : "#888",
                fontSize: "0.8rem", fontWeight: 500,
                cursor: "pointer", flexShrink: 0,
                transition: "all 0.2s ease",
              }}>{tag}</button>
            );
          })}
          <span style={{
            fontSize: "0.75rem", color: "#ccc",
            display: "flex", alignItems: "center",
            paddingLeft: "0.5rem", flexShrink: 0,
          }}>{filtered.length}</span>
        </div>
      </div>

      {/* Desktop: typographic list */}
      <main className="vault-desktop" style={{
        padding: "1rem clamp(1.5rem, 5vw, 4rem) 4rem",
      }}>
        {filtered.map((entry, i) => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1.5rem",
              alignItems: "baseline",
              textDecoration: "none",
              padding: "1.25rem 0",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              transition: "padding-left 0.3s ease",
              paddingLeft: hoveredId === entry.id ? "1rem" : "0",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: 400,
                  color: hoveredId === entry.id ? "#1a1a1a" : "#444",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  transition: "color 0.3s ease",
                  lineHeight: 1.2,
                }}>{entry.name}</h2>
                <span style={{
                  fontSize: "0.85rem",
                  color: hoveredId === entry.id ? "#888" : "#bbb",
                  transition: "color 0.3s ease",
                }}>{entry.desc}</span>
              </div>
              {/* Why — slides in on hover */}
              <p style={{
                fontSize: "0.85rem",
                color: "#888",
                margin: "0.4rem 0 0",
                lineHeight: 1.6,
                maxHeight: hoveredId === entry.id ? "6rem" : "0",
                opacity: hoveredId === entry.id ? 1 : 0,
                overflow: "hidden",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              }}>{entry.why}</p>
            </div>
            <div style={{
              display: "flex", gap: "0.3rem", flexShrink: 0, alignSelf: "center",
            }}>
              {entry.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: "0.7rem", fontWeight: 500,
                  color: "#bbb",
                  background: "rgba(0,0,0,0.03)",
                  padding: "0.15rem 0.45rem",
                  borderRadius: 4,
                  transition: "color 0.3s",
                  ...(hoveredId === entry.id ? { color: "#999" } : {}),
                }}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </main>

      {/* Mobile: vertical cards */}
      <main className="vault-mobile" style={{ display: "none", padding: "1rem 1.5rem 3rem" }}>
        {filtered.map(entry => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textDecoration: "none",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{
              borderRadius: 10, overflow: "hidden",
              aspectRatio: "16/10",
              marginBottom: "0.6rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.thumb} alt={entry.name} loading="lazy" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <h3 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "1.25rem", fontWeight: 400,
              color: "#1a1a1a", margin: "0 0 0.2rem",
            }}>{entry.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "#888", margin: "0 0 0.25rem", lineHeight: 1.5 }}>{entry.desc}</p>
            <p style={{ fontSize: "0.85rem", color: "#555", margin: 0, lineHeight: 1.6 }}>{entry.why}</p>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
              {entry.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: "0.7rem", color: "#999", background: "rgba(0,0,0,0.04)",
                  padding: "0.12rem 0.4rem", borderRadius: 4,
                }}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#bbb", fontSize: "0.9rem" }}>没有匹配的结果</div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif&display=swap');
        input::placeholder { color: #aaa; }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { display: none; }

        @media (max-width: 768px) {
          .vault-desktop { display: none !important; }
          .vault-mobile { display: block !important; }
          .vault-preview { display: none !important; }
        }
      `}</style>
    </div>
  );
}
