"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/*
 * 寒江独钓 — Solitary Angler on a Winter River
 * 
 * The painting is stillness itself.
 * Motion should be barely perceptible — like staring at still water
 * for a long time before you notice the faintest drift.
 * 
 * Particles are ink strokes, not dots — elongated, directional,
 * like dry brush marks on xuan paper.
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
  return hash(ix, iy) * (1-sx)*(1-sy) + hash(ix+1, iy) * sx*(1-sy) +
         hash(ix, iy+1) * (1-sx)*sy + hash(ix+1, iy+1) * sx*sy;
}
function fbm(x: number, y: number, oct: number = 3): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise2d(x*f, y*f); a *= 0.5; f *= 2; }
  return v;
}

// ---- Particle ----
interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  role: number;
  life: number;
  // Brush stroke properties
  width: number;
  length: number;
  angle: number;  // stroke direction
  phase: number;
}

function createParticles(): Particle[] {
  const P: Particle[] = [];
  const N = 10000;

  for (let i = 0; i < N; i++) {
    const r = Math.random();
    let x: number, y: number, role: number, w: number, l: number, angle: number;

    if (r < 0.015) {
      // BOAT — horizontal strokes
      const t = Math.random();
      const curve = Math.pow(Math.abs(t - 0.5) * 2, 1.8) * -0.018;
      x = (t - 0.5) * 0.22;
      y = -0.14 + curve;
      const thickness = 0.003 * (1 - Math.pow(Math.abs(t - 0.5) * 2, 2)) + 0.001;
      x += (Math.random() - 0.5) * 0.005;
      y += (Math.random() - 0.5) * thickness;
      role = 0.75 + Math.random() * 0.25;
      w = 1.5 + Math.random() * 1.5;
      l = 3 + Math.random() * 5; // elongated horizontal
      angle = (Math.random() - 0.5) * 0.15; // nearly horizontal
    } else if (r < 0.027) {
      // FIGURE — mixed direction strokes
      const a = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.5);
      x = -0.01 + Math.cos(a) * 0.013 * rad;
      y = -0.09 + Math.sin(a) * 0.028 * rad;
      role = 0.6 + Math.random() * 0.4;
      w = 1.5 + Math.random() * 2;
      l = 2 + Math.random() * 3;
      angle = a + (Math.random() - 0.5) * 0.5; // follow body form
    } else if (r < 0.034) {
      // HEAD
      const a = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.008;
      x = -0.008 + Math.cos(a) * rad;
      y = -0.055 + Math.sin(a) * rad;
      role = 0.8 + Math.random() * 0.2;
      w = 1.2 + Math.random() * 1;
      l = 1.5 + Math.random() * 2;
      angle = Math.random() * Math.PI;
    } else if (r < 0.05) {
      // FISHING ROD — diagonal strokes following the line
      const t = Math.random();
      x = 0.0 + t * 0.15;
      y = -0.06 + t * 0.095 + Math.sin(t * Math.PI) * 0.012;
      x += (Math.random() - 0.5) * 0.002;
      y += (Math.random() - 0.5) * 0.002;
      role = 0.35 + Math.random() * 0.3 * (1 - t * 0.4);
      w = 0.6 + Math.random() * 0.8;
      l = 2 + Math.random() * 3;
      angle = Math.atan2(0.095, 0.15) + (Math.random() - 0.5) * 0.1; // follow rod angle
    } else if (r < 0.056) {
      // FISHING LINE
      const t = Math.random();
      x = 0.15 + Math.sin(t * Math.PI * 0.3) * 0.004;
      y = 0.035 - t * 0.11;
      x += (Math.random() - 0.5) * 0.001;
      role = 0.2 + Math.random() * 0.15;
      w = 0.4 + Math.random() * 0.3;
      l = 1 + Math.random() * 1.5;
      angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.15; // vertical
    } else if (r < 0.085) {
      // WATER RIPPLES — thin horizontal strokes
      const ring = Math.floor(Math.random() * 6);
      const ringR = 0.04 + ring * 0.02;
      const a = (Math.random() - 0.5) * Math.PI * 0.55;
      x = 0.0 + Math.cos(a) * ringR;
      y = -0.17 + Math.sin(a) * ringR * 0.12;
      x += (Math.random() - 0.5) * 0.003;
      y += (Math.random() - 0.5) * 0.001;
      role = 0.06 + Math.random() * 0.1;
      w = 0.5 + Math.random() * 0.8;
      l = 3 + Math.random() * 5; // horizontal ripple marks
      angle = (Math.random() - 0.5) * 0.08; // nearly horizontal
    } else if (r < 0.14) {
      // NEAR MIST
      const a = Math.random() * Math.PI * 2;
      const rad = 0.06 + Math.random() * 0.18;
      x = 0.0 + Math.cos(a) * rad;
      y = -0.14 + Math.sin(a) * rad * 0.35;
      role = 0.02 + Math.random() * 0.04;
      w = 3 + Math.random() * 5;
      l = 5 + Math.random() * 10;
      angle = Math.random() * Math.PI; // random wisps
    } else {
      // VOID
      const a = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.5) * 0.85;
      x = Math.cos(a) * rad;
      y = Math.sin(a) * rad - 0.05;
      role = Math.random() * 0.03;
      w = 3 + Math.random() * 6;
      l = 5 + Math.random() * 12;
      angle = Math.random() * Math.PI;
    }

    const scatter = Math.pow(1 - role, 2) * 1.8;
    P.push({
      x: x + (Math.random() - 0.5) * scatter,
      y: y + (Math.random() - 0.5) * scatter,
      ox: x, oy: y, vx: 0, vy: 0,
      role, life: Math.random(),
      width: w, length: l,
      angle,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return P;
}

// ---- Pre-render ink stroke sprite (elliptical, feathered) ----
function createStrokeSprite(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const cx = w / 2, cy = h / 2;
  
  // Elliptical gradient — wider than tall
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.15, "rgba(0,0,0,0.7)");
  g.addColorStop(0.4, "rgba(0,0,0,0.2)");
  g.addColorStop(0.7, "rgba(0,0,0,0.04)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  
  ctx.save();
  ctx.scale(1, h / w); // squash into ellipse
  ctx.translate(0, (w - h) / 2 * (w / h));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
  ctx.restore();
  
  // Add slight edge roughness for dry-brush feel
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 30; i++) {
    const ex = Math.random() * w;
    const ey = Math.random() * h;
    const es = 1 + Math.random() * 3;
    ctx.fillStyle = "black";
    ctx.fillRect(ex, ey, es, es * 0.5);
  }
  
  return c;
}

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
    if (e.touches.length) targetMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback(() => {
    targetMouseRef.current = { x: 9999, y: 9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprite = createStrokeSprite(128, 48); // wide ellipse

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      canvas!.style.width = w + "px"; canvas!.style.height = h + "px";
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const particles = createParticles();
    let time = 0, prevTime = performance.now(), raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      time += dt;

      const w = canvas!.width, h = canvas!.height;
      const cxC = w / 2, cyC = h / 2;
      const scale = Math.min(w, h);

      const m = mouseRef.current, tm = targetMouseRef.current;
      m.x += (tm.x - m.x) * 0.03;
      m.y += (tm.y - m.y) * 0.03;
      const mx = (m.x * dpr - cxC) / scale;
      const my = -(m.y * dpr - cyC) / scale;

      // Assembly: 12 seconds, very gentle
      const assembleT = Math.min(time / 12, 1);
      const ease = assembleT * assembleT * (3 - 2 * assembleT);
      const returnStr = 0.15 + ease * 1.5;
      // After assembly, curl is EXTREMELY subtle — the painting is still
      const curlStr = 0.03 * (1 - ease * 0.7);

      // Clear — warm paper
      ctx.fillStyle = "#f0ebe0";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "multiply";

      for (const p of particles) {
        // VERY gentle curl noise — almost imperceptible
        const nx = fbm(p.x * 0.8 + time * 0.005, p.y * 0.8, 2);
        const ny = fbm(p.x * 0.8 + 100, p.y * 0.8 + time * 0.005, 2);
        const curlAmt = (1 - p.role * 0.8) * curlStr;
        
        // Breathing — extremely slow, like watching still water
        const breathe = Math.sin(time * 0.15 + p.phase) * 0.00005;
        
        p.vx += (nx - 0.5) * curlAmt * dt * 0.3 + breathe;
        p.vy += (ny - 0.5) * curlAmt * dt * 0.3;

        // Return to origin — form particles stick
        const dx = p.ox - p.x, dy = p.oy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.0003) {
          const ret = p.role * returnStr * Math.min(dist, 0.2) * dt;
          p.vx += (dx / dist) * ret;
          p.vy += (dy / dist) * ret;
        }

        // Mouse — gentle scatter, not violent push
        const mdx = p.x - mx, mdy = p.y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 0.12 && mDist > 0.001) {
          const repel = 0.08 * Math.pow(1 - mDist / 0.12, 2) * dt * (0.3 + p.role * 0.7);
          p.vx += (mdx / mDist) * repel;
          p.vy += (mdy / mDist) * repel;
        }

        // Heavy damping — ink is viscous
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        // Life — very slow cycle, almost static
        p.life -= dt * 0.02 * (1 - p.role * 0.9);
        if (p.life < 0) {
          p.x = p.ox + (Math.random() - 0.5) * 0.005;
          p.y = p.oy + (Math.random() - 0.5) * 0.005;
          p.vx = 0; p.vy = 0;
          p.life = 0.9 + Math.random() * 0.1;
        }

        // Draw
        const sx = cxC + p.x * scale;
        const sy = cyC - p.y * scale;
        const drawW = p.length * dpr;
        const drawH = p.width * dpr;

        const lifeFade = Math.min(1, p.life / 0.3);
        let alpha: number;
        if (p.role < 0.04) alpha = 0.006 + p.role * 0.1;
        else if (p.role < 0.15) alpha = 0.01 + (p.role - 0.04) * 0.35;
        else if (p.role < 0.5) alpha = 0.05 + (p.role - 0.15) * 0.5;
        else alpha = 0.22 + (p.role - 0.5) * 0.7;
        alpha *= lifeFade;
        if (alpha < 0.003) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(sx, sy);
        ctx.rotate(-p.angle); // negative because canvas Y is inverted
        ctx.drawImage(sprite, -drawW, -drawH, drawW * 2, drawH * 2);
        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
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
          fontFamily: "'Noto Serif SC', serif", fontSize: "0.8rem",
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
