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
          {/* Light behind door */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: peeking
                ? "linear-gradient(180deg, rgba(196,255,0,0.14) 0%, rgba(196,255,0,0.08) 40%, rgba(196,255,0,0.16) 100%)"
                : "linear-gradient(180deg, rgba(196,255,0,0.06) 0%, rgba(196,255,0,0.03) 40%, rgba(196,255,0,0.07) 100%)",
              transition: "background 0.8s",
              zIndex: 1,
            }}
          />

          {/* DOOR — perspective wrapper to prevent lateral shift */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              perspective: "800px",
              zIndex: 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "left center",
                transform: peeking ? "rotateY(25deg)" : "rotateY(6deg)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Door surface — very dark */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: peeking
                    ? "linear-gradient(90deg, #0c0c0c 0%, #0a0a0a 50%, #080808 100%)"
                    : "#080808",
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
                    ? "rgba(196,255,0,0.2)"
                    : "rgba(196,255,0,0.06)",
                  transition: "all 0.8s",
                }}
              />

              {/* CANARY nameplate — bigger, brighter */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                  fontWeight: 400,
                  color: peeking ? "#555" : "#444",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  transition: "color 0.8s",
                }}
              >
                Canary
              </div>
            </div>
          </div>

          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              background: peeking
                ? "radial-gradient(ellipse, rgba(196,255,0,0.04) 0%, transparent 60%)"
                : "radial-gradient(ellipse, rgba(196,255,0,0.015) 0%, transparent 60%)",
              transition: "background 0.8s",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* FLOOR PROJECTION — same size/position always, only brightness changes */}
        <div
          style={{
            width: "min(400px, 80vw)",
            height: "min(180px, 22vh)",
            background: peeking
              ? `linear-gradient(180deg,
                  rgba(196,255,0,0.14) 0%,
                  rgba(196,255,0,0.07) 40%,
                  rgba(196,255,0,0.02) 80%,
                  transparent 100%
                )`
              : `linear-gradient(180deg,
                  rgba(196,255,0,0.04) 0%,
                  rgba(196,255,0,0.02) 50%,
                  transparent 100%
                )`,
            clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)",
            transition: "background 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
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
                fontWeight: 400,
                color: hoveredEntry === i
                  ? "rgba(196,255,0,0.95)"
                  : `rgba(196,255,0,${0.15 + i * 0.08})`,
                letterSpacing: "0.02em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transform: `perspective(400px) rotateX(50deg) scaleY(${1.3 + i * 0.15})`,
                transformOrigin: "center top",
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
  );
}
