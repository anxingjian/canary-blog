"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/journal" },
];

/* Shared noise texture as offscreen canvas, reused by both light areas */
function useNoise() {
  const offscreen = useRef<HTMLCanvasElement | null>(null);
  const consumers = useRef<HTMLCanvasElement[]>([]);
  const frameRef = useRef<number>(0);
  const lastDraw = useRef<number>(0);

  const register = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas && !consumers.current.includes(canvas)) {
      consumers.current.push(canvas);
    }
  }, []);

  useEffect(() => {
    const oc = document.createElement("canvas");
    oc.width = 256;
    oc.height = 512;
    offscreen.current = oc;

    const draw = (time: number) => {
      if (time - lastDraw.current > 150) {
        const ctx = oc.getContext("2d");
        if (ctx) {
          const img = ctx.createImageData(256, 512);
          for (let i = 0; i < img.data.length; i += 4) {
            const v = Math.random() * 255;
            img.data[i] = img.data[i+1] = img.data[i+2] = v;
            img.data[i+3] = 25;
          }
          ctx.putImageData(img, 0, 0);
        }
        // Copy to all consumer canvases
        for (const c of consumers.current) {
          const cctx = c.getContext("2d");
          if (cctx) {
            c.width = c.offsetWidth || 256;
            c.height = c.offsetHeight || 512;
            cctx.drawImage(oc, 0, 0, c.width, c.height);
          }
        }
        lastDraw.current = time;
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return register;
}

export default function Gate({ onEnter }: { onEnter: (href: string) => void }) {
  const [peeking, setPeeking] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const registerNoise = useNoise();

  const handleEntryClick = (href: string) => {
    setEntered(true);
    setTimeout(() => onEnter(href), 600);
  };

  const entryWidths = ["56%", "72%", "90%"];

  const noiseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: peeking ? 0 : 0.5,
    transition: "opacity 0.8s",
    mixBlendMode: "overlay",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        zIndex: 1000,
        overflow: "hidden",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: entered ? "none" : "auto",
      }}
      onClick={() => { if (peeking) { setPeeking(false); setHoveredEntry(null); } }}
    >
      {/* SYS */}
      <div style={{
        position: "absolute", top: "2.5rem", left: "2.5rem",
        color: "#666", fontFamily: "'Space Mono', monospace",
        fontSize: "0.5rem", letterSpacing: "0.3em", zIndex: 20,
      }}>
        <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}SYS.ONLINE
      </div>

      {/* Footnote */}
      <div style={{
        position: "absolute", top: "2.5rem", right: "2.5rem",
        color: "#444", fontFamily: "'Space Mono', monospace",
        fontSize: "0.5625rem", letterSpacing: "0.15em", zIndex: 20,
      }}>
        Canary · 守門人記錄
      </div>

      {/* Main assembly */}
      <div
        onMouseEnter={() => setPeeking(true)}
        onMouseLeave={() => { setPeeking(false); setHoveredEntry(null); }}
        onClick={(e) => { if (!peeking) { e.stopPropagation(); setPeeking(true); } }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -45%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        {/* Door frame */}
        <div style={{
          position: "relative",
          width: "min(260px, 55vw)",
          height: "min(460px, 65vh)",
        }}>
          {/* LIGHT behind door — z1 */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: peeking
              ? "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.6) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.14) 100%)",
            transition: "background 0.8s",
            zIndex: 1,
            overflow: "hidden",
          }}>
            {/* Noise INSIDE the light — under door panel */}
            <canvas ref={registerNoise} style={noiseStyle} />
          </div>

          {/* DOOR PANEL — z3, covers the noise */}
          <div style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transform: peeking
              ? "perspective(800px) rotateY(25deg)"
              : "perspective(800px) rotateY(12deg)",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            backfaceVisibility: "hidden",
            background: "#0a0a0a",
            zIndex: 3,
          }}>
            <div style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              fontWeight: 400,
              color: peeking ? "#222" : "#555",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              transition: "color 0.8s",
            }}>
              Canary
            </div>
          </div>
        </div>

        {/* FLOOR PROJECTION */}
        <div style={{
          width: "min(500px, 105vw)",
          height: "min(180px, 22vh)",
        }}>
          <div style={{
            width: "100%",
            height: "100%",
            clipPath: "polygon(24% 0%, 76% 0%, 100% 100%, 0% 100%)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(255,255,255,0.6) 0%,
                  rgba(255,255,255,0.3) 40%,
                  rgba(255,255,255,0.08) 80%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(255,255,255,0.14) 0%,
                  rgba(255,255,255,0.06) 50%,
                  transparent 100%
                )`,
            transition: "background 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            paddingTop: "0.5rem",
            paddingBottom: "0.3rem",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Noise INSIDE the projection — clipped by clipPath */}
            <canvas ref={registerNoise} style={noiseStyle} />

            {ENTRIES.map((entry, i) => (
              <div
                key={entry.name}
                onClick={(e) => { e.stopPropagation(); handleEntryClick(entry.href); }}
                onMouseEnter={() => setHoveredEntry(i)}
                onMouseLeave={() => setHoveredEntry(null)}
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: i === 0
                    ? "clamp(1.2rem, 3vw, 1.6rem)"
                    : i === 1
                    ? "clamp(1.5rem, 3.5vw, 2.1rem)"
                    : "clamp(1.9rem, 4.5vw, 2.7rem)",
                  fontWeight: 400,
                  color: hoveredEntry === i
                    ? "rgba(196,255,0,0.95)"
                    : `rgba(30,30,30,${0.55 + i * 0.1})`,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  width: entryWidths[i],
                  textAlign: "center",
                  transform: `perspective(300px) rotateX(8deg) scaleY(${1.3 + i * 0.12})`,
                  transformOrigin: "center top",
                  marginTop: i === 0 ? "0" : "-0.25rem",
                  textShadow: hoveredEntry === i
                    ? "0 0 30px rgba(196,255,0,0.4)"
                    : "none",
                  opacity: peeking ? 1 : 0,
                  transition: "color 0.3s, opacity 0.6s 0.5s, text-shadow 0.3s",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        left: "50%", top: "45%",
        transform: "translate(-50%, -50%)",
        width: "min(350px, 65vw)",
        height: "min(550px, 75vh)",
        background: peeking
          ? "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 60%)"
          : "radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 60%)",
        transition: "background 0.8s",
        zIndex: 0,
        pointerEvents: "none",
      }} />
    </div>
  );
}
