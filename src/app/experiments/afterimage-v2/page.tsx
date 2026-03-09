"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/*
 * 寒江独钓 — Solitary Angler on a Winter River
 * 
 * Pure Canvas 2D — no WebGL dependencies, runs everywhere.
 * 
 * 90% of the painting is emptiness. The emptiness IS the painting.
 * A few thousand particles: most are near-invisible mist,
 * a handful condense into the boat, the figure, the rod.
 * Move your cursor close — even these dissolve.
 */

// ---- Simple 2D curl noise (CPU) ----
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) / 2147483648;
}

function noise2d(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy), n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1), n11 = hash(ix + 1, iy + 1);
  return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) +
         n01 * (1 - sx) * sy + n11 * sx * sy;
}

function curlNoise2d(x: number, y: number, t: number): [number, number] {
  const e = 0.01;
  const n1 = noise2d(x, y + e + t * 0.1);
  const n2 = noise2d(x, y - e + t * 0.1);
  const n3 = noise2d(x + e, y + t * 0.1);
  const n4 = noise2d(x - e, y + t * 0.1);
  return [(n1 - n2) / (2 * e), -(n3 - n4) / (2 * e)];
}

// ---- Particle types ----
interface Particle {
  x: number; y: number;       // current position
  ox: number; oy: number;     // origin position
  vx: number; vy: number;     // velocity
  role: number;               // 0 = void, 1 = ink
  life: number;
  size: number;
}

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  const N = 6000; // enough for visual density, smooth on mobile

  for (let i = 0; i < N; i++) {
    const r = Math.random();
    let x: number, y: number, role: number, size: number;

    if (r < 0.012) {
      // BOAT — thin curved stroke
      const t = Math.random();
      x = -0.03 + (t - 0.5) * 0.22;
      y = -0.15 + Math.pow(Math.abs(t - 0.5) * 2, 2) * -0.025;
      x += (Math.random() - 0.5) * 0.008;
      y += (Math.random() - 0.5) * 0.004;
      role = 0.85 + Math.random() * 0.15;
      size = 1.5 + Math.random() * 1.5;
    } else if (r < 0.02) {
      // FIGURE — hunched on boat
      const a = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.028;
      x = -0.025 + Math.cos(a) * rad * 0.5;
      y = -0.1 + Math.sin(a) * rad * 1.1 + 0.015;
      role = 0.7 + Math.random() * 0.3;
      size = 1.2 + Math.random() * 1.5;
    } else if (r < 0.025) {
      // HEAD
      x = -0.025 + (Math.random() - 0.5) * 0.015;
      y = -0.065 + (Math.random() - 0.5) * 0.015;
      role = 0.85 + Math.random() * 0.15;
      size = 1.5 + Math.random() * 1;
    } else if (r < 0.035) {
      // FISHING ROD — diagonal line
      const t = Math.random();
      x = -0.02 + t * 0.13;
      y = -0.07 + t * 0.09 + Math.sin(t * Math.PI) * 0.012;
      x += (Math.random() - 0.5) * 0.003;
      y += (Math.random() - 0.5) * 0.003;
      role = 0.5 + Math.random() * 0.3;
      size = 0.8 + Math.random() * 0.8;
    } else if (r < 0.042) {
      // FISHING LINE — thin vertical
      const t = Math.random();
      x = 0.11 + Math.sin(t * Math.PI * 0.5) * 0.006;
      y = 0.02 - t * 0.1;
      x += (Math.random() - 0.5) * 0.002;
      role = 0.35 + Math.random() * 0.2;
      size = 0.5 + Math.random() * 0.5;
    } else if (r < 0.07) {
      // WATER RIPPLES
      const ring = Math.floor(Math.random() * 5);
      const ringR = 0.05 + ring * 0.03;
      const a = (Math.random() - 0.5) * Math.PI * 0.7;
      x = -0.03 + Math.cos(a) * ringR;
      y = -0.18 + Math.sin(a) * ringR * 0.2;
      x += (Math.random() - 0.5) * 0.006;
      y += (Math.random() - 0.5) * 0.003;
      role = 0.15 + Math.random() * 0.12;
      size = 0.6 + Math.random() * 0.8;
    } else {
      // VOID — the vast emptiness
      const a = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.6) * 0.9;
      x = Math.cos(a) * rad;
      y = Math.sin(a) * rad;
      role = Math.random() * 0.06;
      size = 0.3 + Math.random() * 0.5;
    }

    const scatter = (1 - role) * 1.5;
    particles.push({
      x: x + (Math.random() - 0.5) * scatter,
      y: y + (Math.random() - 0.5) * scatter,
      ox: x, oy: y,
      vx: 0, vy: 0,
      role,
      life: Math.random(),
      size,
    });
  }

  return particles;
}

