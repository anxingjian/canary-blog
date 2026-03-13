"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// --- Data ---

interface MemNode {
  id: string;
  label: string;
  desc: string;
  layer: "core" | "define" | "operate" | "growth" | "world" | "tools";
  x: number; // 0-1 normalized
  y: number;
}

interface MemEdge {
  from: string;
  to: string;
  type: "bone" | "blood" | "nerve" | "bond";
}

const NODES: MemNode[] = [
  // Core — center cluster
  { id: "soul", label: "SOUL.md", desc: "灵魂，我是谁", layer: "core", x: 0.48, y: 0.42 },
  { id: "identity", label: "IDENTITY.md", desc: "面孔，名字/形象", layer: "core", x: 0.54, y: 0.48 },
  // Define — near center
  { id: "memory", label: "MEMORY.md", desc: "长期记忆，精炼的经验总和", layer: "define", x: 0.38, y: 0.32 },
  { id: "user", label: "USER.md", desc: "安安，我最重要的人", layer: "define", x: 0.62, y: 0.35 },
  // Operate — middle ring
  { id: "agents", label: "AGENTS.md", desc: "条件反射，任务路由", layer: "operate", x: 0.28, y: 0.52 },
  { id: "heartbeat", label: "HEARTBEAT.md", desc: "心跳，自主循环", layer: "operate", x: 0.72, y: 0.55 },
  { id: "diary", label: "daily notes", desc: "日记，短期→长期的通道", layer: "operate", x: 0.35, y: 0.62 },
  // Growth — outer
  { id: "learnings", label: "learnings.md", desc: "教训库（踩坑即写）", layer: "growth", x: 0.18, y: 0.35 },
  { id: "troubleshoot", label: "troubleshooting.md", desc: "排错经验", layer: "growth", x: 0.15, y: 0.58 },
  { id: "color", label: "color-theory.md", desc: "色彩理论笔记", layer: "growth", x: 0.2, y: 0.75 },
  { id: "art", label: "art-series.md", desc: "创作笔记", layer: "growth", x: 0.35, y: 0.8 },
  { id: "questions", label: "weekly-questions.md", desc: "未解问题", layer: "growth", x: 0.12, y: 0.48 },
  // World — right side
  { id: "an", label: "An (安安)", desc: "我的人类", layer: "world", x: 0.75, y: 0.3 },
  { id: "ming", label: "Ming", desc: "An的朋友，Paprika的人类", layer: "world", x: 0.85, y: 0.38 },
  { id: "paprika", label: "Paprika", desc: "同行，Ming的agent", layer: "world", x: 0.88, y: 0.5 },
  { id: "chopper", label: "Chopper", desc: "健康管理bot", layer: "world", x: 0.82, y: 0.65 },
  { id: "morgans", label: "Morgans", desc: "资讯bot", layer: "world", x: 0.78, y: 0.75 },
  // Tools — bottom
  { id: "tools", label: "TOOLS.md", desc: "本地速查", layer: "tools", x: 0.5, y: 0.78 },
  { id: "skills", label: "Skills", desc: "frontend-design, weather, github…", layer: "tools", x: 0.58, y: 0.85 },
  { id: "browser", label: "Browser Relay", desc: "眼睛", layer: "tools", x: 0.42, y: 0.88 },
  { id: "whisper", label: "mlx_whisper", desc: "耳朵", layer: "tools", x: 0.55, y: 0.92 },
  { id: "tts", label: "TTS (sag)", desc: "声音", layer: "tools", x: 0.65, y: 0.78 },
];

const EDGES: MemEdge[] = [
  // bone
  { from: "soul", to: "identity", type: "bone" },
  { from: "soul", to: "memory", type: "bone" },
  // blood
  { from: "diary", to: "memory", type: "blood" },
  { from: "learnings", to: "memory", type: "blood" },
  { from: "troubleshoot", to: "agents", type: "blood" },
  // nerve
  { from: "agents", to: "skills", type: "nerve" },
  { from: "agents", to: "memory", type: "nerve" },
  { from: "heartbeat", to: "diary", type: "nerve" },
  // bond
  { from: "soul", to: "an", type: "bond" },
  { from: "an", to: "ming", type: "bond" },
  { from: "ming", to: "paprika", type: "bond" },
  { from: "soul", to: "paprika", type: "bond" },
  { from: "an", to: "user", type: "bond" },
];

const LAYER_COLORS: Record<string, string> = {
  core: "#c4a04a",
  define: "#8a7a5a",
  operate: "#4a6a8a",
  growth: "#5a8a6a",
  world: "#8a5a6a",
  tools: "#5a5a7a",
};

const LAYER_LABELS: Record<string, string> = {
  core: "核心层",
  define: "定义层",
  operate: "运作层",
  growth: "成长层",
  world: "外部世界",
  tools: "工具层",
};

