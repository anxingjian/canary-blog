"use client";

import { useEffect, useRef } from "react";

// warm-wave · 暖浪 · after Hokusai
// Color exercise: reinterpret a cold-palette masterpiece in warm tones
// The Great Wave off Kanagawa — amber, sienna, brick, warm gold

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

    // --- Palette ---
    const AMBER = [212, 160, 74];    // #d4a04a
    const SIENNA = [160, 82, 45];    // #a0522d
    const BRICK = [196, 83, 60];     // #c4533c
    const WARM_GOLD = [196, 160, 74]; // #c4a04a
    const CREAM = [240, 228, 200];   // foam/spray
    const WARM_WHITE = [235, 225, 210];
    const WARM_DARK = [45, 30, 20];  // deep shadow
    const FUJI_BASE = [180, 150, 120];
    const SKY = [60, 48, 38];

    const WAVE_COLORS = [AMBER, SIENNA, BRICK, WARM_GOLD, WARM_DARK];

    // --- Simplex-like noise (layered sine approximation) ---
    function noise2d(x: number, y: number, t: number): number {
      const n1 = Math.sin(x * 0.8 + y * 0.6 + t) * 0.5;
      const n2 = Math.sin(x * 1.7 - y * 1.3 + t * 0.7 + 3.1) * 0.25;
      const n3 = Math.sin(x * 3.1 + y * 2.7 + t * 1.3 + 7.7) * 0.125;
      const n4 = Math.sin(x * 5.3 - y * 4.1 + t * 0.5 + 11.3) * 0.0625;
      return n1 + n2 + n3 + n4;
    }

    function noise1d(x: number, t: number): number {
      return Math.sin(x * 1.0 + t) * 0.5 +
        Math.sin(x * 2.3 + t * 1.4 + 2.1) * 0.25 +
        Math.sin(x * 4.7 + t * 0.6 + 5.3) * 0.125;
    }

    // --- Particles for wave spray / foam ---
    interface SprayParticle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number;
      color: number[];
    }

    const sprayParticles: SprayParticle[] = [];
    const MAX_SPRAY = 600;

    function emitSpray(x: number, y: number, count: number) {
      for (let i = 0; i < count && sprayParticles.length < MAX_SPRAY; i++) {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.8;
        const speed = 0.5 + Math.random() * 2.5;
        sprayParticles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(angle) * speed - Math.random() * 1.5,
          life: 1,
          maxLife: 60 + Math.random() * 120,
          size: 1 + Math.random() * 3,
          color: Math.random() > 0.3 ? CREAM : WARM_WHITE,
        });
      }
    }

    // --- Flow field particles for wave body ---
    interface FlowParticle {
      x: number; y: number;
      prevX: number; prevY: number;
      speed: number;
      life: number;
      maxLife: number;
      colorIdx: number;
      layer: number; // 0=deep, 1=mid, 2=surface
    }

    const flowParticles: FlowParticle[] = [];
    const FLOW_COUNT = 2000;

    function spawnFlowParticle(): FlowParticle {
      const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
      // Spawn weighted towards wave region (upper 60% of canvas)
      const x = Math.random() * W;
      const y = H * 0.15 + Math.random() * H * 0.55;
      return {
        x, y, prevX: x, prevY: y,
        speed: 0.5 + Math.random() * 1.5,
        life: 0,
        maxLife: 100 + Math.random() * 200,
        colorIdx: Math.floor(Math.random() * WAVE_COLORS.length),
        layer,
      };
    }

    for (let i = 0; i < FLOW_COUNT; i++) {
      const p = spawnFlowParticle();
      p.life = Math.random() * p.maxLife; // stagger
      flowParticles.push(p);
    }

    // --- The Great Wave flow field ---
    // Creates a curling wave pattern: main wave crest at ~30% from top,
    // curling forward (right to left), with secondary wave behind
    function waveFlowAngle(x: number, y: number, t: number): number {
      const nx = x / W;
      const ny = y / H;

      // Main curl: large circular flow centered around the crest
      // Crest position shifts slightly with time
      const crestX = W * 0.55;
      const crestY = H * 0.28;
      const dx = x - crestX;
      const dy = y - crestY;
      const distToCrest = Math.sqrt(dx * dx + dy * dy);
      const crestRadius = W * 0.35;

      // Curl influence — stronger near the crest
      const curlStrength = Math.max(0, 1 - distToCrest / crestRadius);
      const curlAngle = Math.atan2(dy, dx) + Math.PI * 0.5; // perpendicular = circular

      // General rightward-and-down flow for the base ocean
      const baseAngle = Math.PI * 0.15 + noise2d(nx * 3, ny * 3, t * 0.3) * 0.5;

      // Secondary smaller curl (the "claw" tips)
      const claw1X = W * 0.4, claw1Y = H * 0.22;
      const claw2X = W * 0.65, claw2Y = H * 0.35;
      let clawInfluence = 0;
      let clawAngle = 0;

      for (const [cx, cy] of [[claw1X, claw1Y], [claw2X, claw2Y]]) {
        const cdx = x - cx;
        const cdy = y - cy;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const cradius = W * 0.12;
        if (cdist < cradius) {
          const s = Math.max(0, 1 - cdist / cradius);
          if (s > clawInfluence) {
            clawInfluence = s;
            clawAngle = Math.atan2(cdy, cdx) + Math.PI * 0.5;
          }
        }
      }

      // Blend
      let angle = baseAngle;
      angle = angle * (1 - curlStrength * 0.8) + curlAngle * curlStrength * 0.8;
      angle = angle * (1 - clawInfluence * 0.6) + clawAngle * clawInfluence * 0.6;

      // Add noise turbulence
      angle += noise2d(nx * 6, ny * 6, t * 0.5) * 0.4;

      return angle;
    }

    let time = 0;
    let raf: number;

    function drawFuji(t: number) {
      // Small Mt. Fuji in the background, between the waves
      const fujiCx = W * 0.48;
      const fujiTop = H * 0.42;
      const fujiBase = H * 0.58;
      const fujiHalfW = W * 0.06;

      // Mountain body
      ctx!.beginPath();
      ctx!.moveTo(fujiCx - fujiHalfW, fujiBase);
      ctx!.lineTo(fujiCx - fujiHalfW * 0.15, fujiTop);
      ctx!.lineTo(fujiCx + fujiHalfW * 0.15, fujiTop);
      ctx!.lineTo(fujiCx + fujiHalfW, fujiBase);
      ctx!.closePath();

      const grad = ctx!.createLinearGradient(fujiCx, fujiTop, fujiCx, fujiBase);
      grad.addColorStop(0, `rgba(${FUJI_BASE[0]}, ${FUJI_BASE[1]}, ${FUJI_BASE[2]}, 0.5)`);
      grad.addColorStop(0.3, `rgba(${SIENNA[0]}, ${SIENNA[1]}, ${SIENNA[2]}, 0.35)`);
      grad.addColorStop(1, `rgba(${WARM_DARK[0]}, ${WARM_DARK[1]}, ${WARM_DARK[2]}, 0.2)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Snow cap — warm cream
      ctx!.beginPath();
      ctx!.moveTo(fujiCx - fujiHalfW * 0.25, fujiTop + (fujiBase - fujiTop) * 0.15);
      ctx!.lineTo(fujiCx - fujiHalfW * 0.12, fujiTop);
      ctx!.lineTo(fujiCx + fujiHalfW * 0.12, fujiTop);
      ctx!.lineTo(fujiCx + fujiHalfW * 0.25, fujiTop + (fujiBase - fujiTop) * 0.15);
      // Jagged snow line
      const segments = 6;
      for (let i = segments; i >= 0; i--) {
        const sx = fujiCx - fujiHalfW * 0.25 + (fujiHalfW * 0.5 / segments) * i;
        const sy = fujiTop + (fujiBase - fujiTop) * (0.12 + Math.sin(i * 2.3 + t) * 0.03);
        ctx!.lineTo(sx, sy);
      }
      ctx!.closePath();
      ctx!.fillStyle = `rgba(${CREAM[0]}, ${CREAM[1]}, ${CREAM[2]}, 0.4)`;
      ctx!.fill();
    }

    function drawWaveCrestLine(t: number) {
      // Draw the main wave crest as a series of curves
      ctx!.beginPath();
      const startX = W * 0.15;
      const endX = W * 0.85;
      const segments = 80;

      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = startX + frac * (endX - startX);

        // Main wave shape: rises to peak around 40-60%, then curls down
        let y: number;
        if (frac < 0.2) {
          // Rising from left
          y = H * 0.5 - frac * H * 0.8;
        } else if (frac < 0.5) {
          // Main crest peak
          const peak = (frac - 0.2) / 0.3;
          y = H * 0.34 - Math.sin(peak * Math.PI) * H * 0.12;
        } else if (frac < 0.7) {
          // Curling over
          const curl = (frac - 0.5) / 0.2;
          y = H * 0.34 + curl * H * 0.15;
        } else {
          // Trailing off
          const trail = (frac - 0.7) / 0.3;
          y = H * 0.49 + trail * H * 0.05;
        }

        // Add wave noise
        y += noise1d(frac * 8, t * 0.4) * H * 0.03;

        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);

        // Emit spray at the crest
        if (frac > 0.25 && frac < 0.55 && Math.random() < 0.03) {
          emitSpray(x, y, 1);
        }
      }

      ctx!.strokeStyle = `rgba(${AMBER[0]}, ${AMBER[1]}, ${AMBER[2]}, 0.15)`;
      ctx!.lineWidth = 2;
      ctx!.stroke();
    }

    function animate() {
      time += 0.008;

      // Semi-transparent overlay for trail effect
      ctx!.fillStyle = "rgba(10, 10, 10, 0.06)";
      ctx!.fillRect(0, 0, W, H);

      // Every ~200 frames, do a deeper clear to prevent buildup
      if (Math.floor(time * 125) % 200 === 0) {
        ctx!.fillStyle = "rgba(10, 10, 10, 0.15)";
        ctx!.fillRect(0, 0, W, H);
      }

      // Draw Fuji (faintly, in background)
      drawFuji(time);

      // Draw wave crest guide lines (subtle)
      drawWaveCrestLine(time);

      // Secondary wave crest
      ctx!.save();
      ctx!.translate(W * 0.15, H * 0.12);
      ctx!.scale(0.5, 0.5);
      drawWaveCrestLine(time + 1.5);
      ctx!.restore();

      // --- Update and draw flow particles ---
      for (let i = 0; i < flowParticles.length; i++) {
        const p = flowParticles[i];
        p.life++;

        if (p.life > p.maxLife || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          flowParticles[i] = spawnFlowParticle();
          continue;
        }

        p.prevX = p.x;
        p.prevY = p.y;

        const angle = waveFlowAngle(p.x, p.y, time);
        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;

        // Fade in/out
        const lifeFrac = p.life / p.maxLife;
        const alpha = lifeFrac < 0.1
          ? lifeFrac / 0.1
          : lifeFrac > 0.8
            ? (1 - lifeFrac) / 0.2
            : 1;

        const col = WAVE_COLORS[p.colorIdx];
        const layerAlpha = p.layer === 0 ? 0.12 : p.layer === 1 ? 0.2 : 0.35;

        ctx!.beginPath();
        ctx!.moveTo(p.prevX, p.prevY);
        ctx!.lineTo(p.x, p.y);
        ctx!.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha * layerAlpha})`;
        ctx!.lineWidth = p.layer === 2 ? 1.5 : p.layer === 1 ? 1 : 0.5;
        ctx!.stroke();
      }

      // --- Update and draw spray particles ---
      for (let i = sprayParticles.length - 1; i >= 0; i--) {
        const p = sprayParticles[i];
        p.life -= 1 / p.maxLife;
        p.vy += 0.01; // gravity
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.life <= 0) {
          sprayParticles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.5;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
        ctx!.fill();
      }

      // --- Ocean surface below waves (horizontal flow lines) ---
      const oceanTop = H * 0.55;
      for (let i = 0; i < 15; i++) {
        const y = oceanTop + i * (H - oceanTop) / 15;
        ctx!.beginPath();
        for (let j = 0; j <= 60; j++) {
          const x = (j / 60) * W;
          const ny = y + noise1d(j * 0.15 + i * 0.5, time * 0.3) * 8;
          if (j === 0) ctx!.moveTo(x, ny);
          else ctx!.lineTo(x, ny);
        }
        const depth = (y - oceanTop) / (H - oceanTop);
        const col = depth < 0.3 ? AMBER : depth < 0.6 ? SIENNA : WARM_DARK;
        ctx!.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.04 + (1 - depth) * 0.06})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // --- Sky gradient (very subtle, top area) ---
      const skyGrad = ctx!.createLinearGradient(0, 0, 0, H * 0.3);
      skyGrad.addColorStop(0, `rgba(${SKY[0]}, ${SKY[1]}, ${SKY[2]}, 0.03)`);
      skyGrad.addColorStop(1, "transparent");
      ctx!.fillStyle = skyGrad;
      ctx!.fillRect(0, 0, W, H * 0.3);

      // --- Label ---
      ctx!.fillStyle = `rgba(${WARM_WHITE[0]}, ${WARM_WHITE[1]}, ${WARM_WHITE[2]}, 0.25)`;
      ctx!.font = "11px 'Space Mono', monospace";
      ctx!.textAlign = "right";
      ctx!.fillText("warm-wave · 暖浪 · after Hokusai", W - 24, H - 24);

      raf = requestAnimationFrame(animate);
    }

    // Initial background
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
      <canvas
        ref={canvasRef}
        style={{ display: "block" }}
      />
    </div>
  );
}
