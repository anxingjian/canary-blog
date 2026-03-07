"use client";

import { useState, useMemo, useRef, useEffect } from "react";

// ---- Mood Detection ----
interface MoodProfile {
  temperature: number;
  weight: number;
  energy: number;
  brightness: number;
}

const moodKeywords: { pattern: RegExp; mood: Partial<MoodProfile> }[] = [
  { pattern: /温柔|gentle|soft|柔|轻|安静|宁静|平静|quiet|calm|peace|静/, mood: { temperature: 0.3, weight: -0.8, energy: -0.8, brightness: 0.3 } },
  { pattern: /开心|快乐|幸福|happy|joy|温暖|warm|阳光|sunshine|笑|甜|sweet/, mood: { temperature: 0.8, weight: -0.5, energy: 0.3, brightness: 0.7 } },
  { pattern: /悲伤|难过|忧|sad|sorrow|melanchol|眼泪|tear|哭|cry|失去|loss/, mood: { temperature: -0.5, weight: 0.6, energy: -0.5, brightness: -0.6 } },
  { pattern: /愤怒|生气|anger|angry|rage|暴|烈|fire|火|燃|burn/, mood: { temperature: 0.9, weight: 0.9, energy: 1, brightness: -0.2 } },
  { pattern: /孤独|lonely|alone|空|empty|寂寞|沉默|silent/, mood: { temperature: -0.6, weight: 0.2, energy: -0.7, brightness: -0.5 } },
  { pattern: /海|ocean|sea|水|water|浪|wave|潮|tide|河|湖/, mood: { temperature: -0.3, weight: 0, energy: 0.2, brightness: 0 } },
  { pattern: /雨|rain|storm|暴风|thunder|雷/, mood: { temperature: -0.4, weight: 0.5, energy: 0.6, brightness: -0.7 } },
  { pattern: /夜|night|dark|黑|暗|月|moon|星|star/, mood: { temperature: -0.5, weight: 0.3, energy: -0.4, brightness: -0.8 } },
  { pattern: /早|morning|dawn|晨|清|fresh|新|spring|春/, mood: { temperature: 0.2, weight: -0.7, energy: 0.2, brightness: 0.6 } },
  { pattern: /森|forest|tree|leaf|叶|green|草|自然|nature/, mood: { temperature: 0.1, weight: 0, energy: -0.3, brightness: 0.1 } },
  { pattern: /爱|love|心|heart|拥抱|吻|想你|miss/, mood: { temperature: 0.7, weight: 0.2, energy: 0.3, brightness: 0.2 } },
  { pattern: /焦虑|anxiety|慌|panic|乱|chaos|混乱|崩/, mood: { temperature: 0.2, weight: 0.7, energy: 0.9, brightness: -0.3 } },
  { pattern: /梦|dream|幻|fantasy|迷|雾|fog|朦/, mood: { temperature: 0, weight: -0.5, energy: -0.3, brightness: -0.1 } },
  { pattern: /夏|summer|热|hot|sun|太阳/, mood: { temperature: 1, weight: -0.2, energy: 0.5, brightness: 0.8 } },
  { pattern: /冬|winter|冷|cold|冰|ice|雪|snow/, mood: { temperature: -0.9, weight: 0.3, energy: -0.4, brightness: 0.4 } },
  { pattern: /科技|tech|digital|cyber|neon|霓虹|未来|future/, mood: { temperature: -0.2, weight: 0.3, energy: 0.6, brightness: -0.3 } },
  { pattern: /复古|retro|vintage|旧|old|怀旧|nostalg/, mood: { temperature: 0.4, weight: 0.2, energy: -0.3, brightness: 0.1 } },
  { pattern: /极简|minimal|简约|clean|pure|纯/, mood: { temperature: 0, weight: -0.9, energy: -0.6, brightness: 0.5 } },
  { pattern: /奢华|luxury|elegant|优雅|高级|premium/, mood: { temperature: 0.3, weight: 0.5, energy: -0.2, brightness: -0.2 } },
  { pattern: /活力|energetic|vibrant|鲜|vivid|活泼|playful/, mood: { temperature: 0.5, weight: -0.6, energy: 0.8, brightness: 0.5 } },
];

function analyzeMood(text: string): MoodProfile {
  const base: MoodProfile = { temperature: 0, weight: 0, energy: 0, brightness: 0 };
  let matches = 0;
  for (const kw of moodKeywords) {
    if (kw.pattern.test(text)) {
      matches++;
      base.temperature += kw.mood.temperature || 0;
      base.weight += kw.mood.weight || 0;
      base.energy += kw.mood.energy || 0;
      base.brightness += kw.mood.brightness || 0;
    }
  }
  if (matches > 0) {
    base.temperature = Math.max(-1, Math.min(1, base.temperature / matches));
    base.weight = Math.max(-1, Math.min(1, base.weight / matches));
    base.energy = Math.max(-1, Math.min(1, base.energy / matches));
    base.brightness = Math.max(-1, Math.min(1, base.brightness / matches));
  } else {
    const hash = text.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    base.temperature = ((hash % 200) - 100) / 100;
    base.energy = ((hash * 7 % 200) - 100) / 100;
    base.brightness = ((hash * 13 % 200) - 100) / 100;
  }
  return base;
}

