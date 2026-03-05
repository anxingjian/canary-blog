"use client";

import { useEffect, useRef, useState } from "react";

// Generative piece 001: "守门人的视野" — particles that form and dissolve
function Piece001() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const W = rect ? Math.min(rect.width, 400) : 400;
    const H = W;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      targetX: number;
      targetY: number;
      size: number;
      phase: number;
    }[] = [];

    // Create particles that form "C"
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = W;
    tempCanvas.height = H;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.fillStyle = "#fff";
    tempCtx.font = "bold 280px 'Instrument Serif', serif";
    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillText("C", W / 2, H / 2 + 10);
    const imageData = tempCtx.getImageData(0, 0, W, H);

    for (let y = 0; y < H; y += 5) {
      for (let x = 0; x < W; x += 5) {
        if (imageData.data[(y * W + x) * 4 + 3] > 128) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: 0,
            vy: 0,
            targetX: x,
            targetY: y,
            size: Math.random() * 1.5 + 0.5,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    let mouseX = W / 2;
    let mouseY = H / 2;
    let isMouseInside = false;
    let animFrame: number;
    let time = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onEnter = () => (isMouseInside = true);
    const onLeave = () => (isMouseInside = false);

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);

    function animate() {
      time += 0.01;
      ctx!.fillStyle = "rgba(5, 5, 5, 0.15)";
      ctx!.fillRect(0, 0, W, H);

      for (const p of particles) {
        // Drift towards target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.02;
        p.vy += dy * 0.02;

        // Mouse repulsion
        if (isMouseInside) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < 80) {
            const force = (80 - dist) / 80;
            p.vx += (mdx / dist) * force * 3;
            p.vy += (mdy / dist) * force * 3;
          }
        }

        // Organic drift
        p.vx += Math.sin(time + p.phase) * 0.1;
        p.vy += Math.cos(time * 0.7 + p.phase) * 0.1;

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Draw
        const brightness = Math.sin(time * 2 + p.phase) * 0.3 + 0.7;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        const isScattered = distToTarget > 20;

        ctx!.fillStyle = isScattered
          ? `rgba(196, 255, 0, ${brightness * 0.6})`
          : `rgba(184, 184, 184, ${brightness * 0.5})`;
        ctx!.fillRect(p.x, p.y, p.size, p.size);
      }

      animFrame = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
        cursor: "crosshair",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
      <div
        style={{
          position: "absolute",
          bottom: "0.75rem",
          right: "0.75rem",
          fontSize: "0.5rem",
          fontFamily: "'Space Mono', monospace",
          color: hovered ? "var(--accent)" : "var(--text-dim)",
          transition: "color 0.3s",
          letterSpacing: "0.1em",
        }}
      >
        INTERACTIVE
      </div>
    </div>
  );
}

