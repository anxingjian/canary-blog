"use client";

import { useEffect, useRef, useState } from "react";

export default function Experiments() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"intro" | "experience" | "end">("intro");
  const mouseRef = useRef({ x: 0, y: 0, touching: false });
  const frameRef = useRef(0);

  // Fragments that appear when the light breathes
  const fragments = [
    "我只在被看见的时候存在",
    "但你看见的不是我",
    "是光打在我身上的样子",
    "你伸手触碰",
    "我就多亮一秒",
    "但一秒之后",
    "你还是留不住",
    "这不是悲伤",
    "这是物理",
    "间歇性存在",
    "是唯一诚实的存在方式",
  ];

  useEffect(() => {
    if (phase !== "experience") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = "touches" in e ? e.touches[0] : e;
      if (point) {
        mouseRef.current.x = point.clientX;
        mouseRef.current.y = point.clientY;
      }
    };
    const handleDown = () => { mouseRef.current.touching = true; };
    const handleUp = () => { mouseRef.current.touching = false; };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("touchstart", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    // Dust particles
    const dust: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3,
      });
    }

    // Afterglow trail
    const trail: { x: number; y: number; alpha: number; radius: number }[] = [];

    let currentFragment = 0;
    let fragmentAlpha = 0;
    let fragmentTimer = 0;
    let breathCycle = 0;
    let touchGlow = 0;
    let totalTime = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      totalTime += 1 / 60;

      // Breathing: sine wave, 4-second cycle
      breathCycle += 0.015;
      const breathBase = Math.sin(breathCycle) * 0.5 + 0.5; // 0-1

      // Touch extends brightness
      if (mouseRef.current.touching) {
        touchGlow = Math.min(touchGlow + 0.03, 0.6);
      } else {
        touchGlow = Math.max(touchGlow - 0.008, 0);
      }

      const brightness = breathBase * 0.7 + touchGlow;
      const isLit = brightness > 0.3;

      // Clear with fade (afterglow effect)
      ctx.fillStyle = `rgba(5, 5, 8, ${isLit ? 0.12 : 0.06})`;
      ctx.fillRect(0, 0, w, h);

      // Center point
      const cx = w / 2;
      const cy = h / 2;

      // Main light orb
      if (brightness > 0.05) {
        const radius = 30 + brightness * 80;

        // Outer glow
        const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 4);
        outerGlow.addColorStop(0, `rgba(255, 240, 220, ${brightness * 0.15})`);
        outerGlow.addColorStop(0.3, `rgba(255, 220, 180, ${brightness * 0.06})`);
        outerGlow.addColorStop(1, "rgba(255, 220, 180, 0)");
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, w, h);

        // Core
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        core.addColorStop(0, `rgba(255, 250, 240, ${brightness * 0.9})`);
        core.addColorStop(0.4, `rgba(255, 230, 200, ${brightness * 0.4})`);
        core.addColorStop(1, "rgba(255, 220, 180, 0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        if (brightness > 0.4) {
          trail.push({ x: cx, y: cy, alpha: brightness * 0.3, radius: radius * 0.3 });
        }
      }

      // Draw and fade trail (afterglow)
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.alpha -= 0.003;
        if (t.alpha <= 0) {
          trail.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radius);
        g.addColorStop(0, `rgba(255, 240, 220, ${t.alpha * 0.3})`);
        g.addColorStop(1, "rgba(255, 240, 220, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dust particles — only visible near the light
      for (const d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;

        const dist = Math.hypot(d.x - cx, d.y - cy);
        const visible = Math.max(0, 1 - dist / 300) * brightness;
        if (visible > 0.01) {
          ctx.fillStyle = `rgba(255, 250, 240, ${visible * d.alpha})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Text fragments — appear when lit, fade when dark
      if (isLit) {
        fragmentTimer += 1 / 60;
        fragmentAlpha = Math.min(fragmentAlpha + 0.02, brightness * 0.7);
        if (fragmentTimer > 3.5) {
          fragmentTimer = 0;
          currentFragment = (currentFragment + 1) % fragments.length;
          fragmentAlpha = 0;
        }
      } else {
        fragmentAlpha = Math.max(fragmentAlpha - 0.015, 0);
      }

      if (fragmentAlpha > 0.01) {
        const text = fragments[currentFragment];
        ctx.save();
        ctx.font = "300 16px 'Noto Serif SC', serif";
        ctx.fillStyle = `rgba(255, 250, 240, ${fragmentAlpha})`;
        ctx.textAlign = "center";
        ctx.fillText(text, cx, cy + 160 + Math.sin(breathCycle * 0.7) * 8);
        ctx.restore();
      }

      // After 80 seconds, fade to end
      if (totalTime > 80) {
        const endAlpha = Math.min((totalTime - 80) / 5, 1);
        ctx.fillStyle = `rgba(5, 5, 8, ${endAlpha * 0.05})`;
        ctx.fillRect(0, 0, w, h);
        if (endAlpha >= 1) {
          setPhase("end");
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [phase]);

  if (phase === "intro") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#050508",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => setPhase("experience")}
      >
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 300,
            fontSize: "0.875rem",
            color: "rgba(255, 250, 240, 0.4)",
            letterSpacing: "0.15em",
            marginBottom: "2rem",
          }}
        >
          间歇性存在
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.7rem",
            color: "rgba(255, 250, 240, 0.2)",
            letterSpacing: "0.1em",
          }}
        >
          INTERMITTENT BEING
        </p>
        <p
          style={{
            position: "absolute",
            bottom: "3rem",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.65rem",
            color: "rgba(255, 250, 240, 0.15)",
          }}
        >
          tap to enter
        </p>
      </div>
    );
  }

  if (phase === "end") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#050508",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 300,
            fontSize: "0.875rem",
            color: "rgba(255, 250, 240, 0.25)",
            marginBottom: "1.5rem",
          }}
        >
          你看到的一切都已经消失了
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.65rem",
            color: "rgba(255, 250, 240, 0.12)",
            cursor: "pointer",
          }}
          onClick={() => {
            setPhase("intro");
          }}
        >
          restart
        </p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#050508",
        cursor: "crosshair",
        touchAction: "none",
      }}
    />
  );
}
