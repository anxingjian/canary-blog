"use client";

import { useState } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/" },
];

export default function Gate({ onEnter }: { onEnter: (href: string) => void }) {
  const [peeking, setPeeking] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  const handleEntryClick = (href: string) => {
    setEntered(true);
    setTimeout(() => onEnter(href), 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020202",
        zIndex: 1000,
        overflow: "hidden",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: entered ? "none" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={() => { if (peeking) { setPeeking(false); setHoveredEntry(null); } }}
    >
      {/* SYS indicator */}
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "2.5rem",
          color: "#1a1a1a",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5rem",
          letterSpacing: "0.3em",
          zIndex: 20,
        }}
      >
        <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
        SYS.ONLINE
      </div>

      {/* Interactive zone — covers door + floor projection */}
      <div
        onMouseEnter={() => setPeeking(true)}
        onMouseLeave={() => { setPeeking(false); setHoveredEntry(null); }}
        onClick={(e) => { if (!peeking) { e.stopPropagation(); setPeeking(true); } }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        {/* Door assembly */}
        <div
          style={{
            position: "relative",
            width: "min(260px, 55vw)",
            height: "min(460px, 65vh)",
          }}
        >
          {/* ===== Light behind door ===== */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: peeking
                ? "linear-gradient(180deg, rgba(196,255,0,0.10) 0%, rgba(196,255,0,0.06) 40%, rgba(196,255,0,0.12) 100%)"
                : "linear-gradient(180deg, rgba(196,255,0,0.02) 0%, rgba(196,255,0,0.01) 40%, rgba(196,255,0,0.03) 100%)",
              transition: "background 0.8s",
              zIndex: 1,
            }}
          />

          {/* ===== DOOR — opens INWARD (rotateY positive = swings into the room) ===== */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              // Default: slightly ajar (small positive rotateY = slightly open inward)
              // Hover: opens more inward
              transform: peeking
                ? "perspective(800px) rotateY(50deg)"
                : "perspective(800px) rotateY(8deg)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 3,
            }}
          >
            {/* Door surface — flat, light/shadow via gradients */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: peeking
                  ? "linear-gradient(90deg, #1a1a1a 0%, #141414 40%, #0e0e0e 100%)"
                  : "linear-gradient(90deg, #0f0f0f 0%, #0d0d0d 50%, #0b0b0b 100%)",
                transition: "background 0.8s",
              }}
            />

            {/* Light edge on hinge side (light leaking from behind) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: peeking ? "2px" : "1px",
                background: peeking
                  ? "rgba(196,255,0,0.15)"
                  : "rgba(196,255,0,0.04)",
                transition: "all 0.8s",
              }}
            />

            {/* CANARY nameplate */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(0.55rem, 1.2vw, 0.7rem)",
                fontWeight: 700,
                color: peeking ? "#222" : "#1a1a1a",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                transition: "color 0.8s",
              }}
            >
              CANARY
            </div>
          </div>

          {/* ===== Frame ===== */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2px solid #181818",
              pointerEvents: "none",
              zIndex: 4,
            }}
          />

          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              background: peeking
                ? "radial-gradient(ellipse, rgba(196,255,0,0.04) 0%, transparent 60%)"
                : "none",
              transition: "background 0.8s",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ===== FLOOR LIGHT with projected entries ===== */}
        <div
          style={{
            width: peeking ? "min(450px, 85vw)" : "min(180px, 38vw)",
            height: peeking ? "min(200px, 25vh)" : "min(60px, 9vh)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(196,255,0,0.10) 0%,
                  rgba(196,255,0,0.05) 40%,
                  rgba(196,255,0,0.01) 80%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(196,255,0,0.03) 0%,
                  rgba(196,255,0,0.01) 50%,
                  transparent 100%
                )`,
            clipPath: peeking
              ? "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)"
              : "polygon(35% 0%, 65% 0%, 80% 100%, 20% 100%)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem",
            paddingTop: "1rem",
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
                  ? "clamp(1rem, 2.5vw, 1.4rem)"
                  : i === 1
                  ? "clamp(1.4rem, 3.5vw, 2rem)"
                  : "clamp(1.8rem, 4.5vw, 2.8rem)",
                fontWeight: 600,
                color: hoveredEntry === i
                  ? "rgba(196,255,0,0.95)"
                  : `rgba(196,255,0,${0.15 + i * 0.08})`,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transform: `perspective(400px) rotateX(50deg) scaleY(${1.3 + i * 0.15})`,
                transformOrigin: "center top",
                textShadow: hoveredEntry === i
                  ? "0 0 30px rgba(196,255,0,0.4)"
                  : "none",
                opacity: peeking ? 1 : 0,
                transition: "color 0.3s, opacity 0.5s 0.3s, text-shadow 0.3s",
              }}
            >
              {entry.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
