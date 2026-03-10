"use client";

import { useEffect, useRef, useCallback } from "react";

/*
 * Nighthawks — Pixel Particle Deconstruction (方案 A)
 *
 * Sample every pixel from the painting, turn each into a colored particle.
 * Particles breathe and drift slightly — like the painting is alive.
 * Mouse interaction disperses nearby particles.
 * Recognizable as the original, but clearly a digital afterimage.
 */

interface Particle {
  // Home position (normalized 0-1)
  hx: number;
  hy: number;
  // Current position
  x: number;
  y: number;
  // Velocity
  vx: number;
  vy: number;
  // Color from painting
  r: number;
  g: number;
  b: number;
  // Brightness (0-1)
  br: number;
  // Animation phase offset
  phase: number;
  // Size
  size: number;
}

export default function NighthawksParticles() {
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

    // Load painting and sample pixels
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/canary-blog/paintings/nighthawks.jpg";

    let particles: Particle[] = [];
    let raf = 0;
    let time = 0;
    let prevTime = performance.now();
    let imageLoaded = false;

    // Drawing area (cover viewport while maintaining aspect ratio)
    let drawX = 0, drawY = 0, drawW = 0, drawH = 0;

    function computeDrawRect() {
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const vpAspect = W / H;
      if (imgAspect > vpAspect) {
        // Image wider — fit height, crop width
        drawH = H;
        drawW = H * imgAspect;
        drawX = (W - drawW) / 2;
        drawY = 0;
      } else {
        // Image taller — fit width, crop height
        drawW = W;
        drawH = W / imgAspect;
        drawX = 0;
        drawY = (H - drawH) / 2;
      }
    }

    img.onload = () => {
      // Sample pixels from painting
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

      // Sample pixels — denser in bright/figure areas for recognizability
      const totalPixels = sW * sH;
      const baseStep = Math.max(1, Math.round(Math.sqrt(totalPixels / 80000)));

      particles = [];
      for (let y = 0; y < sH; y += baseStep) {
        for (let x = 0; x < sW; x += baseStep) {
          const i = (y * sW + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const br = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          // Skip very dark pixels (reduce particle count in shadows)
          if (br < 0.04 && Math.random() > 0.3) continue;

          // Bright areas (figures, lit surfaces) get extra density
          // by adding particles at sub-pixel offsets
          const extraSamples = br > 0.35 ? (br > 0.6 ? 2 : 1) : 0;

          const nx = x / sW;
          const ny = y / sH;

          for (let s = 0; s <= extraSamples; s++) {
            const jx = s === 0 ? 0 : (Math.random() - 0.5) * (baseStep / sW) * 0.8;
            const jy = s === 0 ? 0 : (Math.random() - 0.5) * (baseStep / sH) * 0.8;
            particles.push({
              hx: nx + jx,
              hy: ny + jy,
              x: nx + jx + (Math.random() - 0.5) * 0.3,
              y: ny + jy + (Math.random() - 0.5) * 0.3,
              vx: 0,
              vy: 0,
              r, g, b, br,
              phase: Math.random() * Math.PI * 2,
              // Smaller particles overall — denser packing for sharper image
              size: 0.6 + br * 0.8 + Math.random() * 0.3,
            });
          }
        }
      }

      imageLoaded = true;
    };

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
      const m = mouseRef.current;
      const tm = targetMouseRef.current;
      m.x += (tm.x - m.x) * 0.08;
      m.y += (tm.y - m.y) * 0.08;

      // Convert mouse to normalized painting coords
      const mnx = (m.x - drawX) / drawW;
      const mny = (m.y - drawY) / drawH;

      // Assembly animation — particles gather to their home positions
      const assembleT = Math.min(time / 6, 1);
      const ease = assembleT < 1 ? assembleT * assembleT * (3 - 2 * assembleT) : 1;
      const returnStrength = 0.5 + ease * 3;

      // Dark background matching the painting's mood
      ctx.fillStyle = "#0a0e0c";
      ctx.fillRect(0, 0, cW, cH);

      computeDrawRect();

      for (const p of particles) {
        // Breathing motion — gentle oscillation
        const breathX = Math.sin(time * 0.3 + p.phase) * 0.001 * (1 - p.br * 0.5);
        const breathY = Math.cos(time * 0.25 + p.phase * 1.3) * 0.0008 * (1 - p.br * 0.5);

        // Return to home position
        const dx = p.hx - p.x;
        const dy = p.hy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.0001) {
          const ret = returnStrength * dt;
          p.vx += dx * ret;
          p.vy += dy * ret;
        }

        // Mouse repulsion
        const mdx = p.x - mnx;
        const mdy = p.y - mny;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseRadius = 0.08;
        if (mDist < mouseRadius && mDist > 0.001) {
          const force = 0.15 * Math.pow(1 - mDist / mouseRadius, 2) * dt;
          p.vx += (mdx / mDist) * force;
          p.vy += (mdy / mDist) * force;
        }

        // Apply velocity with damping
        p.vx = (p.vx + breathX) * 0.92;
        p.vy = (p.vy + breathY) * 0.92;
        p.x += p.vx;
        p.y += p.vy;

        // Convert to screen coordinates
        const sx = (drawX + p.x * drawW) * dpr;
        const sy = (drawY + p.y * drawH) * dpr;

        // Skip off-screen
        if (sx < -10 || sx > cW + 10 || sy < -10 || sy > cH + 10) continue;

        // Draw particle
        const displacement = Math.sqrt((p.x - p.hx) ** 2 + (p.y - p.hy) ** 2);
        const displacementFade = Math.max(0.3, 1 - displacement * 8);
        const alpha = (0.4 + p.br * 0.5) * displacementFade;

        const size = p.size * dpr;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
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
