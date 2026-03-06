"use client";

import { useState, useEffect, useRef } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/journal" },
];

/* SVG noise filter as data URI for the static/snow effect */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function Gate({ onEnter }: { onEnter: (href: string) => void }) {
  const [peeking, setPeeking] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const noiseRef = useRef<HTMLDivElement>(null);

  const handleEntryClick = (href: string) => {
    setEntered(true);
    setTimeout(() => onEnter(href), 600);
  };

  /* Animate noise by shifting background-position for a flickering TV static effect */
  useEffect(() => {
    if (peeking) return;
    let frame: number;
    const animate = () => {
      if (noiseRef.current) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        noiseRef.current.style.backgroundPosition = `${x}px ${y}px`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [peeking]);

  const entryWidths = ["56%", "72%", "90%"];
  const entryScaleX = [1.3, 1.5, 1.7];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        zIndex: 1000,
        overflow: "visible",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: entered ? "none" : "auto",
      }}
      onClick={() => { if (peeking) { setPeeking(false); setHoveredEntry(null); } }}
    >
      {/* SYS indicator */}
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "2.5rem",
          color: "#666",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5rem",
          letterSpacing: "0.3em",
          zIndex: 20,
        }}
      >
        <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
        SYS.ONLINE
      </div>

      {/* Footnote — top right */}
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          right: "2.5rem",
          color: "#444",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5625rem",
          letterSpacing: "0.15em",
          whiteSpace: "nowrap",
          zIndex: 20,
        }}
      >
        Canary · 守門人記錄
      </div>

      {/* Hover zone */}
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
        {/* Door frame area */}
        <div
          style={{
            position: "relative",
            width: "min(260px, 55vw)",
            height: "min(460px, 65vh)",
          }}
        >
          {/* Light behind door — white, only on opening side */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: peeking ? "45%" : "15%",
              background: peeking
                ? "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.75) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.08) 100%)",
              transition: "background 0.8s, width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 1,
            }}
          />

          {/* Noise / static overlay — only visible when door is closed */}
          <div
            ref={noiseRef}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: peeking ? "45%" : "15%",
              backgroundImage: NOISE_SVG,
              backgroundSize: "256px 256px",
              mixBlendMode: "overlay",
              opacity: peeking ? 0 : 0.6,
              transition: "opacity 0.8s, width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* DOOR */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              transform: peeking
                ? "perspective(800px) rotateY(25deg)"
                : "perspective(800px) rotateY(12deg)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              backfaceVisibility: "hidden",
              zIndex: 3,
            }}
          >
              {/* Door surface */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: peeking
                    ? "linear-gradient(90deg, #0d0d0d 0%, #0b0b0b 50%, #0a0a0a 100%)"
                    : "#0a0a0a",
                  transition: "background 0.8s",
                }}
              />

              {/* Light edge on hinge side */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: peeking ? "2px" : "1px",
                  background: peeking
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  transition: "all 0.8s",
                }}
              />

              {/* CANARY */}
              <div
                style={{
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
                }}
              >
                Canary
              </div>
          </div>
        </div>

        {/* FLOOR PROJECTION — white light */}
        <div
          style={{
            width: "min(500px, 105vw)",
            height: "min(180px, 22vh)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: "polygon(24% 0%, 76% 0%, 100% 100%, 0% 100%)",
              background: peeking
                ? `linear-gradient(180deg,
                    rgba(255,255,255,0.5) 0%,
                    rgba(255,255,255,0.2) 40%,
                    rgba(255,255,255,0.05) 80%,
                    transparent 100%
                  )`
                : `linear-gradient(180deg,
                    rgba(255,255,255,0.08) 0%,
                    rgba(255,255,255,0.03) 50%,
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
            }}
          >
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
                    : `rgba(30,30,30,${0.6 + i * 0.1})`,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  width: entryWidths[i],
                  textAlign: "center",
                  /* Trapezoid distortion: each word narrower at top, wider at bottom */
                  transform: `perspective(200px) rotateX(-8deg) scaleX(${entryScaleX[i]}) scaleY(${1.3 + i * 0.12})`,
                  transformOrigin: "center bottom",
                  marginTop: i === 0 ? "0" : i === 1 ? "-0.25rem" : "-0.3rem",
                  marginBottom: "0",
                  textShadow: hoveredEntry === i
                    ? "0 0 30px rgba(196,255,0,0.4)"
                    : "none",
                  opacity: peeking ? 1 : 0,
                  transition: "color 0.3s, opacity 0.6s 0.5s, text-shadow 0.3s",
                }}
              >
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glow — white */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: "min(350px, 65vw)",
          height: "min(550px, 75vh)",
          background: peeking
            ? "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 60%)",
          transition: "background 0.8s",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
