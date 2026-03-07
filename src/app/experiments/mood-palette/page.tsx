"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---- Mood Detection ----
interface MoodProfile {
  temperature: number; // -1 cold, 0 neutral, 1 warm
  weight: number; // -1 light, 0 neutral, 1 heavy
  energy: number; // -1 calm, 0 neutral, 1 intense
  brightness: number; // -1 dark, 0 neutral, 1 bright
  visualMode: "waves" | "rain" | "drift" | "shatter" | "bloom" | "mist";
}

const moodKeywords: { pattern: RegExp; mood: Partial<MoodProfile> }[] = [
  // Calm / gentle
  { pattern: /温柔|gentle|soft|柔|轻|安静|宁静|平静|quiet|calm|peace|静/, mood: { temperature: 0.3, weight: -0.8, energy: -0.8, brightness: 0.3, visualMode: "drift" } },
  // Happy / warm
  { pattern: /开心|快乐|幸福|happy|joy|温暖|warm|阳光|sunshine|笑|甜|sweet/, mood: { temperature: 0.8, weight: -0.5, energy: 0.3, brightness: 0.7, visualMode: "bloom" } },
  // Sad / melancholy
  { pattern: /悲伤|难过|忧|sad|sorrow|melanchol|眼泪|tear|哭|cry|失去|loss|离/, mood: { temperature: -0.5, weight: 0.6, energy: -0.5, brightness: -0.6, visualMode: "rain" } },
  // Anger / intensity
  { pattern: /愤怒|生气|anger|angry|rage|fury|暴|烈|fire|火|燃|burn|炸/, mood: { temperature: 0.9, weight: 0.9, energy: 1, brightness: -0.2, visualMode: "shatter" } },
  // Lonely / empty
  { pattern: /孤独|lonely|alone|空|empty|寂寞|isolation|一个人|无人|沉默|silent/, mood: { temperature: -0.6, weight: 0.2, energy: -0.7, brightness: -0.5, visualMode: "mist" } },
  // Ocean / water
  { pattern: /海|ocean|sea|水|water|浪|wave|潮|tide|river|河|湖|lake/, mood: { temperature: -0.3, weight: 0, energy: 0.2, brightness: 0, visualMode: "waves" } },
  // Rain / storm
  { pattern: /雨|rain|storm|暴风|thunder|雷|风暴/, mood: { temperature: -0.4, weight: 0.5, energy: 0.6, brightness: -0.7, visualMode: "rain" } },
  // Night / dark
  { pattern: /夜|night|dark|黑|暗|shadow|影|月|moon|星|star/, mood: { temperature: -0.5, weight: 0.3, energy: -0.4, brightness: -0.8, visualMode: "drift" } },
  // Morning / fresh
  { pattern: /早|morning|dawn|晨|清|fresh|新|spring|春|薄荷|mint/, mood: { temperature: 0.2, weight: -0.7, energy: 0.2, brightness: 0.6, visualMode: "bloom" } },
  // Forest / nature
  { pattern: /森|forest|tree|木|leaf|叶|green|草|grass|自然|nature/, mood: { temperature: 0.1, weight: 0, energy: -0.3, brightness: 0.1, visualMode: "drift" } },
  // Love
  { pattern: /爱|love|心|heart|拥抱|embrace|吻|kiss|想你|miss/, mood: { temperature: 0.7, weight: 0.2, energy: 0.3, brightness: 0.2, visualMode: "bloom" } },
  // Chaos / anxiety
  { pattern: /焦虑|anxiety|anxious|慌|panic|乱|chaos|混乱|崩|crash|碎/, mood: { temperature: 0.2, weight: 0.7, energy: 0.9, brightness: -0.3, visualMode: "shatter" } },
  // Dream / surreal
  { pattern: /梦|dream|幻|fantasy|unreal|迷|haze|雾|fog|朦/, mood: { temperature: 0, weight: -0.5, energy: -0.3, brightness: -0.1, visualMode: "mist" } },
  // Summer / heat
  { pattern: /夏|summer|热|hot|sun|太阳|炎|灼/, mood: { temperature: 1, weight: -0.2, energy: 0.5, brightness: 0.8, visualMode: "bloom" } },
  // Winter / cold
  { pattern: /冬|winter|冷|cold|freeze|冰|ice|雪|snow/, mood: { temperature: -0.9, weight: 0.3, energy: -0.4, brightness: 0.4, visualMode: "drift" } },
];