// ---- Seal stamp ----
function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#8B2500";
  ctx.lineWidth = 1.5 * scale;
  const s = 18 * scale;
  ctx.strokeRect(x - s, y - s, s * 2, s * 2);
  ctx.fillStyle = "#8B2500";
  ctx.font = `${12 * scale}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("余", x, y + 1);
  ctx.restore();
}

export default function AfterimageV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  const mouseRef = useRef({ x: 9999, y: 9999 });
  const targetMouseRef = useRef({ x: 9999, y: 9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetMouseRef.current.x = e.clientX;
    targetMouseRef.current.y = e.clientY;
  }, []);
  const onMouseLeave = useCallback(() => {
    targetMouseRef.current.x = 9999;
    targetMouseRef.current.y = 9999;
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      targetMouseRef.current.x = e.touches[0].clientX;
      targetMouseRef.current.y = e.touches[0].clientY;
    }
  }, []);
  const onTouchEnd = useCallback(() => {
    targetMouseRef.current.x = 9999;
    targetMouseRef.current.y = 9999;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const particles = createParticles();
    let time = 0;
    let prevTime = performance.now();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      time += dt;

      const w = canvas!.width;
      const h = canvas!.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);

      // Smooth mouse
      const m = mouseRef.current;
      const tm = targetMouseRef.current;
      m.x += (tm.x - m.x) * 0.05;
      m.y += (tm.y - m.y) * 0.05;

      // Mouse in normalized coords
      const mx = (m.x * dpr - cx) / scale;
      const my = -(m.y * dpr - cy) / scale;

      // Assembly progress (0→1 over 8 seconds)
      const assembleT = Math.min(time / 8, 1);
      const returnStr = 0.3 + assembleT * 2.0;
      const curlStr = 0.4 - assembleT * 0.25;

      // Clear with paper color
      ctx.fillStyle = "#f0ebe0";
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        // Curl noise
        const [cx2, cy2] = curlNoise2d(p.x * 1.5, p.y * 1.5, time * 0.12);
        const curlAmt = (1 - p.role * 0.7) * curlStr;
        p.vx += cx2 * curlAmt * dt;
        p.vy += cy2 * curlAmt * dt;

        // Return to origin
        const dx = p.ox - p.x;
        const dy = p.oy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ret = p.role * returnStr * Math.min(dist, 0.5) * dt;
        if (dist > 0.001) {
          p.vx += (dx / dist) * ret;
          p.vy += (dy / dist) * ret;
        }

        // Mouse repulsion
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 0.15 && mDist > 0.001) {
          const repel = 0.3 * Math.max(0, 1 - mDist / 0.15) * dt;
          p.vx += (mdx / mDist) * repel;
          p.vy += (mdy / mDist) * repel;
        }

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Life
        p.life -= dt * 0.08 * (1 - p.role * 0.8);
        if (p.life < 0) {
          p.x = p.ox + (Math.random() - 0.5) * 0.02;
          p.y = p.oy + (Math.random() - 0.5) * 0.02;
          p.life = 1;
        }

        // Draw
        const sx = cx + p.x * scale;
        const sy = cy - p.y * scale;

        const lifeFade = Math.max(0, Math.min(1, p.life / 0.3));
        const baseAlpha = p.role < 0.1 ? 0.015 + p.role * 0.1
                        : p.role < 0.3 ? 0.05 + (p.role - 0.1) * 0.5
                        : 0.15 + (p.role - 0.3) * 1.2;
        const alpha = Math.min(1, baseAlpha * lifeFade);

        if (alpha < 0.005) continue;

        // Color
        const ink = p.role;
        const r2 = Math.round(235 - ink * 200);
        const g2 = Math.round(230 - ink * 198);
        const b2 = Math.round(220 - ink * 190);

        ctx.beginPath();
        ctx.arc(sx, sy, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
        ctx.fill();
      }

      // Seal stamp — bottom right
      drawSeal(ctx, w - 40 * dpr, h - 40 * dpr, dpr);
    }

    setTimeout(() => setLoaded(true), 200);
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onMouseMove, onMouseLeave, onTouchMove, onTouchEnd]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#f0ebe0", position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block", position: "absolute", top: 0, left: 0 }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: "2.5rem", left: "2.5rem", zIndex: 10,
        opacity: loaded ? 0.25 : 0, transition: "opacity 3s ease 2s", pointerEvents: "none",
      }}>
        <h1 style={{
          fontFamily: "'Noto Serif SC', serif", fontSize: "0.75rem",
          fontWeight: 300, color: "#2a2520", letterSpacing: "0.3em", margin: 0,
        }}>寒江独钓</h1>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
          color: "#2a2520", letterSpacing: "0.15em", marginTop: "4px", opacity: 0.5,
        }}>Ma Yuan, c. 1195</p>
      </div>

      {/* Interpretation */}
      <div style={{
        position: "absolute", bottom: "2.5rem", left: "2.5rem", maxWidth: "min(70vw, 420px)",
        zIndex: 10, opacity: loaded ? 0.2 : 0, transition: "opacity 4s ease 6s", pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontSize: "0.75rem",
          fontWeight: 300, color: "#2a2520", lineHeight: 2.4, letterSpacing: "0.05em",
        }}>你需要多少笔才能让一个生命成立？答案是：比你以为的少得多。</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400&family=Noto+Serif+SC:wght@300;400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
