"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/*
 * Vault — Design Inspiration Collection
 * Big hero typography + horizontal film-strip browse
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
  { id: "katalog", name: "Katalog Barbara Iweins", url: "https://katalog-barbaraiweins.com", desc: "个人物品数字孪生目录", why: "把一个人所有物品做成可浏览的数字目录。", tags: ["concept"], thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg", date: "2026-03-08" },
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

function NoiseCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 300; c.height = 300;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(300, 300);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 12;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} style={{
    position: "absolute", inset: 0, width: "100%", height: "100%",
    pointerEvents: "none", opacity: 0.4,
  }} />;
}

function ExpandableCard({ entry, isActive, onClick }: {
  entry: Entry; isActive: boolean; onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{
        flex: isActive ? "0 0 520px" : "0 0 180px",
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        background: "#e8e7e3",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.thumb} alt={entry.name} loading="lazy"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          transform: isActive ? "scale(1)" : "scale(1.1)",
          filter: isActive ? "none" : "brightness(0.7)",
        }}
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Collapsed: vertical text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: isActive ? 0 : 1,
        transition: "opacity 0.3s ease",
        pointerEvents: isActive ? "none" : "auto",
      }}>
        <span style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "0.08em",
          textShadow: "0 1px 8px rgba(0,0,0,0.4)",
        }}>{entry.name}</span>
      </div>

      {/* Expanded: info panel */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "1.25rem",
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.4s ease 0.1s",
        pointerEvents: isActive ? "auto" : "none",
      }}>
        <h3 style={{
          fontSize: "1.2rem", fontWeight: 600, color: "#fff",
          margin: "0 0 0.25rem", letterSpacing: "-0.01em",
        }}>{entry.name}</h3>
        <p style={{
          fontSize: "0.8rem", color: "rgba(255,255,255,0.65)",
          margin: "0 0 0.4rem", lineHeight: 1.5,
        }}>{entry.desc}</p>
        <p style={{
          fontSize: "0.8rem", color: "rgba(255,255,255,0.5)",
          margin: "0 0 0.5rem", lineHeight: 1.6,
        }}>{entry.why}</p>
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          {entry.tags.map(tag => (
            <span key={tag} style={{
              fontSize: "0.7rem", fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.12)",
              padding: "0.12rem 0.4rem", borderRadius: 4,
            }}>{tag}</span>
          ))}
        </div>
        <a
          href={entry.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: "0.75rem", color: "rgba(255,255,255,0.6)",
            textDecoration: "underline",
            textDecorationColor: "rgba(255,255,255,0.2)",
            textUnderlineOffset: "3px",
          }}
        >↗ {entry.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>
      </div>
    </div>
  );
}

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (stripRef.current) {
      stripRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f2f1ed",
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* Hero */}
      <section style={{
        position: "relative",
        height: "45vh",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 clamp(1.5rem, 5vw, 4rem)",
        overflow: "hidden",
      }}>
        <NoiseCanvas />
        
        <a href="/canary-blog/experiments" style={{
          position: "absolute", top: "2rem", left: "clamp(1.5rem, 5vw, 4rem)",
          textDecoration: "none", color: "#bbb", fontSize: "0.85rem",
          zIndex: 2,
        }}>← experiments</a>

        <div style={{ position: "relative", zIndex: 2, paddingBottom: "2.5rem" }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: 0,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}>
            Vault
          </h1>
          <p style={{
            fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
            color: "#999",
            margin: "1rem 0 0",
            fontWeight: 400,
            maxWidth: 500,
            lineHeight: 1.6,
          }}>
            好设计值得被记住。收藏那些让人停下来看的网站——
            它们的排版、交互、和不易察觉的克制。
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          position: "relative", zIndex: 2,
          paddingBottom: "1.5rem",
        }}>
          <div style={{
            display: "flex", gap: "0.35rem", flexWrap: "wrap",
            marginBottom: "0.6rem",
          }}>
            {ALL_TAGS.map(tag => {
              const isActive = activeTag === tag;
              return (
                <button key={tag} onClick={() => setActiveTag(isActive ? null : tag)} style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 24,
                  border: "none",
                  background: isActive ? "#1a1a1a" : "rgba(0,0,0,0.05)",
                  color: isActive ? "#f2f1ed" : "#888",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}>{tag}</button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                flex: 1, maxWidth: 200, padding: "0.4rem 0.75rem",
                background: "rgba(0,0,0,0.05)",
                border: "none", borderRadius: 24,
                color: "#333", fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <span style={{
              fontSize: "0.75rem", color: "#bbb",
              fontVariantNumeric: "tabular-nums",
            }}>{filtered.length} sites</span>
          </div>
        </div>
      </section>

      {/* Horizontal expandable strip — desktop */}
      <section
        className="vault-strip-desktop"
        onWheel={handleWheel}
        style={{
          height: "55vh",
          minHeight: 350,
        }}
      >
        <div
          ref={stripRef}
          style={{
            height: "100%",
            display: "flex",
            gap: "0.5rem",
            padding: "1rem clamp(1.5rem, 5vw, 4rem)",
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
        >
          {filtered.map(entry => (
            <ExpandableCard
              key={entry.id}
              entry={entry}
              isActive={activeId === entry.id}
              onClick={() => setActiveId(activeId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      </section>

      {/* Mobile: vertical stack */}
      <section className="vault-strip-mobile" style={{ display: "none", padding: "1rem 1.5rem 3rem" }}>
        {filtered.map(entry => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              marginBottom: "1.25rem",
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
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a", margin: "0 0 0.2rem" }}>{entry.name}</h3>
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
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif&display=swap');
        input::placeholder { color: #aaa; }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { display: none; }

        @media (max-width: 768px) {
          .vault-strip-desktop { display: none !important; }
          .vault-strip-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
