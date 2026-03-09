"use client";

import { useEffect, useRef, useCallback } from "react";

/*
 * 构成第八号 — Composition VIII (Kandinsky, 1923)
 * 
 * He painted sound. Circles are sustained notes, triangles are staccato,
 * lines are melodic contour. This is a score, not a painting.
 * 
 * Particles ARE the geometric forms — circles, triangles, lines —
 * each with distinct motion character:
 *   - Circles: slow orbit, gentle pulse (long tones)
 *   - Triangles: sharp, jittery, angular motion (percussive)
 *   - Lines: sweep across in arcs (melodic phrases)
 *   - Grid particles: steady, rhythmic (the underlying structure)
 * 
 * Background: warm cream (Kandinsky's actual canvas tone).
 * Colors: the Bauhaus palette — deep blue, warm red, golden yellow, black.
 */

interface GeoParticle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  type: "circle" | "triangle" | "line" | "dot";
  size: number;
  color: string;
  angle: number;
  rotSpeed: number;
  phase: number;
  orbitR: number;
  orbitSpeed: number;
  life: number;
}

const PALETTE = {
  bg: "#E8E0D0",
  deepBlue: "#1a1a5a",
  warmRed: "#c43030",
  golden: "#e8b830",
  teal: "#3a8a9a",
  violet: "#6a3a8a",
  black: "#1a1a1a",
  orange: "#d87030",
  cream: "#f0e8d0",
};

