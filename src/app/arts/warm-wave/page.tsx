"use client";

import { useEffect, useRef } from "react";

export default function WarmWavePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    // --- Palette (warm only) ---
    const AMBER = [212, 160, 74];
    const SIENNA = [160, 82, 45];
    const BRICK = [196, 83, 60];
    const WARM_GOLD = [196, 160, 74];
    const DEEP_AMBER = [140, 90, 40];
    const CREAM = [240, 228, 200];
    const WARM_WHITE = [235, 225, 210];
    const WARM_DARK = [50, 32, 20];
    const DEEP_BROWN = [70, 40, 25];
    const FUJI_BASE = [180, 150, 120];

    const WAVE_COLORS = [AMBER, SIENNA, BRICK, WARM_GOLD, DEEP_AMBER, DEEP_BROWN];

    // --- Noise ---
    function noise2d(x: number, y: number, t: number): number {
      return Math.sin(x * 0.8 + y * 0.6 + t) * 0.5
        + Math.sin(x * 1.7 - y * 1.3 + t * 0.7 + 3.1) * 0.25
        + Math.sin(x * 3.1 + y * 2.7 + t * 1.3 + 7.7) * 0.125
        + Math.sin(x * 5.3 - y * 4.1 + t * 0.5 + 11.3) * 0.0625;
    }

    function noise1d(x: number, t: number): number {
      return Math.sin(x * 1.0 + t) * 0.5
        + Math.sin(x * 2.3 + t * 1.4 + 2.1) * 0.25
        + Math.sin(x * 4.7 + t * 0.6 + 5.3) * 0.125;
    }

    // --- Spray particles ---
    interface SprayParticle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number;
      color: number[];
    }
    const sprayParticles: SprayParticle[] = [];

    function emitSpray(x: number, y: number, count: number) {
      for (let i = 0; i < count && sprayParticles.length < 1500; i++) {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.9;
        const speed = 1 + Math.random() * 3;
        sprayParticles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5),
          vy: Math.sin(angle) * speed - Math.random() * 2,
          life: 1,
          maxLife: 80 + Math.random() * 150,
          size: 1.5 + Math.random() * 4,
          color: Math.random() > 0.4 ? CREAM : WARM_WHITE,
        });
      }
    }

    // --- Flow particles (MUCH denser) ---
    interface FlowParticle {
      x: number; y: number;
      prevX: number; prevY: number;
      speed: number;
      life: number;
      maxLife: number;
      colorIdx: number;
      width: number;
    }

    const flowParticles: FlowParticle[] = [];
    const FLOW_COUNT = 8000;

    function spawnFlowParticle(): FlowParticle {
      // Concentrate particles in the wave region
      const inWave = Math.random() < 0.75;
      let x: number, y: number;
      if (inWave) {
        // Wave zone: upper-center area
        x = W * 0.1 + Math.random() * W * 0.8;
        y = H * 0.08 + Math.random() * H * 0.5;
      } else {
        // Ocean zone
        x = Math.random() * W;
        y = H * 0.5 + Math.random() * H * 0.45;
      }
      return {
        x, y, prevX: x, prevY: y,
        speed: 0.4 + Math.random() * 2,
        life: 0,
        maxLife: 80 + Math.random() * 250,
        colorIdx: Math.floor(Math.random() * WAVE_COLORS.length),
        width: 0.5 + Math.random() * 2.5,
      };
    }

    for (let i = 0; i < FLOW_COUNT; i++) {
      const p = spawnFlowParticle();
      p.life = Math.random() * p.maxLife;
      flowParticles.push(p);
    }

    // --- Wave flow field ---
    // The Great Wave: massive curl from upper-right sweeping left and down
    function waveFlowAngle(x: number, y: number, t: number): number {
      const nx = x / W;
      const ny = y / H;

      // Main wave crest — large curl center
      const crestX = W * 0.52;
      const crestY = H * 0.25;
      const dx = x - crestX;
      const dy = y - crestY;
      const distToCrest = Math.sqrt(dx * dx + dy * dy);
      const crestRadius = W * 0.4;
      const curlStrength = Math.max(0, 1 - distToCrest / crestRadius);
      const curlAngle = Math.atan2(dy, dx) + Math.PI * 0.55;

      // Secondary wave (smaller, behind the main one)
      const crest2X = W * 0.2;
      const crest2Y = H * 0.35;
      const dx2 = x - crest2X;
      const dy2 = y - crest2Y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const radius2 = W * 0.2;
      const curl2 = Math.max(0, 1 - dist2 / radius2) * 0.5;
      const curl2Angle = Math.atan2(dy2, dx2) + Math.PI * 0.5;

      // Claw tips at wave crest
      const claws = [
        [W * 0.38, H * 0.15, W * 0.1],
        [W * 0.58, H * 0.18, W * 0.08],
        [W * 0.68, H * 0.28, W * 0.07],
      ];
      let clawInfluence = 0;
      let clawAngle = 0;
      for (const [cx, cy, cr] of claws) {
        const cdx = x - cx;
        const cdy = y - cy;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < cr) {
          const s = (1 - cdist / cr) * 0.7;
          if (s > clawInfluence) {
            clawInfluence = s;
            clawAngle = Math.atan2(cdy, cdx) + Math.PI * 0.5;
          }
        }
      }

      // Ocean: horizontal flow below wave
      const oceanBase = ny > 0.55 ? (ny - 0.55) / 0.45 : 0;
      const oceanAngle = Math.PI * 0.05 + noise2d(nx * 2, ny * 2, t * 0.2) * 0.3;

      // Blend everything
      let angle = oceanAngle;
      const mainWeight = curlStrength * 0.85 * (1 - oceanBase);
      angle = angle * (1 - mainWeight) + curlAngle * mainWeight;
      angle = angle * (1 - curl2 * (1 - oceanBase)) + curl2Angle * curl2 * (1 - oceanBase);
      angle = angle * (1 - clawInfluence) + clawAngle * clawInfluence;

      // Turbulence
      angle += noise2d(nx * 5, ny * 5, t * 0.4) * 0.5;

      return angle;
    }

    // --- Wave shape for filled regions ---
    function getWaveY(frac: number, t: number): number {
      let y: number;
      if (frac < 0.15) {
        y = H * 0.55 - frac / 0.15 * H * 0.15;
      } else if (frac < 0.35) {
        const p = (frac - 0.15) / 0.2;
        y = H * 0.4 - Math.sin(p * Math.PI) * H * 0.2;
      } else if (frac < 0.55) {
        const p = (frac - 0.35) / 0.2;
        y = H * 0.4 - Math.sin((1 - p) * Math.PI * 0.7) * H * 0.18;
      } else if (frac < 0.75) {
        const p = (frac - 0.55) / 0.2;
        y = H * 0.35 + p * H * 0.2;
      } else {
        const p = (frac - 0.75) / 0.25;
        y = H * 0.55 + p * H * 0.05;
      }
      y += noise1d(frac * 10, t * 0.3) * H * 0.025;
      return y;
    }

    let time = 0;
    let raf: number;
    let frameCount = 0;

    function drawFuji() {
      const cx = W * 0.48;
      const top = H * 0.4;
      const base = H * 0.58;
      const hw = W * 0.07;

      ctx!.beginPath();
      ctx!.moveTo(cx - hw, base);
      ctx!.lineTo(cx - hw * 0.12, top);
      ctx!.lineTo(cx + hw * 0.12, top);
      ctx!.lineTo(cx + hw, base);
      ctx!.closePath();

      const grad = ctx!.createLinearGradient(cx, top, cx, base);
      grad.addColorStop(0, `rgba(${FUJI_BASE[0]}, ${FUJI_BASE[1]}, ${FUJI_BASE[2]}, 0.6)`);
      grad.addColorStop(0.4, `rgba(${SIENNA[0]}, ${SIENNA[1]}, ${SIENNA[2]}, 0.4)`);
      grad.addColorStop(1, `rgba(${WARM_DARK[0]}, ${WARM_DARK[1]}, ${WARM_DARK[2]}, 0.2)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Snow cap
      ctx!.beginPath();
      ctx!.moveTo(cx - hw * 0.2, top + (base - top) * 0.15);
      ctx!.lineTo(cx - hw * 0.1, top);
      ctx!.lineTo(cx + hw * 0.1, top);
      ctx!.lineTo(cx + hw * 0.2, top + (base - top) * 0.15);
      ctx!.closePath();
      ctx!.fillStyle = `rgba(${CREAM[0]}, ${CREAM[1]}, ${CREAM[2]}, 0.5)`;
      ctx!.fill();
    }

    // --- Draw filled wave body (beneath particles) ---
    function drawWaveBody(t: number) {
      // Main wave as a filled shape
      ctx!.beginPath();
      const startX = W * 0.05;
      const endX = W * 0.95;
      const steps = 100;

      // Top edge (wave crest)
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const x = startX + frac * (endX - startX);
        const y = getWaveY(frac, t);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }

      // Bottom edge (ocean base)
      ctx!.lineTo(endX, H * 0.7);
      ctx!.lineTo(startX, H * 0.7);
      ctx!.closePath();

      const grad = ctx!.createLinearGradient(0, H * 0.2, 0, H * 0.7);
      grad.addColorStop(0, `rgba(${BRICK[0]}, ${BRICK[1]}, ${BRICK[2]}, 0.12)`);
      grad.addColorStop(0.3, `rgba(${SIENNA[0]}, ${SIENNA[1]}, ${SIENNA[2]}, 0.1)`);
      grad.addColorStop(0.6, `rgba(${DEEP_AMBER[0]}, ${DEEP_AMBER[1]}, ${DEEP_AMBER[2]}, 0.08)`);
      grad.addColorStop(1, `rgba(${WARM_DARK[0]}, ${WARM_DARK[1]}, ${WARM_DARK[2]}, 0.06)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Emit spray along crest
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        if (frac > 0.2 && frac < 0.6 && Math.random() < 0.08) {
          const x = startX + frac * (endX - startX);
          const y = getWaveY(frac, t);
          emitSpray(x, y, 2);
        }
      }

      // Draw multiple crest lines for thickness
      for (let offset = 0; offset < 5; offset++) {
        ctx!.beginPath();
        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const x = startX + frac * (endX - startX);
          const y = getWaveY(frac, t) + offset * 3 + noise1d(frac * 12 + offset, t * 0.5) * 5;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        const col = WAVE_COLORS[offset % WAVE_COLORS.length];
        ctx!.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.3 - offset * 0.04})`;
        ctx!.lineWidth = 2 - offset * 0.3;
        ctx!.stroke();
      }
    }

    function animate() {
      time += 0.006;
      frameCount++;

      // Trail effect — slower fade = more accumulation = denser look
      ctx!.fillStyle = "rgba(10, 10, 10, 0.03)";
      ctx!.fillRect(0, 0, W, H);

      // Periodic deeper clear
      if (frameCount % 300 === 0) {
        ctx!.fillStyle = "rgba(10, 10, 10, 0.1)";
        ctx!.fillRect(0, 0, W, H);
      }

      // Background Fuji
      if (frameCount % 3 === 0) drawFuji();

      // Wave body (filled shape for volume)
      if (frameCount % 2 === 0) drawWaveBody(time);

      // --- Flow particles ---
      for (let i = 0; i < flowParticles.length; i++) {
        const p = flowParticles[i];
        p.life++;

        if (p.life > p.maxLife || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) {
          flowParticles[i] = spawnFlowParticle();
          continue;
        }

        p.prevX = p.x;
        p.prevY = p.y;

        const angle = waveFlowAngle(p.x, p.y, time);
        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;

        const lifeFrac = p.life / p.maxLife;
        const alpha = lifeFrac < 0.08
          ? lifeFrac / 0.08
          : lifeFrac > 0.75
            ? (1 - lifeFrac) / 0.25
            : 1;

        const col = WAVE_COLORS[p.colorIdx];

        ctx!.beginPath();
        ctx!.moveTo(p.prevX, p.prevY);
        ctx!.lineTo(p.x, p.y);
        ctx!.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha * 0.4})`;
        ctx!.lineWidth = p.width;
        ctx!.stroke();
      }

      // --- Spray particles ---
      for (let i = sprayParticles.length - 1; i >= 0; i--) {
        const p = sprayParticles[i];
        p.life -= 1 / p.maxLife;
        p.vy += 0.015;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;

        if (p.life <= 0) {
          sprayParticles.splice(i, 1);
          continue;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.life * 0.7})`;
        ctx!.fill();
      }

      // --- Ocean surface lines ---
      if (frameCount % 4 === 0) {
        const oceanTop = H * 0.58;
        for (let i = 0; i < 20; i++) {
          const y = oceanTop + i * (H - oceanTop - 20) / 20;
          ctx!.beginPath();
          for (let j = 0; j <= 80; j++) {
            const x = (j / 80) * W;
            const ny2 = y + noise1d(j * 0.12 + i * 0.4, time * 0.25) * 6;
            if (j === 0) ctx!.moveTo(x, ny2);
            else ctx!.lineTo(x, ny2);
          }
          const depth = i / 20;
          const col = depth < 0.3 ? AMBER : depth < 0.5 ? WARM_GOLD : depth < 0.7 ? SIENNA : DEEP_AMBER;
          ctx!.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.06 + (1 - depth) * 0.08})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // --- Label ---
      ctx!.fillStyle = `rgba(${WARM_WHITE[0]}, ${WARM_WHITE[1]}, ${WARM_WHITE[2]}, 0.2)`;
      ctx!.font = "11px 'Space Mono', monospace";
      ctx!.textAlign = "right";
      ctx!.fillText("warm-wave · 暖浪 · after Hokusai", W - 24, H - 24);

      raf = requestAnimationFrame(animate);
    }

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
