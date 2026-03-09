"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/*
 * 寒江独钓 — Solitary Angler on a Winter River
 * 
 * Canvas 2D — ink wash rendering with radial gradients.
 * Each particle is a soft ink splash, not a dot.
 * Layers of transparency create the 氤氲 (misty) feel.
 */

// ---- Noise ----
function hash(x: number, y: number): number {
  let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise2d(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return hash(ix, iy) * (1 - sx) * (1 - sy) + hash(ix + 1, iy) * sx * (1 - sy) +
         hash(ix, iy + 1) * (1 - sx) * sy + hash(ix + 1, iy + 1) * sx * sy;
}

function fbm(x: number, y: number, octaves: number = 4): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2d(x * freq, y * freq);
    amp *= 0.5; freq *= 2;
  }
  return val;
}

function curlNoise(x: number, y: number, t: number): [number, number] {
  const e = 0.005;
  const n = fbm;
  return [
    (n(x, y + e + t * 0.08, 3) - n(x, y - e + t * 0.08, 3)) / (2 * e),
    -(n(x + e, y + t * 0.08, 3) - n(x - e, y + t * 0.08, 3)) / (2 * e),
  ];
}

// ---- Particle ----
interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  role: number; // 0=void, 1=deep ink
  life: number;
  size: number;
  phase: number; // for subtle oscillation
}

