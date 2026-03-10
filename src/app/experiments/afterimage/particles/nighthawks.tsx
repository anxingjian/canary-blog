"use client";

import { useEffect, useRef } from "react";

/*
  Nighthawks — Edward Hopper, 1942
  
  Approach: Load the original painting, sample its pixels as a color/brightness map.
  Flow field lines trace through the image space, picking up colors from the painting.
  Brighter areas get denser, longer lines. Dark areas get sparse, faint lines.
  Style inspired by reference 1: thin flowing luminous lines on dark background.
*/

interface Trail {
  points: { x: number; y: number }[];
  maxLen: number;
  speed: number;
  dead: boolean;
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

    // Load original painting as color map
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/canary-blog/paintings/nighthawks.jpg";

    img.onload = () => {
      // Draw image to offscreen canvas to sample pixels
      const offscreen = document.createElement("canvas");
      // Use a smaller sampling resolution for performance
      const sampleW = 400;
      const sampleH = Math.round(sampleW * (img.height / img.width));
      offscreen.width = sampleW;
      offscreen.height = sampleH;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.drawImage(img, 0, 0, sampleW, sampleH);
      const imageData = offCtx.getImageData(0, 0, sampleW, sampleH);
      const pixels = imageData.data;

      // Calculate image display area (cover the viewport, centered)
      const imgAspect = img.width / img.height;
      const vpAspect = w / h;
      let drawW: number, drawH: number, offsetX: number, offsetY: number;
      if (vpAspect > imgAspect) {
        drawW = w;
        drawH = w / imgAspect;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
      } else {
        drawH = h;
        drawW = h * imgAspect;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
      }

      // Sample color at a screen position
      function sampleColor(sx: number, sy: number): [number, number, number, number] {
        // Map screen coords to image sample coords
        const ix = Math.floor(((sx - offsetX) / drawW) * sampleW);
        const iy = Math.floor(((sy - offsetY) / drawH) * sampleH);
        if (ix < 0 || ix >= sampleW || iy < 0 || iy >= sampleH) {
          return [5, 8, 5, 0]; // dark background outside image
        }
        const idx = (iy * sampleW + ix) * 4;
        return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
      }

      function brightness(r: number, g: number, b: number): number {
        return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      }

      const rand = (a: number, b: number) => Math.random() * (b - a) + a;

      // Flow field based on image brightness gradients
      function flowAngle(sx: number, sy: number, time: number): number {
        const step = 3;
        const [r1, g1, b1] = sampleColor(sx + step, sy);
        const [r2, g2, b2] = sampleColor(sx - step, sy);
        const [r3, g3, b3] = sampleColor(sx, sy + step);
        const [r4, g4, b4] = sampleColor(sx, sy - step);

        const dx = brightness(r1, g1, b1) - brightness(r2, g2, b2);
        const dy = brightness(r3, g3, b3) - brightness(r4, g4, b4);

        // Flow perpendicular to brightness gradient (follows contour lines)
        // Plus some time-based noise for organic movement
        const gradAngle = Math.atan2(dy, dx);
        const perpAngle = gradAngle + Math.PI / 2;
        const noise = Math.sin(sx * 0.008 + time * 0.5) * Math.cos(sy * 0.008 + time * 0.3) * 0.6;

        return perpAngle + noise;
      }

      // Spawn trail at random position, weighted by brightness
      function spawnTrail(): Trail {
        // Try a few random positions, prefer brighter areas
        let bestX = 0, bestY = 0, bestBr = -1;
        for (let attempt = 0; attempt < 5; attempt++) {
          const sx = rand(0, w);
          const sy = rand(0, h);
          const [r, g, b] = sampleColor(sx, sy);
          const br = brightness(r, g, b);
          // Weighted: bright areas more likely, but don't exclude dark entirely
          const score = br * 0.6 + rand(0, 0.4);
          if (score > bestBr) {
            bestBr = score;
            bestX = sx;
            bestY = sy;
          }
        }

        // Longer trails in brighter areas
        const maxLen = Math.floor(25 + bestBr * 100);
        const speed = 0.4 + bestBr * 1.0;

        return {
          points: [{ x: bestX, y: bestY }],
          maxLen,
          speed,
          dead: false,
        };
      }

      const NUM = 1200;
      const trails: Trail[] = [];
      for (let i = 0; i < NUM; i++) trails.push(spawnTrail());

      // Draw a very faint version of the original painting as base
      ctx.globalAlpha = 0.75;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.globalAlpha = 1;

      let time = 0;
      let animId = 0;

      const animate = () => {
        time += 0.016;

        // Dark background with slight persistence
        // Redraw faint painting periodically to maintain base visibility
        ctx.fillStyle = "rgba(5, 8, 5, 0.004)";
        ctx.fillRect(0, 0, w, h);
        // Re-apply painting base very subtly each frame
        ctx.globalAlpha = 0.015;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.globalAlpha = 1;

        for (let i = 0; i < trails.length; i++) {
          const tr = trails[i];

          if (tr.dead) {
            trails[i] = spawnTrail();
            continue;
          }

          const last = tr.points[tr.points.length - 1];

          // Advance along flow field
          const angle = flowAngle(last.x, last.y, time);
          const nx = last.x + Math.cos(angle) * tr.speed;
          const ny = last.y + Math.sin(angle) * tr.speed;
          tr.points.push({ x: nx, y: ny });

          // Trim
          if (tr.points.length > tr.maxLen) tr.points.shift();

          // Kill if out of bounds
          if (nx < -20 || nx > w + 20 || ny < -20 || ny > h + 20) {
            tr.dead = true;
            continue;
          }

          // Kill after enough steps (natural turnover)
          if (tr.points.length >= tr.maxLen && Math.random() < 0.02) {
            tr.dead = true;
            continue;
          }

          // Draw: each segment colored from the painting
          if (tr.points.length < 2) continue;

          for (let j = 1; j < tr.points.length; j++) {
            const p0 = tr.points[j - 1];
            const p1 = tr.points[j];

            // Sample color at midpoint
            const mx = (p0.x + p1.x) / 2;
            const my = (p0.y + p1.y) / 2;
            const [r, g, b] = sampleColor(mx, my);
            const br = brightness(r, g, b);

            // Alpha: fade in at head, fade out at tail
            const ratio = j / tr.points.length;
            const fadeAlpha = ratio < 0.2 ? ratio / 0.2 : ratio > 0.8 ? (1 - ratio) / 0.2 : 1;

            // Boost colors slightly for visibility on dark bg
            const boost = 1.0;
            const cr = Math.min(255, r * boost);
            const cg = Math.min(255, g * boost);
            const cb = Math.min(255, b * boost);

            // Alpha based on brightness + fade
            const alpha = (0.2 + br * 0.6) * fadeAlpha;

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha})`;
            ctx.lineWidth = 0.3 + br * 0.7;
            ctx.lineCap = "round";
            ctx.stroke();
          }
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

      // Cleanup stored in ref
      (canvas as any).__cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
      };
    };

    return () => {
      if ((canvas as any).__cleanup) (canvas as any).__cleanup();
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
        background: "#050805",
      }}
    />
  );
}