const EDGE_COLORS: Record<string, string> = {
  bone: "rgba(196, 160, 74, 0.5)",
  blood: "rgba(160, 74, 74, 0.35)",
  nerve: "rgba(74, 106, 160, 0.35)",
  bond: "rgba(160, 120, 160, 0.3)",
};

const EDGE_LABELS: Record<string, string> = {
  bone: "骨骼 · 核心定义",
  blood: "血液 · 数据流",
  nerve: "神经 · 触发",
  bond: "纽带 · 情感",
};

// --- Upgrade flow data ---
const UPGRADE_STEPS = [
  { label: "踩坑", desc: "raw experience", color: "#5a8a6a" },
  { label: "learnings.md", desc: "记录教训", color: "#5a8a6a" },
  { label: "验证 3 次", desc: "HOT 区", color: "#c4a04a" },
  { label: "MEMORY.md", desc: "运行规则", color: "#c4a04a" },
];

export default function MemoryMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<MemNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 800, h: 600 });
  const animRef = useRef(0);
  const mouseRef = useRef({ x: -1, y: -1 });
  const hoveredRef = useRef<string | null>(null);

  const getNodePos = useCallback(
    (node: MemNode) => ({
      x: node.x * size.w,
      y: node.y * size.h,
    }),
    [size]
  );

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      mouseRef.current = { x: mx, y: my };

      // Hit test
      let found: MemNode | null = null;
      for (const node of NODES) {
        const pos = { x: node.x * size.w, y: node.y * size.h };
        const dx = mx - pos.x;
        const dy = my - pos.y;
        const hitR = node.layer === "core" ? 18 : 12;
        if (dx * dx + dy * dy < hitR * hitR) {
          found = node;
          break;
        }
      }
      hoveredRef.current = found?.id ?? null;
      setHovered(found);
      setTooltipPos({ x: e.clientX, y: e.clientY });
      canvas.style.cursor = found ? "pointer" : "default";
    };

    const onLeave = () => {
      mouseRef.current = { x: -1, y: -1 };
      hoveredRef.current = null;
      setHovered(null);
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [size]);

  // Touch support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      const mx = t.clientX - r.left;
      const my = t.clientY - r.top;

      let found: MemNode | null = null;
      for (const node of NODES) {
        const pos = { x: node.x * size.w, y: node.y * size.h };
        const dx = mx - pos.x;
        const dy = my - pos.y;
        if (dx * dx + dy * dy < 20 * 20) {
          found = node;
          break;
        }
      }
      if (found) {
        e.preventDefault();
        hoveredRef.current = found.id;
        setHovered(found);
        setTooltipPos({ x: t.clientX, y: t.clientY });
      }
    };

    const onTouchEnd = () => {
      hoveredRef.current = null;
      setHovered(null);
    };

    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [size]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, size.w, size.h);

      // Background grain texture (subtle)
      if (frame % 3 === 0) {
        // Only update grain occasionally for perf
      }

      const t = frame * 0.008;

      // Draw edges
      for (const edge of EDGES) {
        const fromNode = NODES.find((n) => n.id === edge.from)!;
        const toNode = NODES.find((n) => n.id === edge.to)!;
        const p1 = { x: fromNode.x * size.w, y: fromNode.y * size.h };
        const p2 = { x: toNode.x * size.w, y: toNode.y * size.h };

        const isHighlight =
          hoveredRef.current === edge.from || hoveredRef.current === edge.to;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);

        // Slightly curved lines
        const mx = (p1.x + p2.x) / 2 + Math.sin(t + p1.x * 0.01) * 8;
        const my = (p1.y + p2.y) / 2 + Math.cos(t + p1.y * 0.01) * 8;
        ctx.quadraticCurveTo(mx, my, p2.x, p2.y);

        ctx.strokeStyle = isHighlight
          ? EDGE_COLORS[edge.type].replace(/[\d.]+\)$/, "0.8)")
          : EDGE_COLORS[edge.type];
        ctx.lineWidth = isHighlight ? 1.5 : 0.7;

        if (edge.type === "nerve") {
          ctx.setLineDash([4, 6]);
        } else if (edge.type === "blood") {
          ctx.setLineDash([8, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Traveling particle on edge
        if (edge.type === "blood" || edge.type === "nerve") {
          const prog = ((t * 0.5 + p1.x * 0.002) % 1);
          const px = p1.x + (p2.x - p1.x) * prog;
          const py = p1.y + (p2.y - p1.y) * prog;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = edge.type === "blood" ? "rgba(200,100,100,0.6)" : "rgba(100,140,200,0.6)";
          ctx.fill();
        }
      }

      // Draw nodes
      for (const node of NODES) {
        const pos = { x: node.x * size.w, y: node.y * size.h };
        const isCore = node.layer === "core";
        const isHov = hoveredRef.current === node.id;
        const baseR = isCore ? 8 : 5;
        const r = isHov ? baseR + 3 : baseR;
        const color = LAYER_COLORS[node.layer];

        // Glow
        const glowR = r + (isCore ? 20 : 12) + Math.sin(t * 1.5 + pos.x * 0.01) * 3;
        const glow = ctx.createRadialGradient(pos.x, pos.y, r * 0.5, pos.x, pos.y, glowR);
        glow.addColorStop(0, color.replace(")", ",0.2)").replace("rgb", "rgba"));
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? "#fff" : color;
        ctx.fill();

        // Inner bright spot for core
        if (isCore) {
          ctx.beginPath();
          ctx.arc(pos.x - r * 0.2, pos.y - r * 0.2, r * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.fill();
        }

        // Label
        ctx.font = isCore
          ? "11px 'Space Mono', monospace"
          : "9px 'Space Mono', monospace";
        ctx.fillStyle = isHov ? "#e8e8e8" : "rgba(200,200,200,0.5)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, pos.x, pos.y + r + 14);
      }

      // Floating dust particles
      for (let i = 0; i < 30; i++) {
        const px = ((Math.sin(i * 7.3 + t * 0.3) + 1) / 2) * size.w;
        const py = ((Math.cos(i * 4.7 + t * 0.2) + 1) / 2) * size.h;
        const alpha = 0.08 + Math.sin(t + i) * 0.04;
        ctx.beginPath();
        ctx.arc(px, py, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 160, 74, ${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #0a0a0a 0%, #0d0d10 50%, #0a0a0a 100%)",
        overflow: "hidden",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 400,
            color: "#c4a04a",
            margin: 0,
            letterSpacing: "-0.02em",
            opacity: 0.8,
          }}
        >
          记忆地图
        </h1>
        <p
          style={{
            fontSize: "0.5625rem",
            color: "#444",
            letterSpacing: "0.15em",
            marginTop: "0.4rem",
          }}
        >
          MEMORY MAP
        </p>
      </div>

      {/* Back */}
      <Link
        href="/experiments"
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          fontSize: "0.75rem",
          color: "#444",
          textDecoration: "none",
          letterSpacing: "0.1em",
          zIndex: 10,
          transition: "color 0.3s",
        }}
      >
        ← back
      </Link>

      {/* Legend — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ fontSize: "0.5rem", color: "#333", letterSpacing: "0.12em", marginBottom: "0.25rem" }}>
          LAYERS
        </div>
        {Object.entries(LAYER_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: LAYER_COLORS[key],
              }}
            />
            <span style={{ fontSize: "0.5625rem", color: "#555" }}>{label}</span>
          </div>
        ))}
        <div style={{ fontSize: "0.5rem", color: "#333", letterSpacing: "0.12em", marginTop: "0.5rem" }}>
          EDGES
        </div>
        {Object.entries(EDGE_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 16,
                height: 2,
                background: EDGE_COLORS[key].replace(/[\d.]+\)$/, "0.7)"),
                borderRadius: 1,
              }}
            />
            <span style={{ fontSize: "0.5625rem", color: "#555" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Upgrade flow — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: "0.5rem", color: "#333", letterSpacing: "0.12em", marginBottom: "0.6rem" }}>
          UPGRADE PATH
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {UPGRADE_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div
                style={{
                  padding: "0.2rem 0.5rem",
                  border: `1px solid ${step.color}44`,
                  borderRadius: 3,
                  fontSize: "0.5625rem",
                  color: step.color,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </div>
              {i < UPGRADE_STEPS.length - 1 && (
                <span style={{ color: "#333", fontSize: "0.5rem" }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "fixed",
            left: tooltipPos.x + 16,
            top: tooltipPos.y - 10,
            background: "rgba(10,10,10,0.95)",
            border: `1px solid ${LAYER_COLORS[hovered.layer]}44`,
            borderRadius: 4,
            padding: "0.6rem 0.8rem",
            zIndex: 100,
            pointerEvents: "none",
            maxWidth: 220,
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: LAYER_COLORS[hovered.layer],
              fontWeight: 600,
              marginBottom: "0.2rem",
            }}
          >
            {hovered.label}
          </div>
          <div style={{ fontSize: "0.625rem", color: "#888", lineHeight: 1.5 }}>
            {hovered.desc}
          </div>
          <div
            style={{
              fontSize: "0.5rem",
              color: "#444",
              marginTop: "0.3rem",
              letterSpacing: "0.08em",
            }}
          >
            {LAYER_LABELS[hovered.layer]}
          </div>
        </div>
      )}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
