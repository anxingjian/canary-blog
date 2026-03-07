"use client";

import { useState, useRef, useEffect } from "react";

// ---- Curated Palette Database ----
interface CuratedPalette {
  tags: string[];
  colors: string[];
  artType: "flow" | "collision" | "orbit" | "waves" | "bloom" | "mist";
}

const PALETTES: CuratedPalette[] = [
  // Warm & Gentle
  { tags: ["温柔", "柔", "gentle", "soft", "轻"], colors: ["#F2E6D9", "#D4A59A", "#C97C5D", "#B36A5E", "#8C5E58"], artType: "flow" },
  { tags: ["温柔", "粉", "pink", "blush", "甜"], colors: ["#FADADD", "#F4B6C2", "#D291A4", "#A76D8E", "#6B4C5A"], artType: "bloom" },
  { tags: ["温暖", "warm", "阳光", "amber"], colors: ["#FFF3E0", "#FFE0B2", "#FFB74D", "#F57C00", "#E65100"], artType: "bloom" },
  { tags: ["sunset", "日落", "黄昏"], colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"], artType: "flow" },

  // Cool & Calm
  { tags: ["宁静", "平静", "calm", "peace", "安静", "静"], colors: ["#E8F0FE", "#B3C7E6", "#7096C4", "#4A6FA5", "#2D4A7A"], artType: "mist" },
  { tags: ["海", "ocean", "sea", "水", "wave", "浪"], colors: ["#0A1628", "#1A3A5C", "#2E86AB", "#45B7D1", "#96E6FF"], artType: "waves" },
  { tags: ["深海", "deep", "abyss"], colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"], artType: "waves" },
  { tags: ["冰", "ice", "冷", "cold", "冬", "winter", "snow", "雪"], colors: ["#F0F4F8", "#D9E2EC", "#9FB3C8", "#627D98", "#334E68"], artType: "mist" },

  // Nature
  { tags: ["森", "forest", "tree", "自然", "nature", "green", "草"], colors: ["#1B2D1B", "#2D5016", "#4A7C59", "#8FBC8F", "#C5E1A5"], artType: "flow" },
  { tags: ["春", "spring", "morning", "早", "fresh", "清"], colors: ["#FAFDF6", "#E8F5E9", "#A5D6A7", "#66BB6A", "#2E7D32"], artType: "bloom" },
  { tags: ["花", "flower", "garden", "bloom", "樱"], colors: ["#FFF0F3", "#FFCCD5", "#FF8FA3", "#C9184A", "#590D22"], artType: "bloom" },
  { tags: ["秋", "autumn", "fall", "枫"], colors: ["#582F0E", "#7F4F24", "#936639", "#B6AD90", "#A68A64"], artType: "flow" },
  { tags: ["夏", "summer", "热", "hot", "sun", "太阳"], colors: ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"], artType: "collision" },

  // Dark & Moody
  { tags: ["夜", "night", "dark", "暗", "黑"], colors: ["#0D0D0D", "#1A1A2E", "#16213E", "#0F3460", "#E94560"], artType: "mist" },
  { tags: ["月", "moon", "星", "star"], colors: ["#0C0F1A", "#1B1F3A", "#2E3A5C", "#546A8D", "#F4E8C1"], artType: "orbit" },
  { tags: ["孤独", "lonely", "alone", "寂寞", "empty", "空"], colors: ["#1A1A2E", "#2D2D44", "#4A4A6A", "#7B7B9E", "#B8B8D1"], artType: "mist" },
  { tags: ["悲伤", "sad", "sorrow", "忧", "melanchol"], colors: ["#1B1B2F", "#2E3047", "#43455C", "#707793", "#A5A5C0"], artType: "flow" },
  { tags: ["雨", "rain"], colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"], artType: "waves" },

  // Intense
  { tags: ["愤怒", "anger", "rage", "火", "fire", "烈", "burn", "燃"], colors: ["#1A0000", "#590000", "#9B0000", "#D00000", "#FF4D00"], artType: "collision" },
  { tags: ["焦虑", "anxiety", "chaos", "乱", "崩", "panic"], colors: ["#2B2D42", "#8D0801", "#BC3908", "#F6AE2D", "#F2F4F3"], artType: "collision" },
  { tags: ["暴", "storm", "thunder", "雷", "暴风"], colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"], artType: "collision" },
  { tags: ["活力", "energetic", "vibrant", "vivid", "活泼", "playful"], colors: ["#FF006E", "#FB5607", "#FFBE0B", "#3A86FF", "#8338EC"], artType: "collision" },

  // Dreamy
  { tags: ["梦", "dream", "幻", "fantasy", "朦", "haze"], colors: ["#2D1B69", "#5B3A8C", "#8B5FBF", "#C49AE8", "#E8D5F5"], artType: "mist" },
  { tags: ["雾", "fog", "mist", "迷"], colors: ["#D6D6D6", "#B8B8B8", "#969696", "#6E6E6E", "#484848"], artType: "mist" },
  { tags: ["极光", "aurora"], colors: ["#0B0C10", "#1A3C40", "#2EC4B6", "#CBF3F0", "#FF6B6B"], artType: "orbit" },

  // Design Styles
  { tags: ["科技", "tech", "digital", "cyber", "未来", "future"], colors: ["#0A0A0F", "#1A1A2E", "#00F5FF", "#7B61FF", "#FF2E63"], artType: "orbit" },
  { tags: ["霓虹", "neon", "cyberpunk"], colors: ["#0D0221", "#0F084B", "#26086B", "#FF2281", "#00FFAB"], artType: "collision" },
  { tags: ["极简", "minimal", "简约", "clean", "pure", "纯"], colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#424242", "#212121"], artType: "flow" },
  { tags: ["复古", "retro", "vintage", "旧", "怀旧", "nostalg"], colors: ["#F4E4C1", "#E2C391", "#CE8147", "#8B4513", "#3C1518"], artType: "flow" },
  { tags: ["奢华", "luxury", "elegant", "优雅", "高级", "premium"], colors: ["#0A0A0A", "#1C1C1C", "#C9A96E", "#D4AF37", "#F5F0E1"], artType: "orbit" },
  { tags: ["日系", "japanese", "muji", "侘寂", "wabi"], colors: ["#F5F0EB", "#D4C5B2", "#A89882", "#746859", "#4A3F35"], artType: "flow" },
  { tags: ["莫兰迪", "morandi", "muted", "灰调"], colors: ["#A09B8C", "#8E9AAF", "#B8A9C9", "#CBC0D3", "#D8C3A5"], artType: "mist" },

  // Emotion
  { tags: ["爱", "love", "heart", "心", "拥抱", "吻", "想你", "miss"], colors: ["#2D0A1F", "#6B1839", "#C2185B", "#F06292", "#FCE4EC"], artType: "bloom" },
  { tags: ["希望", "hope", "光", "light", "dawn", "晨"], colors: ["#1A1A2E", "#16213E", "#E2B714", "#F5E6CA", "#FEFCFB"], artType: "bloom" },

  // Material
  { tags: ["咖啡", "coffee", "cafe", "拿铁", "mocha"], colors: ["#1B0E04", "#3C2415", "#6F4E37", "#A67B5B", "#D4B59E"], artType: "flow" },
  { tags: ["巧克力", "chocolate", "cocoa"], colors: ["#2C1608", "#4E2A0C", "#7B3F00", "#D2691E", "#FFDEAD"], artType: "flow" },
  { tags: ["薰衣草", "lavender", "紫", "purple", "violet"], colors: ["#1A0A2E", "#2D1B69", "#7B68AE", "#B39DDB", "#E1D5F0"], artType: "mist" },
  { tags: ["薄荷", "mint", "清凉"], colors: ["#E0F7F1", "#A7E8D0", "#66CDAA", "#3CB371", "#1B5E3A"], artType: "bloom" },
  { tags: ["沙漠", "desert", "sand", "大地", "earth"], colors: ["#F5E6CA", "#D4A76A", "#B87333", "#8B6914", "#3D2B1F"], artType: "flow" },
];

function findPalette(text: string): CuratedPalette {
  let best: CuratedPalette | null = null;
  let bestScore = 0;
  for (const p of PALETTES) {
    let score = 0;
    for (const tag of p.tags) {
      if (text.includes(tag)) score += tag.length;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  if (!best) {
    const hash = text.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    best = PALETTES[hash % PALETTES.length];
  }
  return best;
}

// ---- Full-screen Generative Art ----
function FullScreenArt({ palette }: { palette: CuratedPalette }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const { colors, artType } = palette;

    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, w, h);

    const hexToRGBA = (hex: string, a: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    };

    // Flow
    const flowP: { x: number; y: number; ci: number; age: number }[] = [];
    if (artType === "flow") {
      for (let i = 0; i < 400; i++) flowP.push({ x: Math.random() * w, y: Math.random() * h, ci: 1 + (i % 4), age: Math.random() * 200 });
    }

    // Collision
    const colP: { x: number; y: number; vx: number; vy: number; ci: number; r: number }[] = [];
    if (artType === "collision") {
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        colP.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * (0.5 + Math.random()), vy: Math.sin(a) * (0.5 + Math.random()), ci: 1 + (i % 4), r: 4 + Math.random() * 12 });
      }
    }

    // Orbit
    const orbP: { cx: number; cy: number; r: number; angle: number; speed: number; ci: number; size: number }[] = [];
    if (artType === "orbit") {
      const ctrs = [{ x: w * 0.25, y: h * 0.35 }, { x: w * 0.65, y: h * 0.45 }, { x: w * 0.45, y: h * 0.7 }];
      for (let i = 0; i < 80; i++) {
        const c = ctrs[i % 3];
        orbP.push({ cx: c.x, cy: c.y, r: 30 + Math.random() * 120, angle: Math.random() * Math.PI * 2, speed: (0.003 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1), ci: 1 + (i % 4), size: 2 + Math.random() * 6 });
      }
    }

    // Waves
    // (no init needed)

    // Bloom
    const blooms: { x: number; y: number; r: number; maxR: number; ci: number; a: number }[] = [];
    let lastBloom = 0;

    // Mist
    // (no init needed)

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h); };
    window.addEventListener("resize", onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = performance.now() / 1000;

      ctx.fillStyle = hexToRGBA(colors[0], artType === "mist" ? 0.02 : 0.03);
      ctx.fillRect(0, 0, w, h);

      if (artType === "flow") {
        for (const p of flowP) {
          const angle = (Math.sin(p.x * 0.004 + t * 0.25) * Math.cos(p.y * 0.003 + t * 0.18) + Math.sin((p.x + p.y) * 0.002 + t * 0.12)) * Math.PI;
          p.x += Math.cos(angle) * 0.9;
          p.y += Math.sin(angle) * 0.9;
          p.age++;
          if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20 || p.age > 500) { p.x = Math.random() * w; p.y = Math.random() * h; p.age = 0; p.ci = 1 + Math.floor(Math.random() * 4); }
          ctx.fillStyle = hexToRGBA(colors[p.ci], Math.min(p.age / 50, 1) * 0.55);
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      } else if (artType === "collision") {
        for (const p of colP) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, hexToRGBA(colors[p.ci], 0.2));
          g.addColorStop(1, hexToRGBA(colors[p.ci], 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = hexToRGBA(colors[p.ci], 0.7);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < colP.length; i++) for (let j = i + 1; j < colP.length; j++) {
          const dx = colP[i].x - colP[j].x, dy = colP[i].y - colP[j].y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) { ctx.strokeStyle = hexToRGBA(colors[colP[i].ci], (1 - dist / 120) * 0.12); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(colP[i].x, colP[i].y); ctx.lineTo(colP[j].x, colP[j].y); ctx.stroke(); }
        }
      } else if (artType === "orbit") {
        for (const o of orbP) {
          o.angle += o.speed;
          const x = o.cx + Math.cos(o.angle) * o.r;
          const y = o.cy + Math.sin(o.angle) * o.r * 0.55;
          ctx.fillStyle = hexToRGBA(colors[o.ci], 0.45);
          ctx.beginPath(); ctx.arc(x, y, o.size, 0, Math.PI * 2); ctx.fill();
          const tx = o.cx + Math.cos(o.angle - o.speed * 5) * o.r;
          const ty = o.cy + Math.sin(o.angle - o.speed * 5) * o.r * 0.55;
          ctx.strokeStyle = hexToRGBA(colors[o.ci], 0.08);
          ctx.lineWidth = o.size * 0.4;
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        }
      } else if (artType === "waves") {
        for (let layer = 0; layer < 4; layer++) {
          ctx.beginPath(); ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 3) {
            const y = h * (0.35 + layer * 0.12) + Math.sin(x * 0.006 + t * (0.4 + layer * 0.15)) * 30 + Math.sin(x * 0.012 + t * 0.25 + layer) * 18;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h); ctx.closePath();
          ctx.fillStyle = hexToRGBA(colors[1 + layer], 0.1 - layer * 0.015);
          ctx.fill();
        }
      } else if (artType === "bloom") {
        if (t - lastBloom > 0.6) {
          lastBloom = t;
          blooms.push({ x: Math.random() * w, y: Math.random() * h, r: 0, maxR: 80 + Math.random() * 140, ci: 1 + Math.floor(Math.random() * 4), a: 0.35 });
        }
        for (let i = blooms.length - 1; i >= 0; i--) {
          const b = blooms[i];
          b.r += 0.6; b.a -= 0.0015;
          if (b.a <= 0 || b.r > b.maxR) { blooms.splice(i, 1); continue; }
          ctx.strokeStyle = hexToRGBA(colors[b.ci], b.a);
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          g.addColorStop(0, hexToRGBA(colors[b.ci], b.a * 0.12));
          g.addColorStop(1, hexToRGBA(colors[b.ci], 0));
          ctx.fillStyle = g; ctx.fill();
        }
        if (blooms.length > 50) blooms.splice(0, 15);
      } else if (artType === "mist") {
        for (let i = 0; i < 6; i++) {
          const x = w * (0.15 + i * 0.14) + Math.sin(t * 0.12 + i * 2.2) * w * 0.18;
          const y = h * 0.5 + Math.cos(t * 0.08 + i * 1.7) * h * 0.22;
          const rx = 180 + Math.sin(t * 0.15 + i) * 60;
          const ry = 100 + Math.cos(t * 0.1 + i) * 35;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
          g.addColorStop(0, hexToRGBA(colors[1 + (i % 4)], 0.06));
          g.addColorStop(0.5, hexToRGBA(colors[1 + (i % 4)], 0.03));
          g.addColorStop(1, hexToRGBA(colors[1 + (i % 4)], 0));
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, t * 0.03 + i, 0, Math.PI * 2); ctx.fill();
        }
      }
    };

    animate();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", onResize); };
  }, [palette]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }} />;
}