function createParticles(): Particle[] {
  const P: Particle[] = [];
  const N = 12000;

  for (let i = 0; i < N; i++) {
    const r = Math.random();
    let x: number, y: number, role: number, size: number;

    if (r < 0.015) {
      // BOAT hull — gentle arc
      const t = Math.random();
      const curve = Math.pow(Math.abs(t - 0.5) * 2, 1.8) * -0.02;
      x = (t - 0.5) * 0.24;
      y = -0.14 + curve;
      // Thickness variation — thicker at center
      const thickness = 0.004 * (1 - Math.pow(Math.abs(t - 0.5) * 2, 2)) + 0.002;
      x += (Math.random() - 0.5) * 0.006;
      y += (Math.random() - 0.5) * thickness;
      role = 0.75 + Math.random() * 0.25;
      size = 3 + Math.random() * 4;
    } else if (r < 0.027) {
      // FIGURE body — seated, slightly hunched
      const a = Math.random() * Math.PI * 2;
      const rx = 0.015, ry = 0.03;
      const rad = Math.pow(Math.random(), 0.5);
      x = -0.01 + Math.cos(a) * rx * rad;
      y = -0.09 + Math.sin(a) * ry * rad;
      role = 0.6 + Math.random() * 0.4;
      size = 2.5 + Math.random() * 3;
    } else if (r < 0.034) {
      // HEAD — darker, tighter cluster
      const a = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.009;
      x = -0.008 + Math.cos(a) * rad;
      y = -0.055 + Math.sin(a) * rad;
      role = 0.8 + Math.random() * 0.2;
      size = 2 + Math.random() * 2;
    } else if (r < 0.038) {
      // HAT — conical suggestion
      const t = Math.random();
      x = -0.008 + (t - 0.5) * 0.025;
      y = -0.045 + Math.abs(t - 0.5) * -0.01;
      role = 0.65 + Math.random() * 0.2;
      size = 2 + Math.random() * 2;
    } else if (r < 0.052) {
      // FISHING ROD — long diagonal, slight bow
      const t = Math.random();
      x = 0.0 + t * 0.16;
      y = -0.06 + t * 0.1 + Math.sin(t * Math.PI) * 0.015;
      x += (Math.random() - 0.5) * 0.002;
      y += (Math.random() - 0.5) * 0.002;
      role = 0.35 + Math.random() * 0.3 * (1 - t * 0.5); // fades toward tip
      size = 1 + Math.random() * 1.5 * (1 - t * 0.3);
    } else if (r < 0.058) {
      // FISHING LINE — thin, slight curve downward
      const t = Math.random();
      x = 0.16 + Math.sin(t * Math.PI * 0.3) * 0.005;
      y = 0.04 - t * 0.12;
      x += (Math.random() - 0.5) * 0.0015;
      role = 0.25 + Math.random() * 0.15;
      size = 0.8 + Math.random() * 0.6;
    } else if (r < 0.09) {
      // WATER RIPPLES — concentric arcs, subtle
      const ring = Math.floor(Math.random() * 7);
      const ringR = 0.04 + ring * 0.022;
      const a = (Math.random() - 0.5) * Math.PI * 0.6;
      x = 0.0 + Math.cos(a) * ringR;
      y = -0.17 + Math.sin(a) * ringR * 0.15;
      x += (Math.random() - 0.5) * 0.004;
      y += (Math.random() - 0.5) * 0.002;
      role = 0.08 + Math.random() * 0.12;
      size = 2 + Math.random() * 3;
    } else if (r < 0.15) {
      // NEAR-WATER MIST — around the boat, creates atmosphere
      const a = Math.random() * Math.PI * 2;
      const rad = 0.08 + Math.random() * 0.15;
      x = 0.0 + Math.cos(a) * rad;
      y = -0.15 + Math.sin(a) * rad * 0.4;
      role = 0.03 + Math.random() * 0.06;
      size = 5 + Math.random() * 8;
    } else {
      // VOID — the vast emptiness, atmospheric depth
      // Biased distribution: denser near center, sparse at edges
      const a = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.5) * 0.85;
      x = Math.cos(a) * rad;
      y = Math.sin(a) * rad;
      // Subtle vertical gradient — slightly denser at bottom (water region)
      y -= 0.05;
      role = Math.random() * 0.04;
      size = 4 + Math.random() * 10;
    }

    const scatter = Math.pow(1 - role, 2) * 2.0;
    P.push({
      x: x + (Math.random() - 0.5) * scatter,
      y: y + (Math.random() - 0.5) * scatter,
      ox: x, oy: y, vx: 0, vy: 0,
      role, life: Math.random(),
      size,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return P;
}

// ---- Pre-render soft particle sprite ----
function createParticleSprite(resolution: number = 64): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = resolution;
  c.height = resolution;
  const ctx = c.getContext("2d")!;
  const cx = resolution / 2;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.2, "rgba(0,0,0,0.6)");
  g.addColorStop(0.5, "rgba(0,0,0,0.15)");
  g.addColorStop(0.8, "rgba(0,0,0,0.03)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, resolution, resolution);
  return c;
}

// ---- Seal ----
function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#8B2500";
  ctx.lineWidth = 1.2 * s;
  const half = 14 * s;
  ctx.strokeRect(x - half, y - half, half * 2, half * 2);
  ctx.fillStyle = "#8B2500";
  ctx.font = `bold ${10 * s}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("余", x, y + 1 * s);
  ctx.restore();
}

export default function AfterimageV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  const mouseRef = useRef({ x: 9999, y: 9999 });
  const targetMouseRef = useRef({ x: 9999, y: 9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseLeave = useCallback(() => {
    targetMouseRef.current = { x: 9999, y: 9999 };
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0)
      targetMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback(() => {
    targetMouseRef.current = { x: 9999, y: 9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprite = createParticleSprite(64);

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
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

    // Paper color
    const paperR = 240, paperG = 235, paperB = 224;

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      time += dt;

      const w = canvas!.width, h = canvas!.height;
      const cxCanvas = w / 2, cyCanvas = h / 2;
      const scale = Math.min(w, h);

      // Smooth mouse
      const m = mouseRef.current;
      const tm = targetMouseRef.current;
      m.x += (tm.x - m.x) * 0.04;
      m.y += (tm.y - m.y) * 0.04;
      const mx = (m.x * dpr - cxCanvas) / scale;
      const my = -(m.y * dpr - cyCanvas) / scale;

      // Assembly
      const assembleT = Math.min(time / 10, 1);
      const easeAssemble = assembleT * assembleT * (3 - 2 * assembleT); // smoothstep
      const returnStr = 0.2 + easeAssemble * 2.5;
      const curlStr = 0.5 - easeAssemble * 0.3;

      // Clear
      ctx.fillStyle = `rgb(${paperR},${paperG},${paperB})`;
      ctx.fillRect(0, 0, w, h);

      // Add very subtle paper grain (every 4th frame to save perf)
      if (Math.floor(time * 15) % 4 === 0) {
        ctx.save();
        ctx.globalAlpha = 0.015;
        ctx.globalCompositeOperation = "multiply";
        for (let i = 0; i < 200; i++) {
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          const gs = 1 + Math.random() * 2;
          ctx.fillStyle = `rgb(${200 + Math.random() * 30},${195 + Math.random() * 30},${185 + Math.random() * 30})`;
          ctx.fillRect(gx, gy, gs, gs);
        }
        ctx.restore();
      }

      // Sort: void particles first (background), form particles on top
      // Skip sorting every frame — stable enough
      
      ctx.globalCompositeOperation = "multiply"; // ink wash blending

      for (const p of particles) {
        // Curl noise motion
        const [cnx, cny] = curlNoise(p.x * 1.2, p.y * 1.2, time);
        const curlAmt = (1 - p.role * 0.7) * curlStr * 0.6;
        
        // Subtle breathing oscillation
        const breathe = Math.sin(time * 0.3 + p.phase) * 0.0003;
        
        p.vx += cnx * curlAmt * dt + breathe;
        p.vy += cny * curlAmt * dt + breathe * 0.5;

        // Return to origin
        const dx = p.ox - p.x, dy = p.oy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.0005) {
          const ret = p.role * returnStr * Math.min(dist, 0.3) * dt;
          p.vx += (dx / dist) * ret;
          p.vy += (dy / dist) * ret;
        }

        // Mouse repulsion
        const mdx = p.x - mx, mdy = p.y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 0.18 && mDist > 0.001) {
          const repel = 0.25 * Math.pow(1 - mDist / 0.18, 2) * dt;
          p.vx += (mdx / mDist) * repel;
          p.vy += (mdy / mDist) * repel;
        }

        // Damping — slow, ink-like viscosity
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        // Life cycle
        p.life -= dt * 0.06 * (1 - p.role * 0.85);
        if (p.life < 0) {
          p.x = p.ox + (Math.random() - 0.5) * 0.015;
          p.y = p.oy + (Math.random() - 0.5) * 0.015;
          p.vx = 0; p.vy = 0;
          p.life = 0.8 + Math.random() * 0.2;
        }

        // Screen position
        const sx = cxCanvas + p.x * scale;
        const sy = cyCanvas - p.y * scale;
        const drawSize = p.size * dpr;

        // Alpha — ink density
        const lifeFade = Math.min(1, p.life / 0.25);
        let alpha: number;
        if (p.role < 0.05) {
          // Void: very subtle fog
          alpha = 0.008 + p.role * 0.15;
        } else if (p.role < 0.2) {
          // Mist/ripples: light wash
          alpha = 0.02 + (p.role - 0.05) * 0.4;
        } else if (p.role < 0.5) {
          // Light ink: rod, outline
          alpha = 0.08 + (p.role - 0.2) * 0.6;
        } else {
          // Deep ink: figure, boat
          alpha = 0.25 + (p.role - 0.5) * 0.8;
        }
        alpha *= lifeFade;
        
        if (alpha < 0.003) continue;

        // Draw using pre-rendered soft sprite
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, sx - drawSize, sy - drawSize, drawSize * 2, drawSize * 2);
      }

      // Reset composite mode
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Seal
      drawSeal(ctx, w - 35 * dpr, h - 35 * dpr, dpr);
    }

    setTimeout(() => setLoaded(true), 300);
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

      <div style={{
        position: "absolute", top: "2rem", left: "2rem", zIndex: 10,
        opacity: loaded ? 0.3 : 0, transition: "opacity 4s ease 3s", pointerEvents: "none",
      }}>
        <h1 style={{
          fontFamily: "'Noto Serif SC', 'Song', serif", fontSize: "0.8rem",
          fontWeight: 300, color: "#2a2520", letterSpacing: "0.4em", margin: 0,
        }}>寒江独钓</h1>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
          color: "#2a2520", letterSpacing: "0.12em", marginTop: "6px", opacity: 0.4,
        }}>MA YUAN · c. 1195</p>
      </div>

      <div style={{
        position: "absolute", bottom: "2.5rem", left: "2.5rem", maxWidth: "min(65vw, 380px)",
        zIndex: 10, opacity: loaded ? 0.18 : 0, transition: "opacity 5s ease 8s", pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontSize: "0.7rem",
          fontWeight: 300, color: "#2a2520", lineHeight: 2.6, letterSpacing: "0.06em",
        }}>你需要多少笔才能让一个生命成立</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400&family=Noto+Serif+SC:wght@300;400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
