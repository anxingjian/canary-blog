"use client";

import { useEffect, useRef } from "react";

/*
  Nighthawks — Edward Hopper, 1942
  Flow field with persistent trail lines.
  Each line stores its full path and draws as a continuous curve.
*/

interface Trail {
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  maxLen: number;
  zone: string;
}

const PALETTE = {
  dinerWarm: [212, 160, 48],
  dinerGlow: [240, 232, 200],
  greenCeil: [74, 122, 92],
  building: [28, 58, 40],
  figure: [15, 15, 12],
  counter: [139, 105, 20],
  redDress: [160, 45, 20],
  sidewalk: [160, 140, 80],
  lamp: [200, 170, 80],
};

function rgb(c: number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function lerp(a: number[], b: number[], t: number) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export default function NighthawksFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;

    // Diner bounds (pixel coords)
    const d = {
      l: 0.28 * w, r: 0.72 * w,
      t: 0.32 * h, b: 0.52 * h,
      cy: 0.42 * h,
    };

    function flowAngle(x: number, y: number, t: number): number {
      const nx = x / w, ny = y / h;
      // Inside diner — gentle circular flow
      if (nx > 0.28 && nx < 0.72 && ny > 0.32 && ny < 0.52) {
        const cx = 0.5 * w, cy = 0.42 * h;
        return Math.atan2(y - cy, x - cx) + Math.PI / 2 + Math.sin(t * 0.3 + nx * 5) * 0.3;
      }
      // Light spill
      if (ny > 0.52 && ny < 0.72 && nx > 0.23 && nx < 0.77) {
        return Math.atan2(y - 0.52 * h, x - 0.5 * w) + Math.sin(t * 0.5) * 0.2;
      }
      // Glass top edge — flow right
      if (Math.abs(ny - 0.32) < 0.02 && nx > 0.28 && nx < 0.72) {
        return Math.sin(t * 0.4 + nx * 8) * 0.3;
      }
      // Buildings
      if (ny < 0.3) return -Math.PI / 2 + Math.sin(nx * 10 + t * 0.2) * 0.5;
      // Street
      return Math.sin(nx * 6 + t * 0.3) * Math.cos(ny * 6 + t * 0.2) * Math.PI;
    }

    function spawnTrail(): Trail {
      const r = Math.random();
      let x: number, y: number, color: number[], alpha: number, lw: number, zone: string, maxLen: number;

      if (r < 0.4) {
        // Diner interior
        x = rand(d.l, d.r);
        y = rand(d.t, d.b);
        const t = (x - d.l) / (d.r - d.l);
        const nf = 0.6 + 0.4 * t;
        const yr = (d.b - d.t) * nf / 2;
        if (Math.abs(y - d.cy) > yr) y = d.cy + (Math.random() - 0.5) * yr;
        const nearTop = (y - d.t) / (d.b - d.t) < 0.25;
        color = nearTop
          ? lerp(PALETTE.greenCeil, PALETTE.dinerWarm, rand(0.3, 0.6))
          : lerp(PALETTE.dinerWarm, PALETTE.dinerGlow, rand(0, 0.4));
        alpha = rand(0.5, 0.9);
        lw = rand(0.5, 1.2);
        maxLen = Math.floor(rand(40, 120));
        zone = "diner";
      } else if (r < 0.5) {
        // Glass edges
        x = rand(d.l, d.r);
        y = Math.random() > 0.5 ? d.t + rand(-3, 3) : d.b + rand(-3, 3);
        color = PALETTE.dinerGlow;
        alpha = rand(0.6, 1.0);
        lw = rand(0.3, 0.8);
        maxLen = Math.floor(rand(60, 150));
        zone = "edge";
      } else if (r < 0.55) {
        // Corner
        x = d.l + rand(-10, 5);
        y = d.cy + rand(-20, 20);
        color = lerp(PALETTE.dinerGlow, PALETTE.greenCeil, rand(0, 0.4));
        alpha = rand(0.5, 0.8);
        lw = rand(0.3, 0.7);
        maxLen = Math.floor(rand(30, 80));
        zone = "corner";
      } else if (r < 0.6) {
        // Counter
        x = rand(d.l + 30, d.r - 20);
        y = d.cy + rand(-5, 8);
        color = lerp(PALETTE.counter, PALETTE.dinerWarm, rand(0.2, 0.5));
        alpha = rand(0.4, 0.7);
        lw = rand(0.4, 1.0);
        maxLen = Math.floor(rand(30, 80));
        zone = "counter";
      } else if (r < 0.65) {
        // Figures
        const figs = [
          [0.55 * w, d.cy], [0.6 * w, d.cy - 3],
          [0.38 * w, d.cy + 3], [0.47 * w, d.cy + 5],
        ];
        const f = figs[Math.floor(Math.random() * figs.length)];
        x = f[0] + rand(-6, 6);
        y = f[1] + rand(-8, 10);
        color = f[0] / w > 0.54 && f[0] / w < 0.57 && Math.random() > 0.6
          ? PALETTE.redDress
          : lerp(PALETTE.figure, PALETTE.dinerWarm, rand(0, 0.15));
        alpha = rand(0.5, 0.8);
        lw = rand(0.4, 0.8);
        maxLen = Math.floor(rand(20, 50));
        zone = "figure";
      } else if (r < 0.78) {
        // Light spill
        x = rand(d.l - 40, d.r + 30);
        y = rand(d.b, d.b + h * 0.2);
        const dist = (y - d.b) / (h * 0.2);
        color = lerp(PALETTE.dinerWarm, PALETTE.sidewalk, rand(0.2, 0.6));
        alpha = rand(0.1, 0.35) * (1 - dist);
        lw = rand(0.3, 0.7);
        maxLen = Math.floor(rand(30, 80));
        zone = "spill";
      } else if (r < 0.84) {
        // Lamp
        x = 0.22 * w + rand(-8, 8);
        y = Math.random() > 0.4 ? 0.25 * h + rand(-8, 8) : rand(0.27 * h, 0.55 * h);
        color = Math.random() > 0.4 ? PALETTE.lamp : PALETTE.building;
        alpha = rand(0.2, 0.5);
        lw = rand(0.3, 0.6);
        maxLen = Math.floor(rand(20, 60));
        zone = "lamp";
      } else {
        // Buildings & street
        x = rand(0, w);
        y = rand(0, h);
        if (x > d.l - 10 && x < d.r + 10 && y > d.t - 10 && y < d.b + 10) {
          x = Math.random() > 0.5 ? rand(0, d.l - 30) : rand(d.r + 30, w);
        }
        const isB = y < 0.35 * h && ((x / w > 0.05 && x / w < 0.2) || (x / w > 0.78 && x / w < 0.95));
        color = isB ? lerp(PALETTE.building, PALETTE.greenCeil, rand(0, 0.3)) : PALETTE.building;
        alpha = rand(0.06, 0.18);
        lw = rand(0.3, 0.5);
        maxLen = Math.floor(rand(20, 60));
        zone = "street";
      }

      return {
        points: [{ x, y }],
        color: rgb(color, alpha),
        lineWidth: lw,
        maxLen,
        zone,
      };
    }

    const NUM = 800;
    const trails: Trail[] = [];
    for (let i = 0; i < NUM; i++) trails.push(spawnTrail());

    let time = 0;
    let animId = 0;

    const animate = () => {
      time += 0.016;

      // Clear and redraw all trails each frame
      ctx.fillStyle = "#050805";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < trails.length; i++) {
        const tr = trails[i];
        const last = tr.points[tr.points.length - 1];

        // Advance
        const angle = flowAngle(last.x, last.y, time);
        const speed = tr.zone === "edge" ? 1.5 : tr.zone === "diner" ? 1.0 : 0.6;
        const nx = last.x + Math.cos(angle) * speed;
        const ny = last.y + Math.sin(angle) * speed;
        tr.points.push({ x: nx, y: ny });

        // Trim to max length
        if (tr.points.length > tr.maxLen) tr.points.shift();

        // Respawn if out of bounds
        if (nx < -20 || nx > w + 20 || ny < -20 || ny > h + 20) {
          trails[i] = spawnTrail();
          continue;
        }

        // Draw trail with gradient alpha
        if (tr.points.length < 2) continue;

        ctx.beginPath();
        ctx.moveTo(tr.points[0].x, tr.points[0].y);
        for (let j = 1; j < tr.points.length; j++) {
          ctx.lineTo(tr.points[j].x, tr.points[j].y);
        }
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = tr.lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
    />
  );
}