function analyzeMood(text: string): MoodProfile {
  const base: MoodProfile = { temperature: 0, weight: 0, energy: 0, brightness: 0, visualMode: "drift" };
  let matches = 0;

  for (const kw of moodKeywords) {
    if (kw.pattern.test(text)) {
      matches++;
      if (kw.mood.temperature !== undefined) base.temperature += kw.mood.temperature;
      if (kw.mood.weight !== undefined) base.weight += kw.mood.weight;
      if (kw.mood.energy !== undefined) base.energy += kw.mood.energy;
      if (kw.mood.brightness !== undefined) base.brightness += kw.mood.brightness;
      base.visualMode = kw.mood.visualMode || base.visualMode;
    }
  }

  if (matches > 0) {
    base.temperature = Math.max(-1, Math.min(1, base.temperature / matches));
    base.weight = Math.max(-1, Math.min(1, base.weight / matches));
    base.energy = Math.max(-1, Math.min(1, base.energy / matches));
    base.brightness = Math.max(-1, Math.min(1, base.brightness / matches));
  } else {
    // Fallback: derive from character properties
    const hash = text.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    base.temperature = ((hash % 200) - 100) / 100;
    base.energy = ((hash * 7 % 200) - 100) / 100;
    base.brightness = ((hash * 13 % 200) - 100) / 100;
    const modes: MoodProfile["visualMode"][] = ["waves", "drift", "bloom", "mist"];
    base.visualMode = modes[hash % modes.length];
  }

  return base;
}

