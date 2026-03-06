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

      {/* Scene container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ===== DOOR FRAME (the bright rectangle behind) ===== */}
        <div
          style={{
            position: "absolute",
            width: "min(260px, 55vw)",
            height: "min(460px, 65vh)",
            background: peeking
              ? "linear-gradient(180deg, rgba(196,255,0,0.12) 0%, rgba(196,255,0,0.08) 50%, rgba(196,255,0,0.15) 100%)"
              : "linear-gradient(180deg, rgba(196,255,0,0.03) 0%, rgba(196,255,0,0.02) 50%, rgba(196,255,0,0.04) 100%)",
            transition: "background 0.8s",
            zIndex: 1,
          }}
        />

        {/* ===== DOOR (single panel, swings open) ===== */}
        <div
          onMouseEnter={() => setPeeking(true)}
          onMouseLeave={() => { setPeeking(false); setHoveredEntry(null); }}
          onClick={(e) => { if (!peeking) { e.stopPropagation(); setPeeking(true); } }}
          style={{
            position: "absolute",
            width: "min(260px, 55vw)",
            height: "min(460px, 65vh)",
            transformOrigin: "left center",
            transform: peeking
              ? "perspective(800px) rotateY(-38deg)"
              : "perspective(800px) rotateY(-8deg)",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 3,
            cursor: "pointer",
          }}
        >
          {/* Door surface */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #111 0%, #0d0d0d 40%, #0a0a0a 100%)",
              borderRight: "1px solid #1a1a1a",
            }}
          >
            {/* Top panel inset */}
            <div
              style={{
                position: "absolute",
                top: "8%",
                left: "15%",
                right: "10%",
                height: "30%",
                border: "1px solid #1a1a1a",
                borderRadius: "1px",
                background: "linear-gradient(180deg, #0c0c0c 0%, #0e0e0e 100%)",
              }}
            />
            {/* Bottom panel inset */}
            <div
              style={{
                position: "absolute",
                top: "45%",
                left: "15%",
                right: "10%",
                height: "42%",
                border: "1px solid #1a1a1a",
                borderRadius: "1px",
                background: "linear-gradient(180deg, #0c0c0c 0%, #0e0e0e 100%)",
              }}
            />
            {/* Door handle */}
            <div
              style={{
                position: "absolute",
                right: "12%",
                top: "48%",
                width: "4px",
                height: "24px",
                background: "#222",
                borderRadius: "2px",
              }}
            />
            {/* Handle plate */}
            <div
              style={{
                position: "absolute",
                right: "10%",
                top: "46%",
                width: "10px",
                height: "40px",
                border: "1px solid #1a1a1a",
                borderRadius: "2px",
              }}
            />
            {/* Door nameplate — "Canary" */}
            <div
              style={{
                position: "absolute",
                top: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
                color: "#2a2a2a",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Canary
            </div>
          </div>
        </div>

        {/* ===== DOOR FRAME BORDER (on top) ===== */}
        <div
          style={{
            position: "absolute",
            width: "min(260px, 55vw)",
            height: "min(460px, 65vh)",
            border: "3px solid #151515",
            boxShadow: "inset 0 0 0 1px #111, 0 0 0 1px #111",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* ===== LIGHT SPILL on floor (trapezoid via perspective) ===== */}
        <div
          style={{
            position: "absolute",
            top: "calc(50% + min(230px, 32.5vh))",
            left: "50%",
            transform: "translateX(-50%)",
            width: peeking ? "min(400px, 80vw)" : "min(180px, 40vw)",
            height: peeking ? "min(220px, 28vh)" : "min(80px, 12vh)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(196,255,0,0.12) 0%,
                  rgba(196,255,0,0.06) 40%,
                  rgba(196,255,0,0.02) 70%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(196,255,0,0.03) 0%,
                  rgba(196,255,0,0.01) 40%,
                  transparent 100%
                )`,
            clipPath: peeking
              ? "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)"
              : "polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 2,
          }}
        >
          {/* Tab names projected in the floor light */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              opacity: peeking ? 1 : 0,
              transition: "opacity 0.6s 0.3s",
              paddingTop: "0.5rem",
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
                    ? "clamp(0.9rem, 2vw, 1.2rem)"
                    : i === 1
                    ? "clamp(1.2rem, 3vw, 1.8rem)"
                    : "clamp(1.6rem, 4vw, 2.4rem)",
                  color: hoveredEntry === i
                    ? "rgba(196,255,0,0.9)"
                    : `rgba(196,255,0,${i === 0 ? 0.2 : i === 1 ? 0.3 : 0.4})`,
                  letterSpacing: `${0.15 + i * 0.1}em`,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "color 0.3s, letter-spacing 0.3s",
                  whiteSpace: "nowrap",
                  textShadow: hoveredEntry === i
                    ? "0 0 20px rgba(196,255,0,0.3)"
                    : "none",
                }}
              >
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* ===== Ambient glow behind door ===== */}
        <div
          style={{
            position: "absolute",
            width: "min(300px, 60vw)",
            height: "min(500px, 70vh)",
            background: peeking
              ? "radial-gradient(ellipse, rgba(196,255,0,0.06) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(196,255,0,0.02) 0%, transparent 70%)",
            transition: "background 0.8s",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