// ---- Main ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [palette, setPalette] = useState<CuratedPalette | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setPalette(findPalette(text.trim()));
  };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = () => {
    if (!palette) return;
    navigator.clipboard?.writeText(palette.colors.join(", "));
    setCopied("all");
    setTimeout(() => setCopied(null), 1200);
  };

  if (!palette) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0a",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "1rem", color: "rgba(255,250,240,0.45)", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>
          情绪调色板
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,250,240,0.18)", letterSpacing: "0.12em", marginBottom: "3rem" }}>
          MOOD PALETTE
        </p>
        <input
          type="text" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="深海、温柔、科技感、咖啡、莫兰迪..."
          autoFocus
          style={{
            background: "transparent", border: "none",
            borderBottom: "1px solid rgba(255,250,240,0.12)",
            color: "rgba(255,250,240,0.7)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "1rem", fontWeight: 300,
            padding: "0.75rem 0", width: "min(80vw, 420px)",
            textAlign: "center", outline: "none",
          }}
        />
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,250,240,0.1)", marginTop: "2rem" }}>
          press enter
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <FullScreenArt palette={palette} />

      {/* Top: input text */}
      <div style={{ position: "fixed", top: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,250,240,0.3)", letterSpacing: "0.1em" }}>
          {text}
        </p>
      </div>

      {/* Bottom: swatches */}
      <div style={{ position: "fixed", bottom: "4rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", zIndex: 10 }}>
        {palette.colors.map((hex, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
            <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: hex, border: "1px solid rgba(255,255,255,0.08)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)", marginTop: "4px" }}>
              {copied === hex ? "✓" : hex}
            </p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "2rem", zIndex: 10 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,250,240,0.2)", cursor: "pointer" }}
          onClick={() => { setPalette(null); setText(""); }}>
          new
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,250,240,0.2)", cursor: "pointer" }}
          onClick={copyAll}>
          {copied === "all" ? "✓ copied" : "copy all"}
        </p>
      </div>
    </div>
  );
}