function createKandinskyParticles(): GeoParticle[] {
  const P: GeoParticle[] = [];
  const colors = [PALETTE.deepBlue, PALETTE.warmRed, PALETTE.golden, PALETTE.teal, PALETTE.violet, PALETTE.black, PALETTE.orange];

  // ---- Large circles (sustained notes) — few, prominent ----
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
    const rad = 0.1 + Math.random() * 0.25;
    P.push({
      x: Math.cos(angle) * rad, y: Math.sin(angle) * rad,
      ox: Math.cos(angle) * rad, oy: Math.sin(angle) * rad,
      vx: 0, vy: 0,
      type: "circle", size: 15 + Math.random() * 35,
      color: i < 2 ? PALETTE.deepBlue : i < 4 ? PALETTE.black : colors[Math.floor(Math.random() * colors.length)],
      angle: 0, rotSpeed: 0,
      phase: Math.random() * Math.PI * 2,
      orbitR: 0.005 + Math.random() * 0.01,
      orbitSpeed: 0.15 + Math.random() * 0.1,
      life: 1,
    });
  }

  // ---- Small circles (short notes) ----
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 0.8;
    const y = (Math.random() - 0.5) * 0.8;
    P.push({
      x, y, ox: x, oy: y, vx: 0, vy: 0,
      type: "circle", size: 3 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: 0, rotSpeed: 0,
      phase: Math.random() * Math.PI * 2,
      orbitR: 0.003 + Math.random() * 0.008,
      orbitSpeed: 0.2 + Math.random() * 0.3,
      life: 1,
    });
  }

  // ---- Triangles (percussive, angular) ----
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 0.7;
    const y = (Math.random() - 0.5) * 0.7;
    P.push({
      x, y, ox: x, oy: y, vx: 0, vy: 0,
      type: "triangle", size: 5 + Math.random() * 15,
      color: i < 5 ? PALETTE.warmRed : i < 10 ? PALETTE.golden : colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
      orbitR: 0.002 + Math.random() * 0.005,
      orbitSpeed: 0.4 + Math.random() * 0.6,
      life: 1,
    });
  }

  // ---- Lines (melodic sweeps) ----
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 0.75;
    const y = (Math.random() - 0.5) * 0.75;
    P.push({
      x, y, ox: x, oy: y, vx: 0, vy: 0,
      type: "line", size: 20 + Math.random() * 60,
      color: i < 10 ? PALETTE.black : colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      phase: Math.random() * Math.PI * 2,
      orbitR: 0.002 + Math.random() * 0.006,
      orbitSpeed: 0.1 + Math.random() * 0.15,
      life: 1,
    });
  }

  // ---- Grid dots (rhythm section) ----
  for (let i = 0; i < 120; i++) {
    const gx = ((i % 12) / 11 - 0.5) * 0.7;
    const gy = (Math.floor(i / 12) / 9 - 0.5) * 0.7;
    const jitter = 0.015;
    const x = gx + (Math.random() - 0.5) * jitter;
    const y = gy + (Math.random() - 0.5) * jitter;
    P.push({
      x, y, ox: x, oy: y, vx: 0, vy: 0,
      type: "dot", size: 1.5 + Math.random() * 2,
      color: PALETTE.black,
      angle: 0, rotSpeed: 0,
      phase: Math.random() * Math.PI * 2,
      orbitR: 0.001,
      orbitSpeed: 0.3,
      life: 1,
    });
  }

  // ---- Concentric circle arcs (the big circles in the painting) ----
  const arcCenters = [
    { cx: -0.15, cy: 0.1, r: 0.12, color: PALETTE.deepBlue },
    { cx: 0.2, cy: -0.05, r: 0.08, color: PALETTE.warmRed },
    { cx: -0.05, cy: -0.2, r: 0.06, color: PALETTE.teal },
  ];
  for (const arc of arcCenters) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const rJitter = arc.r + (Math.random() - 0.5) * 0.01;
      const x = arc.cx + Math.cos(a) * rJitter;
      const y = arc.cy + Math.sin(a) * rJitter;
      P.push({
        x, y, ox: x, oy: y, vx: 0, vy: 0,
        type: "dot", size: 1.5 + Math.random() * 1.5,
        color: arc.color,
        angle: a, rotSpeed: 0,
        phase: a,
        orbitR: 0.002,
        orbitSpeed: 0.2,
        life: 1,
      });
    }
  }

  return P;
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) {
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = angle + (i / 3) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * size;
    const py = y + Math.sin(a) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function KandinskyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const particles = createKandinskyParticles();
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
      m.x += (tm.x - m.x) * 0.05;
      m.y += (tm.y - m.y) * 0.05;
      const mx = (m.x * dpr - cxC) / scale;
      const my = -(m.y * dpr - cyC) / scale;

      // Assembly
      const assembleT = Math.min(time / 6, 1);
      const ease = assembleT * assembleT * (3 - 2 * assembleT);

      // Background — Kandinsky's warm cream
      ctx.fillStyle = PALETTE.bg;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        // Orbit around origin position — each type has different character
        let targetX = p.ox;
        let targetY = p.oy;

        if (p.type === "circle") {
          // Slow, gentle orbit — sustained notes
          targetX += Math.cos(time * p.orbitSpeed + p.phase) * p.orbitR;
          targetY += Math.sin(time * p.orbitSpeed + p.phase) * p.orbitR;
        } else if (p.type === "triangle") {
          // Jittery, angular — percussive hits
          const jit = Math.sin(time * 2 + p.phase) > 0.7 ? 0.003 : 0;
          targetX += Math.cos(time * p.orbitSpeed + p.phase) * p.orbitR + (Math.random() - 0.5) * jit;
          targetY += Math.sin(time * p.orbitSpeed * 1.3 + p.phase) * p.orbitR + (Math.random() - 0.5) * jit;
        } else if (p.type === "line") {
          // Slow sweep
          targetX += Math.cos(time * p.orbitSpeed + p.phase) * p.orbitR;
          targetY += Math.sin(time * p.orbitSpeed * 0.7 + p.phase) * p.orbitR;
        }

        // Return force
        const dx = targetX - p.x, dy = targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.0001) {
          const ret = (0.5 + ease * 3) * Math.min(dist, 0.1) * dt;
          p.vx += (dx / dist) * ret;
          p.vy += (dy / dist) * ret;
        }

        // Mouse interaction — attraction for Kandinsky (draw elements toward cursor)
        const mdx = mx - p.x, mdy = my - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 0.2 && mDist > 0.001) {
          // Gentle attraction — like conducting an orchestra
          const attract = 0.04 * Math.pow(1 - mDist / 0.2, 2) * dt;
          p.vx += (mdx / mDist) * attract;
          p.vy += (mdy / mDist) * attract;
        }

        p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;

        // Rotation
        p.angle += p.rotSpeed * dt;

        // Screen coords
        const sx = cxC + p.x * scale;
        const sy = cyC - p.y * scale;
        const drawSize = p.size * dpr;

        // Opacity based on assembly
        const assemblyAlpha = ease;
        ctx.globalAlpha = assemblyAlpha * (p.type === "dot" ? 0.4 : 0.7);

        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.type === "circle") {
          // Circles: filled or stroked, some with concentric rings
          const pulse = 1 + Math.sin(time * 0.5 + p.phase) * 0.05;
          const r = drawSize * pulse;
          if (p.size > 20) {
            // Large circles — stroked with fill
            ctx.lineWidth = 2 * dpr;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.globalAlpha = assemblyAlpha * 0.15;
            ctx.fill();
            ctx.globalAlpha = assemblyAlpha * 0.6;
            ctx.stroke();
            // Inner ring
            ctx.globalAlpha = assemblyAlpha * 0.3;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 0.6, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Small circles — solid
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.type === "triangle") {
          // Triangles: sharp, geometric
          ctx.lineWidth = 1.5 * dpr;
          drawTriangle(ctx, sx, sy, drawSize, p.angle);
          if (p.size > 10) {
            ctx.globalAlpha = assemblyAlpha * 0.3;
            ctx.fill();
            ctx.globalAlpha = assemblyAlpha * 0.7;
            ctx.stroke();
          } else {
            ctx.fill();
          }
        } else if (p.type === "line") {
          // Lines: straight strokes with varying weight
          ctx.lineWidth = (1 + (p.size > 40 ? 2 : 0.5)) * dpr;
          ctx.lineCap = "round";
          const lx = Math.cos(p.angle) * drawSize * 0.5;
          const ly = Math.sin(p.angle) * drawSize * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - lx, sy - ly);
          ctx.lineTo(sx + lx, sy + ly);
          ctx.stroke();
        } else {
          // Dots: tiny circles
          ctx.beginPath();
          ctx.arc(sx, sy, drawSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    }

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

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}
