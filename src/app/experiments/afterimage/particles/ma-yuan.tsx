"use client";

import { useEffect, useRef, useCallback } from "react";

/*
 * 寒江独钓 — Pixel Particle Deconstruction
 *
 * Inspired by 千里江山图 visual art: layered silhouette colors,
 * ink-wash dissolution. Particles sample from the painting and
 * drift like ink dissolving in water.
 *
 * The vast emptiness of the original is preserved — particles in
 * empty areas are sparse and ghostly, while the boat/figure area
 * has dense, dark ink particles.
 */

interface Particle {
  hx: number; hy: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  br: number;
  phase: number;
  size: number;
  inkWeight: number; // How "inky" — thicker for dark areas
}

export default function MaYuanParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const targetMouseRef = useRef({ x: -9999, y: -9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseLeave = useCallback(() => {
    targetMouseRef.current = { x: -9999, y: -9999 };
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length) targetMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback(() => {
    targetMouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/canary-blog/paintings/ma-yuan-angler.jpg";

    let particles: Particle[] = [];
    let raf = 0;
    let time = 0;
    let prevTime = performance.now();
    let imageLoaded = false;
    let drawX = 0, drawY = 0, drawW = 0, drawH = 0;

    function computeDrawRect() {
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const vpAspect = W / H;
      if (imgAspect > vpAspect) {
        drawH = H; drawW = H * imgAspect;
        drawX = (W - drawW) / 2; drawY = 0;
      } else {
        drawW = W; drawH = W / imgAspect;
        drawX = 0; drawY = (H - drawH) / 2;
      }
    }

    img.onload = () => {
      const sampleCanvas = document.createElement("canvas");
      const sW = img.naturalWidth;
      const sH = img.naturalHeight;
      sampleCanvas.width = sW;
      sampleCanvas.height = sH;
      const sCtx = sampleCanvas.getContext("2d")!;
      sCtx.drawImage(img, 0, 0);
      const imageData = sCtx.getImageData(0, 0, sW, sH);
      const data = imageData.data;

      computeDrawRect();

      // For Ma Yuan's painting: the paper background is warm beige.
      // We want MORE particles in dark ink areas, FEWER in light/empty areas.
      // This preserves the vast emptiness that makes this painting powerful.
      const totalPixels = sW * sH;
      const step = Math.max(1, Math.round(Math.sqrt(totalPixels / 60000)));

      particles = [];
      for (let y = 0; y < sH; y += step) {
        for (let x = 0; x < sW; x += step) {
          const i = (y * sW + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const br = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          // Ink darkness — higher = more ink
          const inkDark = 1 - br;

          // Probability of keeping this particle:
          // Very light areas (paper): only ~5% chance
          // Dark areas (ink): ~95% chance
          const keepProb = 0.05 + inkDark * 0.9;
          if (Math.random() > keepProb) continue;

          const nx = x / sW;
          const ny = y / sH;

          // Ink particles are larger and more opaque
          const inkWeight = Math.pow(inkDark, 1.5);

          particles.push({
            hx: nx, hy: ny,
            x: nx + (Math.random() - 0.5) * 0.4,
            y: ny + (Math.random() - 0.5) * 0.4,
            vx: 0, vy: 0,
            r, g, b, br,
            phase: Math.random() * Math.PI * 2,
            // Ink strokes are elongated, light particles are round/small
            size: inkWeight > 0.3
              ? 1.5 + inkWeight * 2.5 + Math.random()
              : 0.8 + Math.random() * 1.2,
            inkWeight,
          });
        }
      }

      imageLoaded = true;
    };

    // Create an ink-brush sprite for dark particles
    function createInkDot(sz: number): HTMLCanvasElement {
      const c = document.createElement("canvas");
      c.width = sz; c.height = sz;
      const g = c.getContext("2d")!;
      const cx = sz / 2;
      const grad = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.3, "rgba(0,0,0,0.6)");
      grad.addColorStop(0.6, "rgba(0,0,0,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, sz, sz);
      return c;
    }
    const inkSprite = createInkDot(32);

    function animate() {
      raf = requestAnimationFrame(animate);
      if (!imageLoaded) return;

      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      time += dt;

      const cW = canvas!.width;
      const cH = canvas!.height;

      // Smooth mouse
      const m = mouseRef.current, tm = targetMouseRef.current;
      m.x += (tm.x - m.x) * 0.06;
      m.y += (tm.y - m.y) * 0.06;
      const mnx = (m.x - drawX) / drawW;
      const mny = (m.y - drawY) / drawH;

      // Assembly
      const assembleT = Math.min(time / 8, 1);
      const ease = assembleT * assembleT * (3 - 2 * assembleT);
      const returnStrength = 0.3 + ease * 2.5;

      // Warm paper background — like aged xuan paper
      ctx.fillStyle = "#f0e8d8";
      ctx.fillRect(0, 0, cW, cH);

      computeDrawRect();

      ctx.globalCompositeOperation = "multiply";

      for (const p of particles) {
        // Ink particles: subtle drift like water current
        // Light particles: barely move
        const driftScale = p.inkWeight > 0.2 ? 0.0015 : 0.0003;
        const breathX = Math.sin(time * 0.2 + p.phase) * driftScale;
        const breathY = Math.cos(time * 0.15 + p.phase * 1.7) * driftScale * 0.6;

        // Return to home
        const dx = p.hx - p.x;
        const dy = p.hy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.0001) {
          const retStr = returnStrength * (0.5 + p.inkWeight * 0.5);
          p.vx += dx * retStr * dt;
          p.vy += dy * retStr * dt;
        }

        // Mouse: ink particles scatter like water disturbed
        const mdx = p.x - mnx;
        const mdy = p.y - mny;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseRadius = 0.1;
        if (mDist < mouseRadius && mDist > 0.001) {
          const force = 0.12 * Math.pow(1 - mDist / mouseRadius, 2) * dt;
          p.vx += (mdx / mDist) * force;
          p.vy += (mdy / mDist) * force;
        }

        p.vx = (p.vx + breathX) * 0.9;
        p.vy = (p.vy + breathY) * 0.9;
        p.x += p.vx;
        p.y += p.vy;

        const sx = (drawX + p.x * drawW) * dpr;
        const sy = (drawY + p.y * drawH) * dpr;
        if (sx < -20 || sx > cW + 20 || sy < -20 || sy > cH + 20) continue;

        const displacement = Math.sqrt((p.x - p.hx) ** 2 + (p.y - p.hy) ** 2);
        const displaceFade = Math.max(0.2, 1 - displacement * 6);

        if (p.inkWeight > 0.15) {
          // Dark ink particles — use ink sprite with multiply blend
          const alpha = (0.3 + p.inkWeight * 0.65) * displaceFade;
          const size = p.size * dpr * 1.5;
          ctx.globalAlpha = alpha;
          // Tint: use the painting's actual color
          // For ink wash, we draw the sprite tinted
          ctx.drawImage(inkSprite, sx - size / 2, sy - size / 2, size, size);
        } else {
          // Light / paper-tone particles — subtle dots
          const alpha = (0.08 + p.br * 0.15) * displaceFade;
          const size = p.size * dpr;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
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