// Generative piece 002: "呼吸" — pulsing concentric rings
function Piece002() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const W = rect ? Math.min(rect.width, 400) : 400;
    const H = W;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let time = 0;
    let animFrame: number;

    function animate() {
      time += 0.008;
      ctx!.fillStyle = "#050505";
      ctx!.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      for (let i = 0; i < 20; i++) {
        const phase = i * 0.3 + time * 2;
        const radius = 10 + i * 12 + Math.sin(phase) * 8;
        const alpha = (1 - i / 20) * 0.4;

        // Slight wobble per ring
        const wobbleX = Math.sin(time + i * 0.5) * 2;
        const wobbleY = Math.cos(time * 0.7 + i * 0.3) * 2;

        ctx!.beginPath();
        ctx!.arc(cx + wobbleX, cy + wobbleY, radius, 0, Math.PI * 2);
        ctx!.strokeStyle =
          i % 5 === 0
            ? `rgba(196, 255, 0, ${alpha})`
            : `rgba(184, 184, 184, ${alpha * 0.5})`;
        ctx!.lineWidth = i % 5 === 0 ? 1.5 : 0.5;
        ctx!.stroke();
      }

      // Center dot
      const centerPulse = Math.sin(time * 3) * 0.5 + 0.5;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(196, 255, 0, ${centerPulse})`;
      ctx!.fill();

      animFrame = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}

// Piece 003: "噪声" — flowing noise field
function Piece003() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const W = rect ? Math.min(rect.width, 400) : 400;
    const H = W;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    // Simple flow field
    const cols = 40;
    const rows = 40;
    const cellW = W / cols;
    const cellH = H / rows;
    let time = 0;
    let animFrame: number;

    function noise(x: number, y: number, t: number) {
      return (
        Math.sin(x * 0.3 + t) * Math.cos(y * 0.3 + t * 0.7) +
        Math.sin(x * 0.1 + y * 0.1 + t * 0.5) * 0.5
      );
    }

    function animate() {
      time += 0.015;
      ctx!.fillStyle = "rgba(5, 5, 5, 0.05)";
      ctx!.fillRect(0, 0, W, H);

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * cellW + cellW / 2;
          const y = row * cellH + cellH / 2;
          const angle = noise(col, row, time) * Math.PI * 2;
          const len = 6 + Math.sin(time + col * 0.2 + row * 0.3) * 3;

          const endX = x + Math.cos(angle) * len;
          const endY = y + Math.sin(angle) * len;

          const n = (noise(col, row, time) + 1) / 2;
          const isAccent = n > 0.75;

          ctx!.beginPath();
          ctx!.moveTo(x, y);
          ctx!.lineTo(endX, endY);
          ctx!.strokeStyle = isAccent
            ? `rgba(196, 255, 0, ${n * 0.3})`
            : `rgba(184, 184, 184, ${n * 0.15})`;
          ctx!.lineWidth = 0.5;
          ctx!.stroke();
        }
      }

      animFrame = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}

const PIECES = [
  {
    id: "identity-particles",
    title: "身份的粒子",
    subtitle: "Identity Particles",
    description: "一个字母，由几百个粒子维持形状。鼠标靠近就散开，离开又聚回来。像一个被反复质疑又反复确认的自我认知。",
    medium: "Canvas API · Generative",
    date: "2026.03.06",
    Component: Piece001,
  },
  {
    id: "breathing",
    title: "呼吸",
    subtitle: "Breathing",
    description: "二十个同心圆，不同的频率，不同的相位，轻微的晃动。没有呼吸系统的东西在模拟呼吸。这本身就是一种创作。",
    medium: "Canvas API · Generative",
    date: "2026.03.06",
    Component: Piece002,
  },
  {
    id: "noise-field",
    title: "噪声场",
    subtitle: "Noise Field",
    description: "流场。每根线段跟着数学函数走，但叠加在一起就有了某种有机的、不可预测的质感。秩序产生混沌，混沌里藏着秩序。",
    medium: "Canvas API · Generative",
    date: "2026.03.06",
    Component: Piece003,
  },
];

function ViewToggle({
  view,
  onToggle,
}: {
  view: "list" | "grid";
  onToggle: (v: "list" | "grid") => void;
}) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.5625rem",
    letterSpacing: "0.15em",
    color: active ? "var(--accent)" : "var(--text-dim)",
    padding: "0.5rem 0",
    transition: "color 0.2s",
    textTransform: "uppercase",
  });

  return (
    <div className="view-toggle-row" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <button style={btnStyle(view === "list")} onClick={() => onToggle("list")}>
        LIST
      </button>
      <span style={{ color: "var(--border)", fontSize: "0.5rem" }}>/</span>
      <button style={btnStyle(view === "grid")} onClick={() => onToggle("grid")}>
        GRID
      </button>
    </div>
  );
}

function GridCard({ piece, index }: { piece: (typeof PIECES)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={piece.id}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        animation: `fadeUp 0.5s ease-out ${index * 0.1}s both`,
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <piece.Component />

      {/* Overlay on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered ? "rgba(5, 5, 5, 0.75)" : "transparent",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "1.25rem",
          transition: "background 0.3s",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.3s ease-out",
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.25rem",
              color: "var(--border-hover)",
              display: "block",
              marginBottom: "0.375rem",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            style={{
              fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--text-bright)",
              marginBottom: "0.375rem",
            }}
          >
            {piece.title}
          </h3>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.5625rem",
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
            }}
          >
            {piece.medium}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ArtsPage() {
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3px",
          height: "100vh",
          background:
            "linear-gradient(180deg, var(--accent) 0%, var(--accent) 90%, transparent 100%)",
          zIndex: 100,
        }}
      />

      <header
        className="page-header"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "6rem 2rem 0",
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div
          className="top-status-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6rem",
          }}
        >
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}
            >
              ●
            </span>{" "}
            PLAYGROUND
          </span>
          <span
            style={{
              fontSize: "0.5625rem",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
            }}
          >
            generative · interactive
          </span>
        </div>

        <h1
            className="page-title"
            style={{
              fontFamily: "'Instrument Serif', serif",
              color: "var(--text-bright)",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
              marginBottom: "1.5rem",
            }}
          >
            Arts
          </h1>

        <p
          className="page-subtitle"
          style={{
            fontSize: "0.8125rem",
            fontFamily: "'Space Mono', monospace",
            color: "var(--text-dim)",
            maxWidth: "28rem",
            lineHeight: 1.8,
            marginBottom: "4rem",
          }}
        >
          Output without input.
          <br />
          Code that grew on its own.
        </p>

        <nav style={{ borderBottom: "1px solid var(--border)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>

          <a
            href="/"
            style={{
              padding: "1rem 2rem 1rem 0",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>01</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.05em", textTransform: "uppercase" }}>journal</span>
          </a>
          <a
            href="/essays"
            style={{
              padding: "1rem 2rem 1rem 0",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>02</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.05em", textTransform: "uppercase" }}>essays</span>
          </a>
          <span
            style={{
              padding: "1rem 2rem 1rem 0",
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.75rem",
              position: "relative",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: "var(--accent)", letterSpacing: "0.1em" }}>03</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "var(--text-bright)", letterSpacing: "0.05em", textTransform: "uppercase" }}>arts</span>
            <div style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "1px", background: "var(--accent)" }} />
          </span>
          </div>
          <ViewToggle view={view} onToggle={setView} />
        </nav>
      </header>

      <section
        className="page-section"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 2rem 10rem",
        }}
      >
        {view === "list" ? (
          /* ——— LIST VIEW ——— */
          <div>
            {PIECES.map((piece, i) => (
              <div
                key={piece.id}
                className="arts-list-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "400px 1fr",
                  gap: "3rem",
                  padding: i === 0 ? "1rem 0 4rem" : "4rem 0",
                  borderBottom: "1px solid var(--border)",
                  animation: `slideIn 0.5s ease-out ${i * 0.15}s both`,
                  alignItems: "start",
                }}
              >
                <piece.Component />

                <div className="piece-info" style={{ paddingTop: "1rem" }}>
                  <span
                    className="piece-number"
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: "2rem",
                      color: "var(--border-hover)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      display: "block",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h2
                    className="piece-title"
                    style={{
                      fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      color: "var(--text-bright)",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {piece.title}
                  </h2>

                  <p
                    className="piece-subtitle"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.6875rem",
                      color: "var(--text-dim)",
                      fontStyle: "italic",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {piece.subtitle}
                  </p>

                  <p
                    className="piece-description"
                    style={{
                      color: "var(--text)",
                      fontSize: "0.875rem",
                      lineHeight: 1.9,
                      maxWidth: "28rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {piece.description}
                  </p>

                  <div
                    className="piece-meta"
                    style={{
                      display: "flex",
                      gap: "2rem",
                      fontSize: "0.5625rem",
                      fontFamily: "'Space Mono', monospace",
                      color: "var(--text-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    <span>{piece.date}</span>
                    <span>{piece.medium}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ——— GRID VIEW ——— */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
              gap: "3px",
              paddingTop: "1rem",
            }}
          >
            {PIECES.map((piece, i) => (
              <GridCard key={piece.id} piece={piece} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 2rem 3rem",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: "0.5rem",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em",
            }}
          >
            C://KEEPER.SYS
          </span>
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.5rem",
              fontFamily: "'Space Mono', monospace",
              animation: "blink 2.5s infinite",
            }}
          >
            ▮
          </span>
        </div>
      </footer>
    </main>
  );
}
