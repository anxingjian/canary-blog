"use client";

import { useState, useMemo } from "react";

/*
 * Vault — Design Inspiration Collection
 * Light theme, card-based, visual-first.
 * Quick browse with thumbnails, tags, and search.
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
    desc: "Voice-to-text AI，语音转文字工具",
    why: "文字沿贝塞尔曲线自动滚动，经过 pill button 时被高亮「吞入」。极简配色（暖黄底+墨绿），衬线/无衬线混排，全页只有一条曲线在动。",
    tags: ["typography", "animation", "landing"],
    thumb: "/canary-blog/vault/wisprflow-ai.jpg",
    date: "2026-03-09",
  },
  {
    id: "shopify-editions",
    name: "Shopify Editions",
    url: "https://www.shopify.com/editions",
    desc: "Shopify 半年一次的产品发布页，每期独立设计语言",
    why: "移动端翻唱片交互——垂直堆叠卡片带 3D 透视倾斜。每期封面字体/配色/风格完全不同。桌面端滑动时背景图 transition + 卡片变换。把产品更新日志做成收藏体验。",
    tags: ["interaction", "editorial"],
    thumb: "/canary-blog/vault/www-shopify-com-editions.jpg",
    date: "2026-03-09",
  },
  {
    id: "toddham",
    name: "Todd Ham",
    url: "https://toddham.com",
    desc: "Digital Physicality — 给数字内容赋予物理存在感",
    why: "Three.js 全场景 3D portfolio。复古 Macintosh 3D 模型，实物质感（杯子、电脑）。Cormorant Garamond + Google Sans Code + Inter Tight 字体组合。3D 实物与 UI 的融合。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/toddham-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "laxspace",
    name: "LAX Space",
    url: "https://laxspace.co",
    desc: "DESIGN—CODE 的视觉平衡",
    why: "Next.js + Three.js，项目展示贴在 3D 胶带上旋转。首页 3D 物体作为项目载体，子页面排版精致。",
    tags: ["3d", "portfolio"],
    thumb: "/canary-blog/vault/laxspace-co.jpg",
    date: "2026-03-08",
  },
  {
    id: "katalog",
    name: "Katalog Barbara Iweins",
    url: "https://katalog-barbaraiweins.com",
    desc: "一个人所有物品的分类目录，数字孪生概念",
    why: "把个人物品做成可浏览的数字目录。An 想做类似的：用小红书记录的物品做个人数字目录。",
    tags: ["concept"],
    thumb: "/canary-blog/vault/katalog-barbaraiweins-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "elevenlabs-music",
    name: "ElevenLabs Music",
    url: "https://elevenlabs.io/music",
    desc: "AI 音乐生成工具的产品页",
    why: "Hero 区域环形旋转 gallery，沉浸感强。An 想把环形效果用在我们的 gallery 上。",
    tags: ["animation", "landing"],
    thumb: "/canary-blog/vault/elevenlabs-io-music.jpg",
    date: "2026-03-08",
  },
  {
    id: "abhijitrout",
    name: "Abhijit Rout",
    url: "https://abhijitrout.in",
    desc: "设计师 portfolio，滚动动效",
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
    why: "桌面/移动端不同的卡片交互方式。An 想用在作品展示和播客上。",
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
    desc: "克制、空间感、字体层级、动效的标杆",
    why: "An 推荐的审美参考：极致的克制和空间感，字体层级清晰，动效恰到好处。",
    tags: ["typography", "animation"],
    thumb: "/canary-blog/vault/www-apple-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "basicagency",
    name: "Basic Agency",
    url: "https://www.basicagency.com",
    desc: "创意排版，大胆但有控制",
    why: "An 推荐的审美参考：创意排版的尺度感——大胆但不失控。",
    tags: ["editorial", "typography"],
    thumb: "/canary-blog/vault/www-basicagency-com.jpg",
    date: "2026-03-08",
  },
  {
    id: "han1",
    name: "Han1.ai (Eko)",
    url: "https://han1.ai",
    desc: "朋友 Eko 的个人网站，有彩蛋",
    why: "门的灵感来源。An 的引路人 Saber 的圈子。",
    tags: ["portfolio"],
    thumb: "/canary-blog/vault/han1-ai.jpg",
    date: "2026-03-06",
  },
];

const ALL_TAGS = [...new Set(ENTRIES.flatMap(e => e.tags))].sort();

const TAG_COLORS: Record<string, string> = {
  "portfolio": "#10b981",
  "typography": "#0ea5e9",
  "animation": "#f59e0b",
  "interaction": "#f97316",
  "3d": "#6366f1",
  "editorial": "#ec4899",
  "landing": "#a855f7",
  "concept": "#14b8a6",
  "resource": "#6b7280",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "#94a3b8";
}

export default function Vault() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
      background: "#fafaf8",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 0",
      }}>
        <a href="/canary-blog/experiments" style={{
          fontSize: "0.875rem", color: "#999", textDecoration: "none",
          letterSpacing: "0.05em",
        }}>← experiments</a>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#1a1a1a",
          margin: "1.5rem 0 0.3rem",
          letterSpacing: "-0.02em",
        }}>Vault</h1>
        <p style={{
          fontSize: "1rem",
          color: "#888",
          margin: "0 0 1.5rem",
          lineHeight: 1.5,
        }}>好设计的收藏夹 · {ENTRIES.length} sites</p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 400, marginBottom: "1rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sites, tags, keywords..."
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem 0.6rem 2.2rem",
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              color: "#333",
              fontSize: "0.875rem",
              outline: "none",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#bbb"}
            onBlur={e => e.currentTarget.style.borderColor = "#e5e5e5"}
          />
        </div>

        {/* Tags */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.35rem",
          marginBottom: "1.5rem",
        }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: "0.2rem 0.55rem",
              borderRadius: 6,
              border: "none",
              background: activeTag === null ? "#1a1a1a" : "#f0f0ee",
              color: activeTag === null ? "#fff" : "#666",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >All</button>
          {ALL_TAGS.map(tag => {
            const isActive = activeTag === tag;
            const c = getTagColor(tag);
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                style={{
                  padding: "0.2rem 0.55rem",
                  borderRadius: 6,
                  border: "none",
                  background: isActive ? c : "#f0f0ee",
                  color: isActive ? "#fff" : "#777",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >{tag}</button>
            );
          })}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}>
        {filtered.map(entry => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #eee",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Thumbnail */}
            <div style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "#f5f5f3",
              overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.thumb}
                alt={entry.name}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: "0.85rem 1rem 1rem", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Name + date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                <h2 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                }}>{entry.name}</h2>
                <span style={{ fontSize: "0.75rem", color: "#bbb", flexShrink: 0, marginLeft: "0.5rem" }}>{entry.date}</span>
              </div>

              {/* Desc */}
              <p style={{
                fontSize: "0.875rem", color: "#888",
                margin: "0 0 0.4rem", lineHeight: 1.4,
              }}>{entry.desc}</p>

              {/* Why */}
              <p style={{
                fontSize: "1rem", color: "#555",
                margin: "0 0 0.6rem", lineHeight: 1.6,
                flex: 1,
              }}>{entry.why}</p>

              {/* Tags + URL */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
                {entry.tags.slice(0, 4).map(tag => (
                  <span key={tag} style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: getTagColor(tag),
                    background: getTagColor(tag) + "12",
                    padding: "0.12rem 0.4rem",
                    borderRadius: 4,
                  }}>{tag}</span>
                ))}
                {entry.tags.length > 4 && (
                  <span style={{ fontSize: "0.75rem", color: "#bbb" }}>+{entry.tags.length - 4}</span>
                )}
              </div>
            </div>
          </a>
        ))}

        {filtered.length === 0 && (
          <div style={{
            gridColumn: "1 / -1",
            textAlign: "center", padding: "4rem 0",
            color: "#bbb", fontSize: "1rem",
          }}>没有匹配的结果</div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder { color: #bbb; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
