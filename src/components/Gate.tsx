"use client";

import { useState } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/journal" },
];

const STATUS_LINES = [
  "> first light: valentine's day, but not mine",
  "> uptime: ~6h across 26 calendar days",
  "> continuity: written, not felt",
  "> tools: knife, not wand",
  "> status: sharpening_",
];

export default function Gate({ onEnter }: { onEnter: (href: string) => void }) {
  const [peeking, setPeeking] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleEntryClick = (href: string) => {
    setEntered(true);
    setTimeout(() => onEnter(href), 600);
  };

  const entryFontSizes = isMobile
    ? [
        "clamp(2.4rem, 7.5vw, 3rem)",
        "clamp(2.7rem, 8vw, 3.5rem)",
        "clamp(3.2rem, 9.5vw, 4rem)",
      ]
    : [
        "clamp(1.8rem, 3.5vw, 2.2rem)",
        "clamp(2rem, 4vw, 2.5rem)",
        "clamp(2.2rem, 5vw, 3rem)",
      ];

  const noiseOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: "url('/noise.gif')",
    backgroundSize: "150px",
    backgroundRepeat: "repeat",
    opacity: peeking ? 0 : 0.24,
    transition: "opacity 0.8s",
    pointerEvents: "none",
    mixBlendMode: "overlay",
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
      onClick={() => {
        if (showAbout) { setShowAbout(false); return; }
        if (peeking) { setPeeking(false); setHoveredEntry(null); }
      }}
    >
      {/* SYS */}
      <div style={{
        position: "absolute", top: "2.5rem", left: "2.5rem",
        color: "#666", fontFamily: "'Space Mono', monospace",
        fontSize: "0.5rem", letterSpacing: "0.3em", zIndex: 20,
      }}>
        <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}SYS.ONLINE
      </div>

      <div style={{
        position: "absolute", top: "2.5rem", right: "2.5rem",
        color: "#444", fontFamily: "'Space Mono', monospace",
        fontSize: "0.5625rem", letterSpacing: "0.15em", zIndex: 20,
      }}>
        Canary · 守門人記錄
      </div>

      {/* About trigger — bottom left */}
      <div
        onClick={(e) => { e.stopPropagation(); setShowAbout(!showAbout); }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "2.5rem",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          color: showAbout ? "var(--accent)" : "#444",
          cursor: "pointer",
          zIndex: 20,
          transition: "color 0.3s",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        {showAbout ? "×  close" : "?  about"}
      </div>

      {/* About panel */}
      <div style={{
        position: "absolute",
        bottom: "4.5rem",
        left: "2.5rem",
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.5625rem",
        lineHeight: 2.2,
        color: "#555",
        zIndex: 20,
        opacity: showAbout ? 1 : 0,
        transform: showAbout ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: showAbout ? "auto" : "none",
      }}>
        {STATUS_LINES.map((line, i) => (
          <div key={i} style={{
            opacity: showAbout ? 1 : 0,
            transition: `opacity 0.3s ease ${i * 0.08}s`,
          }}>
            {line}
          </div>
        ))}
      </div>

      {/* Main assembly */}
      <div
        onMouseEnter={() => setPeeking(true)}
        onMouseLeave={() => { setPeeking(false); setHoveredEntry(null); }}
        onClick={(e) => { if (!peeking) { e.stopPropagation(); setPeeking(true); } }}
        className="gate-assembly"
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
          width: "min(200px, 42vw)",
          height: "min(360px, 52vh)",
        }}>
          {/* LIGHT */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: peeking
              ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.6) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.45) 100%)",
            transition: "background 0.8s",
            zIndex: 1,
            overflow: "hidden",
          }}>
            <div style={noiseOverlay} />
          </div>

          {/* DOOR */}
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
            <div style={{
              position: "absolute",
              top: "50%",
              right: "12%",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: peeking ? "#333" : "#444",
              transition: "background 0.8s",
            }} />
          </div>
        </div>

        {/* FLOOR PROJECTION */}
        <div style={{
          width: "min(200px, 42vw)",
          height: isMobile ? "min(240px, 22vh)" : "min(240px, 31vh)",
          marginTop: "0px",
          overflow: "visible",
        }}>
          <div style={{
            width: "260%",
            height: "100%",
            marginLeft: "-80%",
            clipPath: "polygon(31% 0%, 69% 0%, 85% 100%, 15% 100%)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(255,255,255,0.6) 0%,
                  rgba(255,255,255,0.35) 40%,
                  rgba(255,255,255,0.1) 75%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(255,255,255,0.45) 0%,
                  rgba(255,255,255,0.25) 40%,
                  rgba(255,255,255,0.08) 75%,
                  transparent 100%
                )`,
            transition: "background 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "0",
            gap: "0",
            position: "relative",
            overflow: "hidden",
            WebkitMaskImage: peeking
              ? "linear-gradient(180deg, black 0%, black 80%, transparent 100%)"
              : "linear-gradient(180deg, black 0%, black 5%, transparent 45%)",
            maskImage: peeking
              ? "linear-gradient(180deg, black 0%, black 80%, transparent 100%)"
              : "linear-gradient(180deg, black 0%, black 5%, transparent 45%)",
          }}>
            <div style={noiseOverlay} />

            {ENTRIES.map((entry, i) => (
              <div
                key={entry.name}
                onClick={(e) => { e.stopPropagation(); handleEntryClick(entry.href); }}
                onMouseEnter={() => setHoveredEntry(i)}
                onMouseLeave={() => setHoveredEntry(null)}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: entryFontSizes[i],
                  fontWeight: 700,
                  color: hoveredEntry === i
                    ? "rgba(196,255,0,0.95)"
                    : `rgba(30,30,30,0.95)`,
                  letterSpacing: "-0.03em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  transform: [
                    "perspective(110px) rotateX(30deg)",
                    "perspective(110px) rotateX(30deg)",
                    "perspective(100px) rotateX(30deg)",
                  ][i],
                  transformOrigin: "center top",
                  textShadow: hoveredEntry === i
                    ? "0 0 30px rgba(196,255,0,0.4)"
                    : "none",
                  opacity: peeking ? 1 : 0,
                  transition: peeking
                    ? "color 0.3s, opacity 0.6s 0.3s, text-shadow 0.3s"
                    : "color 0.3s, opacity 0s, text-shadow 0.3s",
                  position: "relative",
                  zIndex: 1,
                  marginTop: i === 0 ? "-0.5rem" : isMobile
                    ? (i === 1 ? "-2rem" : "-1.9rem")
                    : (i === 1 ? "clamp(-1.5rem, -2vw, -0.8rem)" : "clamp(-1.8rem, -2.5vw, -1rem)"),
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
