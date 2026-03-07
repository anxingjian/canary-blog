"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Hash string to deterministic number
function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate palette from text
function generatePalette(text: string): { h: number; s: number; l: number }[] {
  const hash = hashStr(text);
  const baseHue = hash % 360;
  const chars = text.split("");
  const charSum = chars.reduce((sum, c) => sum + c.charCodeAt(0), 0);

  // Mood detection through character analysis
  const len = text.length;
  const satBase = 40 + (charSum % 35);
  const lightBase = 35 + (hash % 25);

  const colors: { h: number; s: number; l: number }[] = [];

  // 5 colors with harmonic relationships
  const harmonies = [0, 30 + (hash % 20), 150 + (hash % 60), 210 + (hash % 30), 330 + (hash % 30)];

  for (let i = 0; i < 5; i++) {
    const h = (baseHue + harmonies[i] + (i * charSum % 30)) % 360;
    const s = Math.min(90, satBase + (i * 7) - (i > 2 ? 15 : 0));
    const l = Math.min(75, Math.max(20, lightBase + (i * 8) - (i > 3 ? 20 : 0)));
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

// Particle system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIdx: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function MoodPalette() {
  const [text, setText] = useState("");
  const [palette, setPalette] = useState<{ h: number; s: number; l: number }[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const paletteRef = useRef<{ h: number; s: number; l: number }[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 40 + 10,
        colorIdx: Math.floor(Math.random() * 5),
        alpha: Math.random() * 0.4 + 0.1,
        life: Math.random() * 300,
        maxLife: 300 + Math.random() * 200,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (!submitted || !palette) return;
    paletteRef.current = palette;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    initParticles(w, h);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const p = paletteRef.current;

      // Background: darkest variant of first color
      ctx.fillStyle = `hsla(${p[0].h}, ${p[0].s * 0.3}%, ${8}%, 0.08)`;
      ctx.fillRect(0, 0, w, h);

      // Draw particles
      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        if (particle.life > particle.maxLife) {
          particle.x = Math.random() * w;
          particle.y = Math.random() * h;
          particle.life = 0;
          particle.colorIdx = Math.floor(Math.random() * 5);
        }

        // Wrap
        if (particle.x < -50) particle.x = w + 50;
        if (particle.x > w + 50) particle.x = -50;
        if (particle.y < -50) particle.y = h + 50;
        if (particle.y > h + 50) particle.y = -50;

        const lifeRatio = particle.life / particle.maxLife;
        const fadeIn = Math.min(lifeRatio * 5, 1);
        const fadeOut = lifeRatio > 0.8 ? 1 - (lifeRatio - 0.8) / 0.2 : 1;
        const alpha = particle.alpha * fadeIn * fadeOut;

        const c = p[particle.colorIdx];
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [submitted, palette, initParticles]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const p = generatePalette(text.trim());
    setPalette(p);
    setSubmitted(true);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !palette) return;

    // Draw a clean frame for download
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = 1920;
    dlCanvas.height = 1080;
    const dlCtx = dlCanvas.getContext("2d");
    if (!dlCtx) return;

    // Background
    dlCtx.fillStyle = `hsl(${palette[0].h}, ${palette[0].s * 0.3}%, 8%)`;
    dlCtx.fillRect(0, 0, 1920, 1080);

    // Large blobs
    for (let i = 0; i < 80; i++) {
      const c = palette[Math.floor(Math.random() * 5)];
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const r = Math.random() * 200 + 50;
      const g = dlCtx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, ${Math.random() * 0.3 + 0.05})`);
      g.addColorStop(1, `hsla(${c.h}, ${c.s}%, ${c.l}%, 0)`);
      dlCtx.fillStyle = g;
      dlCtx.beginPath();
      dlCtx.arc(x, y, r, 0, Math.PI * 2);
      dlCtx.fill();
    }

    // Palette strip at bottom
    const stripY = 1020;
    const stripH = 40;
    const stripW = 80;
    const startX = 1920 / 2 - (5 * stripW + 4 * 10) / 2;
    for (let i = 0; i < 5; i++) {
      const c = palette[i];
      dlCtx.fillStyle = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
      dlCtx.beginPath();
      dlCtx.roundRect(startX + i * (stripW + 10), stripY, stripW, stripH, 4);
      dlCtx.fill();
    }

    const link = document.createElement("a");
    link.download = `mood-${text.trim().slice(0, 10)}.png`;
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  };

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

      {/* Input text display */}
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
            color: "rgba(255, 250, 240, 0.35)",
            letterSpacing: "0.1em",
          }}
        >
          {text}
        </p>
      </div>

      {/* Palette swatches */}
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
                  transition: "transform 0.2s",
                }}
                title={hslToHex(c.h, c.s, c.l)}
                onClick={() => navigator.clipboard?.writeText(hslToHex(c.h, c.s, c.l))}
              />
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem",
                  color: "rgba(255, 250, 240, 0.3)",
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
            color: "rgba(255, 250, 240, 0.2)",
            cursor: "pointer",
          }}
          onClick={() => {
            setSubmitted(false);
            setPalette(null);
            setText("");
          }}
        >
          new
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: "rgba(255, 250, 240, 0.2)",
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
