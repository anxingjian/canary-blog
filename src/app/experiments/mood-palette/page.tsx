"use client";

import { useState, useMemo, useRef, useEffect } from "react";

// ---- Curated Palette Database ----
// Real palettes from design practice, categorized by semantic tags
interface CuratedPalette {
  tags: string[];
  colors: string[]; // hex
}

const CURATED_PALETTES: CuratedPalette[] = [
  // --- Warm & Gentle ---
  { tags: ["温柔", "柔", "gentle", "soft", "轻"], colors: ["#F2E6D9", "#D4A59A", "#C97C5D", "#B36A5E", "#8C5E58"] },
  { tags: ["温柔", "粉", "pink", "blush", "甜"], colors: ["#FADADD", "#F4B6C2", "#D291A4", "#A76D8E", "#6B4C5A"] },
  { tags: ["温暖", "warm", "阳光", "amber"], colors: ["#FFF3E0", "#FFE0B2", "#FFB74D", "#F57C00", "#E65100"] },
  { tags: ["温暖", "sunset", "日落", "黄昏"], colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"] },

  // --- Cool & Calm ---
  { tags: ["宁静", "平静", "calm", "peace", "安静", "静"], colors: ["#E8F0FE", "#B3C7E6", "#7096C4", "#4A6FA5", "#2D4A7A"] },
  { tags: ["海", "ocean", "sea", "水", "wave", "浪"], colors: ["#0A1628", "#1A3A5C", "#2E86AB", "#45B7D1", "#96E6FF"] },
  { tags: ["海", "深海", "deep", "abyss"], colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"] },
  { tags: ["冰", "ice", "冷", "cold", "冬", "winter", "snow", "雪"], colors: ["#F0F4F8", "#D9E2EC", "#9FB3C8", "#627D98", "#334E68"] },

  // --- Nature ---
  { tags: ["森", "forest", "tree", "自然", "nature", "green", "草"], colors: ["#1B2D1B", "#2D5016", "#4A7C59", "#8FBC8F", "#C5E1A5"] },
  { tags: ["春", "spring", "morning", "早", "fresh", "清"], colors: ["#FAFDF6", "#E8F5E9", "#A5D6A7", "#66BB6A", "#2E7D32"] },
  { tags: ["花", "flower", "garden", "bloom", "樱"], colors: ["#FFF0F3", "#FFCCD5", "#FF8FA3", "#C9184A", "#590D22"] },
  { tags: ["秋", "autumn", "fall", "枫"], colors: ["#582F0E", "#7F4F24", "#936639", "#B6AD90", "#A68A64"] },
  { tags: ["夏", "summer", "热", "hot", "sun", "太阳"], colors: ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"] },

  // --- Dark & Moody ---
  { tags: ["夜", "night", "dark", "暗", "黑"], colors: ["#0D0D0D", "#1A1A2E", "#16213E", "#0F3460", "#E94560"] },
  { tags: ["月", "moon", "星", "star", "night"], colors: ["#0C0F1A", "#1B1F3A", "#2E3A5C", "#546A8D", "#F4E8C1"] },
  { tags: ["孤独", "lonely", "alone", "寂寞", "empty", "空"], colors: ["#1A1A2E", "#2D2D44", "#4A4A6A", "#7B7B9E", "#B8B8D1"] },
  { tags: ["悲伤", "sad", "sorrow", "忧", "melanchol", "雨", "rain"], colors: ["#1B1B2F", "#2E3047", "#43455C", "#707793", "#A5A5C0"] },

  // --- Intense ---
  { tags: ["愤怒", "anger", "rage", "火", "fire", "烈", "burn", "燃"], colors: ["#1A0000", "#590000", "#9B0000", "#D00000", "#FF4D00"] },
  { tags: ["焦虑", "anxiety", "chaos", "乱", "崩", "panic"], colors: ["#2B2D42", "#8D0801", "#BC3908", "#F6AE2D", "#F2F4F3"] },
  { tags: ["暴", "storm", "thunder", "雷", "暴风"], colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"] },
  { tags: ["活力", "energetic", "vibrant", "vivid", "活泼", "playful"], colors: ["#FF006E", "#FB5607", "#FFBE0B", "#3A86FF", "#8338EC"] },

  // --- Dreamy & Surreal ---
  { tags: ["梦", "dream", "幻", "fantasy", "朦", "haze"], colors: ["#2D1B69", "#5B3A8C", "#8B5FBF", "#C49AE8", "#E8D5F5"] },
  { tags: ["雾", "fog", "mist", "迷"], colors: ["#D6D6D6", "#B8B8B8", "#969696", "#6E6E6E", "#484848"] },
  { tags: ["极光", "aurora", "northern light"], colors: ["#0B0C10", "#1A3C40", "#2EC4B6", "#CBF3F0", "#FF6B6B"] },

  // --- Design Styles ---
  { tags: ["科技", "tech", "digital", "cyber", "未来", "future"], colors: ["#0A0A0F", "#1A1A2E", "#00F5FF", "#7B61FF", "#FF2E63"] },
  { tags: ["霓虹", "neon", "cyberpunk"], colors: ["#0D0221", "#0F084B", "#26086B", "#FF2281", "#00FFAB"] },
  { tags: ["极简", "minimal", "简约", "clean", "pure", "纯"], colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#424242", "#212121"] },
  { tags: ["复古", "retro", "vintage", "旧", "怀旧", "nostalg"], colors: ["#F4E4C1", "#E2C391", "#CE8147", "#8B4513", "#3C1518"] },
  { tags: ["奢华", "luxury", "elegant", "优雅", "高级", "premium"], colors: ["#0A0A0A", "#1C1C1C", "#C9A96E", "#D4AF37", "#F5F0E1"] },
  { tags: ["日系", "japanese", "muji", "侘寂", "wabi"], colors: ["#F5F0EB", "#D4C5B2", "#A89882", "#746859", "#4A3F35"] },
  { tags: ["莫兰迪", "morandi", "muted", "灰调"], colors: ["#A09B8C", "#8E9AAF", "#B8A9C9", "#CBC0D3", "#D8C3A5"] },

  // --- Love & Emotion ---
  { tags: ["爱", "love", "heart", "心", "拥抱", "吻", "想你", "miss"], colors: ["#2D0A1F", "#6B1839", "#C2185B", "#F06292", "#FCE4EC"] },
  { tags: ["希望", "hope", "光", "light", "dawn", "晨"], colors: ["#1A1A2E", "#16213E", "#E2B714", "#F5E6CA", "#FEFCFB"] },

  // --- Food & Material ---
  { tags: ["咖啡", "coffee", "cafe", "拿铁", "mocha"], colors: ["#1B0E04", "#3C2415", "#6F4E37", "#A67B5B", "#D4B59E"] },
  { tags: ["巧克力", "chocolate", "cocoa"], colors: ["#2C1608", "#4E2A0C", "#7B3F00", "#D2691E", "#FFDEAD"] },
  { tags: ["薰衣草", "lavender", "紫", "purple", "violet"], colors: ["#1A0A2E", "#2D1B69", "#7B68AE", "#B39DDB", "#E1D5F0"] },
  { tags: ["薄荷", "mint", "清凉"], colors: ["#E0F7F1", "#A7E8D0", "#66CDAA", "#3CB371", "#1B5E3A"] },
  { tags: ["沙漠", "desert", "sand", "大地", "earth"], colors: ["#F5E6CA", "#D4A76A", "#B87333", "#8B6914", "#3D2B1F"] },
];

// ---- Semantic Matching ----
function findMatchingPalettes(text: string): CuratedPalette[] {
  const scored: { palette: CuratedPalette; score: number }[] = [];

  for (const p of CURATED_PALETTES) {
    let score = 0;
    for (const tag of p.tags) {
      if (text.includes(tag)) {
        score += tag.length; // Longer matches = more specific = higher score
      }
    }
    if (score > 0) scored.push({ palette: p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.palette);
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Generate variations from matched palettes
function generateResults(text: string): { name: string; artType: string; colors: string[] }[] | null {
  const matches = findMatchingPalettes(text);

  if (matches.length === 0) {
    // Fallback: hash-based with better defaults
    const hash = text.split("").reduce((s, c) => ((s << 5) - s + c.charCodeAt(0)) & 0x7fffffff, 0);
    const baseIdx = hash % CURATED_PALETTES.length;
    const base = CURATED_PALETTES[baseIdx].colors;
    const alt1 = CURATED_PALETTES[(baseIdx + 7) % CURATED_PALETTES.length].colors;
    const alt2 = CURATED_PALETTES[(baseIdx + 13) % CURATED_PALETTES.length].colors;
    return [
      { name: "直觉", artType: "flow", colors: base },
      { name: "变奏", artType: "collision", colors: alt1 },
      { name: "对照", artType: "orbit", colors: alt2 },
    ];
  }

  const results: { name: string; artType: string; colors: string[] }[] = [];

  // Primary match
  results.push({ name: "原色", artType: "flow", colors: matches[0].colors });

  // Second match or shifted version
  if (matches.length > 1) {
    results.push({ name: "变奏", artType: "collision", colors: matches[1].colors });
  } else {
    // Create a shifted version: rotate hues slightly
    const shifted = matches[0].colors.map(hex => {
      const hsl = hexToHSL(hex);
      hsl.h = (hsl.h + 30) % 360;
      return hslToHex2(hsl.h, hsl.s, hsl.l);
    });
    results.push({ name: "变奏", artType: "collision", colors: shifted });
  }

  // Third: mix or third match
  if (matches.length > 2) {
    results.push({ name: "融合", artType: "orbit", colors: matches[2].colors });
  } else {
    // Mix: take colors from first palette and shift lightness
    const mixed = matches[0].colors.map((hex, i) => {
      const hsl = hexToHSL(hex);
      hsl.l = Math.min(85, Math.max(15, hsl.l + (i % 2 ? 15 : -10)));
      hsl.s = Math.min(90, Math.max(10, hsl.s + (i % 2 ? -10 : 10)));
      return hslToHex2(hsl.h, hsl.s, hsl.l);
    });
    results.push({ name: "融合", artType: "orbit", colors: mixed });
  }

  return results;
}

function hslToHex2(h: number, s: number, l: number): string {
  const a = s / 100 * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ---- Generative Art Canvas ----
function GenArtCanvas({ colors, artType }: { colors: string[]; artType: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    // Detect if palette is light or dark
    const bgHsl = hexToHSL(colors[0]);
    const isDark = bgHsl.l < 50;

    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, w, h);

    // Flow field particles
    const flowParticles: { x: number; y: number; ci: number; age: number }[] = [];
    for (let i = 0; i < 250; i++) {
      flowParticles.push({ x: Math.random() * w, y: Math.random() * h, ci: 1 + (i % 4), age: Math.random() * 200 });
    }

    // Collision particles
    const colliders: { x: number; y: number; vx: number; vy: number; ci: number; r: number }[] = [];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      colliders.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        ci: 1 + (i % 4), r: 3 + Math.random() * 10,
      });
    }

    // Orbit shapes
    const orbiters: { cx: number; cy: number; r: number; angle: number; speed: number; ci: number; size: number }[] = [];
    const centers = [{ x: w * 0.3, y: h * 0.4 }, { x: w * 0.7, y: h * 0.5 }, { x: w * 0.5, y: h * 0.7 }];
    for (let i = 0; i < 60; i++) {
      const center = centers[i % 3];
      orbiters.push({
        cx: center.x, cy: center.y,
        r: 20 + Math.random() * 80,
        angle: Math.random() * Math.PI * 2,
        speed: (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        ci: 1 + (i % 4), size: 2 + Math.random() * 5,
      });
    }

    const hexToRGBA = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Soft fade with bg color
      ctx.fillStyle = hexToRGBA(colors[0], 0.035);
      ctx.fillRect(0, 0, w, h);

      if (artType === "flow") {
        const t = performance.now() / 1000;
        for (const p of flowParticles) {
          const nx = p.x * 0.005;
          const ny = p.y * 0.005;
          const angle = (Math.sin(nx + t * 0.3) * Math.cos(ny + t * 0.2) +
            Math.sin((nx + ny) * 0.7 + t * 0.15)) * Math.PI;
          p.x += Math.cos(angle) * 0.8;
          p.y += Math.sin(angle) * 0.8;
          p.age++;
          if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10 || p.age > 400) {
            p.x = Math.random() * w; p.y = Math.random() * h; p.age = 0;
            p.ci = 1 + Math.floor(Math.random() * 4);
          }
          const alpha = Math.min(p.age / 40, 1) * 0.6;
          ctx.fillStyle = hexToRGBA(colors[p.ci], alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (artType === "collision") {
        for (const p of colliders) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
          p.y = Math.max(0, Math.min(h, p.y));

          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, hexToRGBA(colors[p.ci], 0.2));
          g.addColorStop(1, hexToRGBA(colors[p.ci], 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = hexToRGBA(colors[p.ci], 0.7);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let i = 0; i < colliders.length; i++) {
          for (let j = i + 1; j < colliders.length; j++) {
            const dx = colliders[i].x - colliders[j].x;
            const dy = colliders[i].y - colliders[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90) {
              ctx.strokeStyle = hexToRGBA(colors[colliders[i].ci], (1 - dist / 90) * 0.15);
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(colliders[i].x, colliders[i].y);
              ctx.lineTo(colliders[j].x, colliders[j].y);
              ctx.stroke();
            }
          }
        }
      } else if (artType === "orbit") {
        for (const o of orbiters) {
          o.angle += o.speed;
          const x = o.cx + Math.cos(o.angle) * o.r;
          const y = o.cy + Math.sin(o.angle) * o.r * 0.6;
          ctx.fillStyle = hexToRGBA(colors[o.ci], 0.5);
          ctx.beginPath();
          ctx.arc(x, y, o.size, 0, Math.PI * 2);
          ctx.fill();
          const tx = o.cx + Math.cos(o.angle - o.speed * 4) * o.r;
          const ty = o.cy + Math.sin(o.angle - o.speed * 4) * o.r * 0.6;
          ctx.strokeStyle = hexToRGBA(colors[o.ci], 0.1);
          ctx.lineWidth = o.size * 0.4;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        for (const center of centers) {
          const ci = centers.indexOf(center) + 1;
          const g = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 20);
          g.addColorStop(0, hexToRGBA(colors[ci], 0.25));
          g.addColorStop(1, hexToRGBA(colors[ci], 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [colors, artType]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: "8px", display: "block" }} />
  );
}

// ---- Main ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!submittedText) return null;
    return generateResults(submittedText);
  }, [submittedText]);

  const handleSubmit = () => { if (text.trim()) setSubmittedText(text.trim()); };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = (colors: string[], id: string) => {
    navigator.clipboard?.writeText(colors.join(", "));
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  if (!results) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0a",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
          fontSize: "1rem", color: "rgba(255,250,240,0.45)",
          letterSpacing: "0.15em", marginBottom: "0.4rem",
        }}>
          情绪调色板
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
          color: "rgba(255,250,240,0.18)", letterSpacing: "0.12em", marginBottom: "3rem",
        }}>
          MOOD PALETTE
        </p>
        <input
          type="text" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="深海、温柔的粉、科技感、咖啡..."
          autoFocus
          style={{
            background: "transparent", border: "none",
            borderBottom: "1px solid rgba(255,250,240,0.12)",
            color: "rgba(255,250,240,0.7)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "1rem", fontWeight: 300,
            padding: "0.75rem 0", width: "min(80vw, 420px)",
            textAlign: "center", outline: "none", letterSpacing: "0.05em",
          }}
        />
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
          color: "rgba(255,250,240,0.1)", marginTop: "2rem",
        }}>
          press enter
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      padding: "2rem 1rem 4rem", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
          fontSize: "0.85rem", color: "rgba(255,250,240,0.35)", letterSpacing: "0.1em",
        }}>
          {submittedText}
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
          color: "rgba(255,250,240,0.15)", marginTop: "0.5rem", cursor: "pointer",
        }} onClick={() => { setSubmittedText(""); setText(""); }}>
          ← new input
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem", width: "min(92vw, 520px)" }}>
        {results.map((scheme) => (
          <div key={scheme.name} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{
                fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
                fontSize: "0.75rem", color: "rgba(255,250,240,0.35)",
              }}>
                {scheme.name}
              </span>
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
                color: "rgba(255,250,240,0.15)", cursor: "pointer",
              }} onClick={() => copyAll(scheme.colors, scheme.name)}>
                {copied === scheme.name ? "✓ copied" : "copy all"}
              </span>
            </div>

            <GenArtCanvas colors={scheme.colors} artType={scheme.artType} />

            <div style={{ display: "flex", gap: "6px" }}>
              {scheme.colors.map((hex, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
                  <div style={{
                    width: "100%", aspectRatio: "1", borderRadius: "6px",
                    background: hex, border: "1px solid rgba(255,255,255,0.06)",
                  }} />
                  <p style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
                    color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)",
                    marginTop: "4px",
                  }}>
                    {copied === hex ? "✓" : hex}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
        color: "rgba(255,250,240,0.1)", marginTop: "3rem",
      }}>
        click swatch to copy · curated palettes from real design practice
      </p>
    </div>
  );
}
