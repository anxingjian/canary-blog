"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/journal" },
];

export default function Gate({ onEnter }: { onEnter: (href: string) => void }) {
  const [peeking, setPeeking] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const noise1Ref = useRef<HTMLCanvasElement>(null);
  const noise2Ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const lastDrawRef = useRef<number>(0);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const handleEntryClick = (href: string) => {
    setEntered(true);
    setTimeout(() => onEnter(href), 600);
  };

  /* Shared noise — slow refresh (150ms), fine grain, subtle alpha */
  useEffect(() => {
    const oc = document.createElement("canvas");
    oc.width = 256;
    oc.height = 512;
    offscreenRef.current = oc;

    const draw = (time: number) => {
      if (time - lastDrawRef.current > 150) {
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
        // Copy to both consumer canvases
        for (const ref of [noise1Ref, noise2Ref]) {
          const c = ref.current;
          if (c) {
            c.width = c.offsetWidth || 256;
            c.height = c.offsetHeight || 512;
            const cctx = c.getContext("2d");
            if (cctx) cctx.drawImage(oc, 0, 0, c.width, c.height);
          }
        }
        lastDrawRef.current = time;
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  /* Entry font sizes and letter-spacing to fill trapezoid width */
  const entryStyles = [
    { fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", letterSpacing: "0.6em" },
    { fontSize: "clamp(1.5rem, 3.2vw, 2.0rem)", letterSpacing: "0.5em" },
    { fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "0.4em" },
  ];

  const noiseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    mixBlendMode: "overlay",
    opacity: peeking ? 0 : 0.5,
    transition: "opacity 0.8s",
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
          {/* LIGHT — z1, inside door frame */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: peeking
              ? "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.6) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.12) 100%)",
            transition: "background 0.8s",
            zIndex: 1,
            overflow: "hidden",
          }}>
            <canvas ref={noise1Ref} style={noiseStyle} />
          </div>

          {/* DOOR — z3, covers light */}
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

        {/* FLOOR PROJECTION — brightness matches door bottom (0.12) */}
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
                  rgba(255,255,255,0.12) 0%,
                  rgba(255,255,255,0.05) 50%,
                  transparent 100%
                )`,
            transition: "background 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "0.5rem",
            paddingBottom: "0.3rem",
            position: "relative",
            overflow: "hidden",
          }}>
            <canvas ref={noise2Ref} style={noiseStyle} />

            {ENTRIES.map((entry, i) => (
              <div
                key={entry.name}
                onClick={(e) => { e.stopPropagation(); handleEntryClick(entry.href); }}
                onMouseEnter={() => setHoveredEntry(i)}
                onMouseLeave={() => setHoveredEntry(null)}
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: entryStyles[i].fontSize,
                  fontWeight: 400,
                  color: hoveredEntry === i
                    ? "rgba(196,255,0,0.95)"
                    : `rgba(30,30,30,${0.55 + i * 0.1})`,
                  letterSpacing: entryStyles[i].letterSpacing,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  marginTop: i === 0 ? "0.1rem" : "-0.05rem",
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
