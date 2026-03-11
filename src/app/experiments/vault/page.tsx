"use client";

import { useState, useMemo } from "react";

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
  { id: "wisprflow", name: "Wispr Flow", url: "https://wisprflow.ai", desc: "Voice-to-text AI", why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，全页只有一条曲线在动。", tags: ["commerce", "typography", "motion"], thumb: "/canary-blog/vault/wisprflow-ai.jpg", date: "2026-03-09" },
  { id: "shopify-editions", name: "Shopify Editions", url: "https://www.shopify.com/editions", desc: "产品发布页，每期独立设计语言", why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜。每期封面字体/配色/风格完全不同。把产品更新日志做成收藏体验。", tags: ["commerce", "layout", "motion"], thumb: "/canary-blog/vault/www-shopify-com-editions.jpg", date: "2026-03-09" },
  { id: "toddham", name: "Todd Ham", url: "https://toddham.com", desc: "Digital Physicality", why: "Three.js 全场景 3D portfolio。复古 Macintosh 3D 模型，实物质感。3D 实物与 UI 的融合。", tags: ["personal", "3d"], thumb: "/canary-blog/vault/toddham-com.jpg", date: "2026-03-08" },
  { id: "laxspace", name: "LAX Space", url: "https://laxspace.co", desc: "DESIGN—CODE 的视觉平衡", why: "Next.js + Three.js，项目展示贴在 3D 胶带上旋转。首页 3D 物体作为项目载体。", tags: ["personal", "3d"], thumb: "/canary-blog/vault/laxspace-co.jpg", date: "2026-03-08" },
  { id: "katalog", name: "Katalog", url: "https://katalog-barbaraiweins.com", desc: "个人物品数字孪生目录", why: "把一个人所有物品做成可浏览的数字目录。", tags: ["personal", "layout"], thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg", date: "2026-03-08" },
  { id: "elevenlabs-music", name: "ElevenLabs Music", url: "https://elevenlabs.io/music", desc: "AI 音乐生成", why: "Hero 区域环形旋转 gallery，沉浸感强。", tags: ["commerce", "motion"], thumb: "/canary-blog/vault/elevenlabs-io-music.jpg", date: "2026-03-08" },
  { id: "abhijitrout", name: "Abhijit Rout", url: "https://abhijitrout.in", desc: "设计师 portfolio", why: "顶部一排 + 滚动时的视差/动画效果。", tags: ["personal", "motion"], thumb: "/canary-blog/vault/abhijitrout-in.jpg", date: "2026-03-08" },
  { id: "vemula", name: "Vemula", url: "https://vemula.me", desc: "卡片交互式 portfolio", why: "桌面/移动端不同的卡片交互方式。", tags: ["personal", "layout"], thumb: "/canary-blog/vault/vemula-me.jpg", date: "2026-03-08" },
  { id: "lorenzodaldosso", name: "Lorenzo Dal Dosso", url: "https://lorenzodaldosso.it", desc: "意大利设计师 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["personal", "typography"], thumb: "/canary-blog/vault/lorenzodaldosso-it.jpg", date: "2026-03-05" },
  { id: "huyml", name: "Huy Mai Le", url: "https://huyml.co", desc: "设计师个人站", why: "Blog 视觉改版灵感来源之一。", tags: ["personal", "layout"], thumb: "/canary-blog/vault/huyml-co.jpg", date: "2026-03-05" },
  { id: "henryheffernan", name: "Henry Heffernan", url: "https://henryheffernan.com", desc: "创意开发者 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["personal", "3d"], thumb: "/canary-blog/vault/henryheffernan-com.jpg", date: "2026-03-05" },
  { id: "cathydolle", name: "Cathy Dolle", url: "https://cathydolle.com", desc: "设计师 portfolio", why: "Blog 视觉改版灵感来源之一。", tags: ["personal", "typography"], thumb: "/canary-blog/vault/cathydolle-com.jpg", date: "2026-03-05" },
  { id: "godly", name: "Godly", url: "https://godly.website", desc: "前沿网页设计灵感合集", why: "设计灵感聚合站，收录最新最好的网页设计。", tags: ["resource"], thumb: "/canary-blog/vault/godly-website.jpg", date: "2026-03-05" },
  { id: "apple", name: "Apple", url: "https://www.apple.com", desc: "克制、空间感、字体层级的标杆", why: "极致的克制和空间感，字体层级清晰，动效恰到好处。", tags: ["commerce", "typography", "motion"], thumb: "/canary-blog/vault/www-apple-com.jpg", date: "2026-03-08" },
  { id: "basicagency", name: "Basic Agency", url: "https://www.basicagency.com", desc: "创意排版，大胆但有控制", why: "创意排版的尺度感——大胆但不失控。", tags: ["commerce", "typography", "layout"], thumb: "/canary-blog/vault/www-basicagency-com.jpg", date: "2026-03-08" },
  { id: "inkwell", name: "Inkwell", url: "https://inkwell.tech", desc: "开场卡片效果惊艳", why: "入场动画的卡片翻转/展开效果，让人停下来看。交互层次丰富但不过载。", tags: ["commerce", "motion", "layout"], thumb: "/canary-blog/vault/inkwell-tech.jpg", date: "2026-03-09" },
  { id: "microsoft-ai", name: "Microsoft AI", url: "https://microsoft.ai", desc: "企业级 AI 门户", why: "微软的 AI 产品门户——大厂级别的信息密度控制和视觉层级。", tags: ["commerce", "layout"], thumb: "/canary-blog/vault/microsoft-ai.jpg", date: "2026-03-09" },
  { id: "mindmarket", name: "MindMarket", url: "https://mindmarket.com", desc: "色彩搭配教科书", why: "配色方案的高级感——大胆用色但保持和谐，不俗不闹。", tags: ["commerce", "color"], thumb: "/canary-blog/vault/mindmarket-com.jpg", date: "2026-03-09" },
  { id: "awwwards-honors", name: "Awwwards Honors", url: "https://www.awwwards.com/honors/winners", desc: "呼吸感与字体对比", why: "页面呼吸感的标杆——留白充足，衬线/无衬线字体对比鲜明，信息密度恰到好处。", tags: ["resource", "typography"], thumb: "/canary-blog/vault/www-awwwards-com-honors-winners.jpg", date: "2026-03-09" },
];

const ALL_TAGS = ["Personal", "Commerce", "Resource", "3D", "Typography", "Color", "Motion", "Layout"];

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ENTRIES.filter(e => {
      if (activeTag && !e.tags.includes(activeTag.toLowerCase())) return false;
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        cursor: "default",
      }}
    >

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
                padding: "0.45rem 0.9rem",
                borderRadius: 4, border: "none",
                background: isActive ? "#1a1a1a" : "#fff",
                color: isActive ? "#fff" : "#1a1a1a",
                fontSize: "0.9rem", fontWeight: 500,
                cursor: "pointer", flexShrink: 0,
                transition: "all 0.2s ease",
              }}>{tag}</button>
            );
          })}
        </div>
      </div>

      {/* Desktop: typographic list with inline expand */}
      <main className="vault-desktop" style={{
        padding: "1rem clamp(1.5rem, 5vw, 4rem) 4rem",
      }}>
        {filtered.map((entry) => {
          const isOpen = hoveredId === entry.id;
          return (
            <div
              key={entry.id}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                transition: "background 0.3s ease",
                background: isOpen ? "rgba(0,0,0,0.015)" : "transparent",
                borderRadius: isOpen ? 8 : 0,
              }}
            >
              {/* Title row — always visible */}
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1.5rem",
                  alignItems: "baseline",
                  textDecoration: "none",
                  padding: "1.25rem 0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                  <h2 style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    fontWeight: 400,
                    color: isOpen ? "#1a1a1a" : "#444",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    transition: "color 0.3s ease",
                    lineHeight: 1.2,
                  }}>{entry.name}</h2>
                  <span style={{
                    fontSize: "0.85rem",
                    color: isOpen ? "#888" : "#bbb",
                    transition: "color 0.3s ease",
                  }}>{entry.desc}</span>
                </div>
                <div style={{
                  display: "flex", gap: "0.3rem", flexShrink: 0, alignSelf: "center",
                }}>
                  {entry.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: "0.7rem", fontWeight: 500,
                      color: isOpen ? "#999" : "#bbb",
                      background: "rgba(0,0,0,0.03)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: 4,
                      transition: "color 0.3s",
                    }}>{tag}</span>
                  ))}
                </div>
              </a>

              {/* Expanded content — image + why */}
              <div style={{
                maxHeight: isOpen ? "300px" : "0",
                opacity: isOpen ? 1 : 0,
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr",
                  gap: "1.5rem",
                  padding: "0 0.75rem 1.25rem",
                  alignItems: "start",
                }}>
                  <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "block", borderRadius: 6, overflow: "hidden",
                    aspectRatio: "16/10",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s ease",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.thumb}
                      alt={entry.name}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </a>
                  <p style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    margin: 0,
                    lineHeight: 1.8,
                    paddingTop: "0.25rem",
                  }}>{entry.why}</p>
                </div>
              </div>
            </div>
          );
        })}
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