// ---- Color Generation ----
function generatePalette(text: string, mood: MoodProfile): { h: number; s: number; l: number }[] {
  const hash = text.split("").reduce((s, c) => ((s << 5) - s + c.charCodeAt(0)) & 0x7fffffff, 0);

  // Base hue from mood temperature
  let baseHue: number;
  if (mood.temperature > 0.5) baseHue = 10 + (hash % 30); // warm reds/oranges
  else if (mood.temperature > 0) baseHue = 30 + (hash % 40); // warm yellows/ambers
  else if (mood.temperature > -0.5) baseHue = 180 + (hash % 60); // cool blues/teals
  else baseHue = 220 + (hash % 40); // cold blues/indigos

  // Saturation from energy
  const satBase = mood.energy > 0 ? 50 + mood.energy * 30 : 25 + (1 + mood.energy) * 25;

  // Lightness from brightness
  const lightBase = mood.brightness > 0 ? 45 + mood.brightness * 20 : 25 + (1 + mood.brightness) * 20;

  const colors: { h: number; s: number; l: number }[] = [];
  const spread = mood.energy > 0 ? 40 + mood.energy * 60 : 20 + (1 + mood.energy) * 20;

  for (let i = 0; i < 5; i++) {
    const hueOffset = (i - 2) * spread / 4 + ((hash >> (i * 3)) % 15);
    const h = (baseHue + hueOffset + 360) % 360;
    const s = Math.min(85, Math.max(15, satBase + (i % 2 === 0 ? 10 : -10) + ((hash >> (i * 5)) % 10)));
    const l = Math.min(75, Math.max(18, lightBase + (i - 2) * 8));
    colors.push({ h, s, l });
  }

  return colors;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s / 100 * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ---- Visual Renderers ----
type Renderer = (
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  palette: { h: number; s: number; l: number }[],
  mood: MoodProfile,
  time: number
) => void;

const renderers: Record<MoodProfile["visualMode"], Renderer> = {
  // Gentle floating blobs
  drift: (ctx, w, h, palette, mood, time) => {
    ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.3}%, ${mood.brightness > 0 ? 92 : 8}%, 0.06)`;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const c = palette[i % 5];
      const x = w * 0.5 + Math.sin(time * 0.3 + i * 1.2) * w * 0.3;
      const y = h * 0.5 + Math.cos(time * 0.2 + i * 0.9) * h * 0.25;
      const r = 80 + Math.sin(time * 0.5 + i) * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.25)`);
      g.addColorStop(1, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // Rain drops
  rain: (() => {
    const drops: { x: number; y: number; speed: number; len: number; ci: number }[] = [];
    let inited = false;
    return (ctx, w, h, palette, mood, time) => {
      if (!inited || drops.length === 0) {
        drops.length = 0;
        for (let i = 0; i < 150; i++) {
          drops.push({
            x: Math.random() * w,
            y: Math.random() * h,
            speed: 3 + Math.random() * 5,
            len: 10 + Math.random() * 20,
            ci: Math.floor(Math.random() * 5),
          });
        }
        inited = true;
      }
      ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.2}%, ${mood.brightness > 0 ? 90 : 6}%, 0.15)`;
      ctx.fillRect(0, 0, w, h);
      for (const d of drops) {
        d.y += d.speed;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
        const c = palette[d.ci];
        ctx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 1, d.y + d.len);
        ctx.stroke();
      }
      // Ripples at bottom
      for (let i = 0; i < 3; i++) {
        const rx = (Math.sin(time * 2 + i * 3) * 0.5 + 0.5) * w;
        const ry = h - 40 + Math.sin(time * 3 + i) * 10;
        const c = palette[i % 5];
        ctx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${0.15 - (time * 0.3 % 1) * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 15 + (time * 20 % 30), 5 + (time * 8 % 10), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
  })(),

  // Waves
  waves: (ctx, w, h, palette, mood) => {
    ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.3}%, ${mood.brightness > 0 ? 90 : 8}%, 0.08)`;
    ctx.fillRect(0, 0, w, h);
    const t = performance.now() / 1000;
    for (let layer = 0; layer < 4; layer++) {
      const c = palette[layer + 1];
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) {
        const y = h * (0.4 + layer * 0.12) +
          Math.sin(x * 0.008 + t * (0.5 + layer * 0.2)) * 25 +
          Math.sin(x * 0.015 + t * 0.3 + layer) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${0.12 - layer * 0.02})`;
      ctx.fill();
    }
  },

  // Shattering fragments
  shatter: (() => {
    const frags: { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; ci: number; life: number }[] = [];
    let lastSpawn = 0;
    return (ctx, w, h, palette, mood) => {
      const t = performance.now() / 1000;
      ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.2}%, ${mood.brightness > 0 ? 88 : 5}%, 0.12)`;
      ctx.fillRect(0, 0, w, h);

      if (t - lastSpawn > 0.15) {
        lastSpawn = t;
        const cx = w / 2 + (Math.random() - 0.5) * w * 0.3;
        const cy = h / 2 + (Math.random() - 0.5) * h * 0.3;
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          frags.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.1,
            size: 5 + Math.random() * 15,
            ci: Math.floor(Math.random() * 5),
            life: 1,
          });
        }
      }

      for (let i = frags.length - 1; i >= 0; i--) {
        const f = frags[i];
        f.x += f.vx;
        f.y += f.vy;
        f.rot += f.vr;
        f.life -= 0.005;
        if (f.life <= 0) { frags.splice(i, 1); continue; }
        const c = palette[f.ci];
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${f.life * 0.6})`;
        ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size * 0.6);
        ctx.restore();
      }
      if (frags.length > 300) frags.splice(0, 50);
    };
  })(),

  // Blooming circles
  bloom: (() => {
    const circles: { x: number; y: number; r: number; maxR: number; ci: number; alpha: number }[] = [];
    let lastSpawn = 0;
    return (ctx, w, h, palette, mood) => {
      const t = performance.now() / 1000;
      ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.2}%, ${mood.brightness > 0 ? 95 : 8}%, 0.06)`;
      ctx.fillRect(0, 0, w, h);

      if (t - lastSpawn > 0.8) {
        lastSpawn = t;
        circles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0,
          maxR: 60 + Math.random() * 100,
          ci: Math.floor(Math.random() * 5),
          alpha: 0.4,
        });
      }

      for (let i = circles.length - 1; i >= 0; i--) {
        const cir = circles[i];
        cir.r += 0.5;
        cir.alpha -= 0.002;
        if (cir.alpha <= 0 || cir.r > cir.maxR) { circles.splice(i, 1); continue; }
        const c = palette[cir.ci];
        ctx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${cir.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cir.x, cir.y, cir.r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const g = ctx.createRadialGradient(cir.x, cir.y, 0, cir.x, cir.y, cir.r);
        g.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, ${cir.alpha * 0.15})`);
        g.addColorStop(1, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0)`);
        ctx.fillStyle = g;
        ctx.fill();
      }
      if (circles.length > 40) circles.splice(0, 10);
    };
  })(),

  // Floating mist
  mist: (ctx, w, h, palette, mood) => {
    ctx.fillStyle = `hsla(${palette[0].h}, ${palette[0].s * 0.2}%, ${mood.brightness > 0 ? 92 : 7}%, 0.04)`;
    ctx.fillRect(0, 0, w, h);
    const t = performance.now() / 1000;
    for (let i = 0; i < 6; i++) {
      const c = palette[i % 5];
      const x = w * (0.2 + i * 0.12) + Math.sin(t * 0.15 + i * 2) * w * 0.15;
      const y = h * 0.5 + Math.cos(t * 0.1 + i * 1.5) * h * 0.2;
      const rx = 150 + Math.sin(t * 0.2 + i) * 50;
      const ry = 80 + Math.cos(t * 0.15 + i) * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, `hsla(${c.h}, ${c.s * 0.6}%, ${c.l}%, 0.08)`);
      g.addColorStop(0.5, `hsla(${c.h}, ${c.s * 0.4}%, ${c.l}%, 0.04)`);
      g.addColorStop(1, `hsla(${c.h}, ${c.s * 0.3}%, ${c.l}%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, t * 0.05 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

// ---- Component ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [palette, setPalette] = useState<{ h: number; s: number; l: number }[] | null>(null);
  const [mood, setMood] = useState<MoodProfile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!submitted || !palette || !mood) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    // Clear with bg color
    const bgL = mood.brightness > 0 ? 92 : 8;
    ctx.fillStyle = `hsl(${palette[0].h}, ${palette[0].s * 0.3}%, ${bgL}%)`;
    ctx.fillRect(0, 0, w, h);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = renderers[mood.visualMode];
    let time = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 1 / 60;
      render(ctx, w, h, palette, mood, time);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [submitted, palette, mood]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const m = analyzeMood(text.trim());
    const p = generatePalette(text.trim(), m);
    setMood(m);
    setPalette(p);
    setSubmitted(true);
  };

  const handleDownload = () => {
    if (!palette || !mood) return;
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = 1920;
    dlCanvas.height = 1080;
    const dlCtx = dlCanvas.getContext("2d");
    if (!dlCtx) return;

    const bgL = mood.brightness > 0 ? 92 : 8;
    dlCtx.fillStyle = `hsl(${palette[0].h}, ${palette[0].s * 0.3}%, ${bgL}%)`;
    dlCtx.fillRect(0, 0, 1920, 1080);

    const render = renderers[mood.visualMode];
    for (let i = 0; i < 120; i++) {
      render(dlCtx, 1920, 1080, palette, mood, i / 60);
    }

    // Palette strip
    const stripY = 1020;
    const stripW = 60;
    const startX = 1920 / 2 - (5 * stripW + 4 * 8) / 2;
    for (let i = 0; i < 5; i++) {
      const c = palette[i];
      dlCtx.fillStyle = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
      dlCtx.beginPath();
      dlCtx.roundRect(startX + i * (stripW + 8), stripY, stripW, 36, 4);
      dlCtx.fill();
    }

    const link = document.createElement("a");
    link.download = `mood-${text.trim().slice(0, 10)}.png`;
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  };

  const textColor = mood && mood.brightness > 0 ? "rgba(30, 30, 35," : "rgba(255, 250, 240,";
  const isDark = !mood || mood.brightness <= 0;

  if (!submitted) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#050508",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 300,
            fontSize: "0.875rem",
            color: "rgba(255, 250, 240, 0.4)",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
          }}
        >
          情绪调色板
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.7rem",
            color: "rgba(255, 250, 240, 0.2)",
            letterSpacing: "0.1em",
            marginBottom: "3rem",
          }}
        >
          MOOD PALETTE
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="输入一句话、一个词、一种感觉..."
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(255, 250, 240, 0.15)",
            color: "rgba(255, 250, 240, 0.7)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "1rem",
            fontWeight: 300,
            padding: "0.75rem 0",
            width: "min(80vw, 400px)",
            textAlign: "center",
            outline: "none",
            letterSpacing: "0.05em",
          }}
          autoFocus
        />
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: "rgba(255, 250, 240, 0.12)",
            marginTop: "2rem",
          }}
        >
          press enter
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Input text */}
      <div
        style={{
          position: "fixed",
          top: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 300,
            fontSize: "0.8rem",
            color: `${textColor} 0.35)`,
            letterSpacing: "0.1em",
          }}
        >
          {text}
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.55rem",
            color: `${textColor} 0.2)`,
            marginTop: "0.3rem",
          }}
        >
          {mood?.visualMode}
        </p>
      </div>

      {/* Palette */}
      {palette && (
        <div
          style={{
            position: "fixed",
            bottom: "4rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "12px",
            zIndex: 10,
          }}
        >
          {palette.map((c, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "6px",
                  background: `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
                  cursor: "pointer",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                }}
                title={hslToHex(c.h, c.s, c.l)}
                onClick={() => navigator.clipboard?.writeText(hslToHex(c.h, c.s, c.l))}
              />
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem",
                  color: `${textColor} 0.3)`,
                  marginTop: "6px",
                }}
              >
                {hslToHex(c.h, c.s, c.l)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "2rem",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: `${textColor} 0.2)`,
            cursor: "pointer",
          }}
          onClick={() => { setSubmitted(false); setPalette(null); setMood(null); setText(""); }}
        >
          new
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: `${textColor} 0.2)`,
            cursor: "pointer",
          }}
          onClick={handleDownload}
        >
          download
        </p>
      </div>
    </div>
  );
}
