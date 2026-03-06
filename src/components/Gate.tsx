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

      {/* Interactive zone — covers door + floor projection area */}
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

          {/* ===== DOOR — single flat panel, light/shadow via color blocks ===== */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              transform: peeking
                ? "perspective(800px) rotateY(-42deg)"
                : "perspective(800px) rotateY(-6deg)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 3,
            }}
          >
            {/* Door base — flat, no texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: peeking
                  ? "linear-gradient(90deg, #0e0e0e 0%, #151515 30%, #1a1a1a 100%)"
                  : "#0e0e0e",
                transition: "background 0.8s",
              }}
            />

            {/* Light edge on the opening side */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: peeking ? "3px" : "1px",
                background: peeking
                  ? "rgba(196,255,0,0.2)"
                  : "rgba(196,255,0,0.05)",
                transition: "all 0.8s",
              }}
            />

            {/* Shadow gradient on hinge side */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "30%",
                background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* CANARY nameplate — Space Mono, tight, dark */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(0.55rem, 1.2vw, 0.7rem)",
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              CANARY
            </div>

            {/* Door handle — simple line */}
            <div
              style={{
                position: "absolute",
                right: "14%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "3px",
                height: "28px",
                background: peeking ? "#333" : "#1a1a1a",
                borderRadius: "1.5px",
                transition: "background 0.5s",
              }}
            />
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
            width: peeking ? "min(450px, 85vw)" : "min(160px, 35vw)",
            height: peeking ? "min(200px, 25vh)" : "min(40px, 6vh)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(196,255,0,0.10) 0%,
                  rgba(196,255,0,0.05) 40%,
                  rgba(196,255,0,0.01) 80%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(196,255,0,0.02) 0%,
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
            gap: "0.4rem",
            paddingTop: "1rem",
            perspective: "400px",
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
                textShadow: hoveredEntry === i
                  ? "0 0 30px rgba(196,255,0,0.4)"
                  : "none",
                whiteSpace: "nowrap",
                transform: `perspective(400px) rotateX(50deg) scaleY(${1.3 + i * 0.15})`,
                transformOrigin: "center top",
                opacity: peeking ? 1 : 0,
                transition: "color 0.3s, opacity 0.5s 0.3s",
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