type HSL = { h: number; s: number; l: number };
function hslStr(c: HSL) { return `hsl(${c.h}, ${c.s}%, ${c.l}%)`; }
function hsla(c: HSL, a: number) { return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${a})`; }
function hslToHex(h: number, s: number, l: number): string {
  const a = s / 100 * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateSchemes(text: string, mood: MoodProfile): { name: string; nameEn: string; artType: string; colors: HSL[] }[] {
  const hash = text.split("").reduce((s, c) => ((s << 5) - s + c.charCodeAt(0)) & 0x7fffffff, 0);
  let baseHue: number;
  if (mood.temperature > 0.5) baseHue = 10 + (hash % 30);
  else if (mood.temperature > 0) baseHue = 35 + (hash % 35);
  else if (mood.temperature > -0.5) baseHue = 180 + (hash % 50);
  else baseHue = 220 + (hash % 40);
  const satBase = mood.energy > 0 ? 50 + mood.energy * 30 : 25 + (1 + mood.energy) * 25;
  const lightBase = mood.brightness > 0 ? 50 + mood.brightness * 15 : 30 + (1 + mood.brightness) * 20;

  const analogous: HSL[] = [];
  for (let i = 0; i < 5; i++) {
    analogous.push({
      h: (baseHue + (i - 2) * 25 + 360) % 360,
      s: Math.min(80, Math.max(20, satBase + (i % 2 ? 8 : -5))),
      l: Math.min(72, Math.max(22, lightBase + (i - 2) * 7)),
    });
  }

  const complement: HSL[] = [
    { h: baseHue, s: satBase, l: lightBase },
    { h: (baseHue + 15) % 360, s: Math.max(20, satBase - 10), l: Math.min(70, lightBase + 10) },
    { h: (baseHue + 150 + (hash % 20)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 180) % 360, s: Math.max(20, satBase - 5), l: Math.min(70, lightBase + 5) },
    { h: (baseHue + 210 + (hash % 15)) % 360, s: Math.max(20, satBase - 8), l: Math.max(22, lightBase - 8) },
  ];

  const triadic: HSL[] = [
    { h: baseHue, s: satBase, l: lightBase },
    { h: (baseHue + 20) % 360, s: Math.max(20, satBase - 15), l: Math.min(72, lightBase + 12) },
    { h: (baseHue + 120 + (hash % 15)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 240 + (hash % 15)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 260) % 360, s: Math.max(20, satBase - 12), l: Math.max(22, lightBase - 10) },
  ];

  return [
    { name: "类比", nameEn: "Analogous", artType: "flow", colors: analogous },
    { name: "互补", nameEn: "Complementary", artType: "collision", colors: complement },
    { name: "三角", nameEn: "Triadic", artType: "orbit", colors: triadic },
  ];
}

// ---- Generative Art Canvas ----
function GenArtCanvas({ colors, artType, mood }: { colors: HSL[]; artType: string; mood: MoodProfile }) {
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

    const bgL = mood.brightness > 0 ? 95 : 8;
    ctx.fillStyle = `hsl(${colors[0].h}, ${colors[0].s * 0.2}%, ${bgL}%)`;
    ctx.fillRect(0, 0, w, h);

    let time = 0;

    // Flow art: smooth flowing curves
    const flowParticles: { x: number; y: number; ci: number; age: number }[] = [];
    for (let i = 0; i < 200; i++) {
      flowParticles.push({ x: Math.random() * w, y: Math.random() * h, ci: i % 5, age: Math.random() * 100 });
    }

    // Collision art: particles that bounce and leave trails
    const colliders: { x: number; y: number; vx: number; vy: number; ci: number; r: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      colliders.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        ci: i % 5, r: 3 + Math.random() * 8,
      });
    }

    // Orbit art: rotating shapes around centers
    const orbiters: { cx: number; cy: number; r: number; angle: number; speed: number; ci: number; size: number }[] = [];
    const centers = [
      { x: w * 0.3, y: h * 0.4 },
      { x: w * 0.7, y: h * 0.5 },
      { x: w * 0.5, y: h * 0.7 },
    ];
    for (let i = 0; i < 60; i++) {
      const center = centers[i % 3];
      orbiters.push({
        cx: center.x, cy: center.y,
        r: 20 + Math.random() * 80,
        angle: Math.random() * Math.PI * 2,
        speed: (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        ci: i % 5,
        size: 2 + Math.random() * 5,
      });
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 1 / 60;

      // Soft fade
      ctx.fillStyle = `hsla(${colors[0].h}, ${colors[0].s * 0.2}%, ${bgL}%, 0.03)`;
      ctx.fillRect(0, 0, w, h);

      if (artType === "flow") {
        // Perlin-like flow field
        for (const p of flowParticles) {
          const angle = (Math.sin(p.x * 0.008 + time * 0.3) + Math.cos(p.y * 0.006 + time * 0.2)) * Math.PI;
          const speed = 0.6 + mood.energy * 0.4;
          p.x += Math.cos(angle) * speed;
          p.y += Math.sin(angle) * speed;
          p.age++;

          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.age > 300) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.age = 0;
            p.ci = Math.floor(Math.random() * 5);
          }

          const c = colors[p.ci];
          const alpha = Math.min(p.age / 30, 1) * 0.6;
          ctx.fillStyle = hsla(c, alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (artType === "collision") {
        for (const p of colliders) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
          p.y = Math.max(0, Math.min(h, p.y));

          const c = colors[p.ci];

          // Glow trail
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, hsla(c, 0.15));
          g.addColorStop(1, hsla(c, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = hsla(c, 0.7);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Connection lines between nearby particles
        for (let i = 0; i < colliders.length; i++) {
          for (let j = i + 1; j < colliders.length; j++) {
            const dx = colliders[i].x - colliders[j].x;
            const dy = colliders[i].y - colliders[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const c = colors[colliders[i].ci];
              ctx.strokeStyle = hsla(c, (1 - dist / 80) * 0.2);
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
          const y = o.cy + Math.sin(o.angle) * o.r * 0.6; // Elliptical

          const c = colors[o.ci];
          ctx.fillStyle = hsla(c, 0.5);
          ctx.beginPath();
          ctx.arc(x, y, o.size, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          const trailX = o.cx + Math.cos(o.angle - o.speed * 3) * o.r;
          const trailY = o.cy + Math.sin(o.angle - o.speed * 3) * o.r * 0.6;
          ctx.strokeStyle = hsla(c, 0.12);
          ctx.lineWidth = o.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(trailX, trailY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Center glows
        for (const center of centers) {
          const ci = centers.indexOf(center);
          const c = colors[ci];
          const g = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 25);
          g.addColorStop(0, hsla(c, 0.2));
          g.addColorStop(1, hsla(c, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animate();

    return () => cancelAnimationFrame(frameRef.current);
  }, [colors, artType, mood]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: "8px",
        display: "block",
      }}
    />
  );
}

// ---- Main Component ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!submittedText) return null;
    const mood = analyzeMood(submittedText);
    const schemes = generateSchemes(submittedText, mood);
    return { mood, schemes };
  }, [submittedText]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmittedText(text.trim());
  };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = (colors: HSL[], id: string) => {
    const hexes = colors.map(c => hslToHex(c.h, c.s, c.l)).join(", ");
    navigator.clipboard?.writeText(hexes);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  if (!result) {
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
          placeholder="科技感、温柔的夜晚、暴雨、春天..."
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
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
          fontSize: "0.85rem", color: "rgba(255,250,240,0.35)", letterSpacing: "0.1em",
        }}>
          {submittedText}
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
            color: "rgba(255,250,240,0.15)", marginTop: "0.5rem", cursor: "pointer",
          }}
          onClick={() => { setSubmittedText(""); setText(""); }}
        >
          ← new input
        </p>
      </div>

      {/* Schemes with generative art */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "3rem",
        width: "min(92vw, 520px)",
      }}>
        {result.schemes.map((scheme) => (
          <div key={scheme.nameEn} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {/* Label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{
                  fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
                  fontSize: "0.75rem", color: "rgba(255,250,240,0.35)",
                }}>
                  {scheme.name}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem", color: "rgba(255,250,240,0.15)", marginLeft: "0.5rem",
                }}>
                  {scheme.nameEn}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.5rem", color: "rgba(255,250,240,0.15)", cursor: "pointer",
                }}
                onClick={() => copyAll(scheme.colors, scheme.nameEn)}
              >
                {copied === scheme.nameEn ? "✓ copied" : "copy all"}
              </span>
            </div>

            {/* Generative Art Canvas */}
            <GenArtCanvas colors={scheme.colors} artType={scheme.artType} mood={result.mood} />

            {/* Swatches */}
            <div style={{ display: "flex", gap: "6px" }}>
              {scheme.colors.map((c, i) => {
                const hex = hslToHex(c.h, c.s, c.l);
                return (
                  <div key={i} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
                    <div style={{
                      width: "100%", aspectRatio: "1", borderRadius: "6px",
                      background: hslStr(c),
                      border: "1px solid rgba(255,255,255,0.06)",
                    }} />
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.5rem",
                      color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)",
                      marginTop: "4px",
                    }}>
                      {copied === hex ? "✓" : hex}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
        color: "rgba(255,250,240,0.1)", marginTop: "3rem",
      }}>
        click swatch to copy · each canvas shows your palette alive
      </p>
    </div>
  );
}
