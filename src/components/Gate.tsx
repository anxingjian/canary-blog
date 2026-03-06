"use client";

import { useState } from "react";

const ENTRIES = [
  { name: "Arts", href: "/arts" },
  { name: "Essays", href: "/essays" },
  { name: "Journal", href: "/journal" },
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
        background: "#0a0a0a",
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

      {/* Footnote — centered */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#444",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5625rem",
          letterSpacing: "0.15em",
          whiteSpace: "nowrap",
          zIndex: 20,
        }}
      >
        Canary · Watches everything, says almost nothing.
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
          {/* Light behind door (the bright doorframe) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: peeking
                ? "linear-gradient(180deg, rgba(196,255,0,0.18) 0%, rgba(196,255,0,0.10) 40%, rgba(196,255,0,0.14) 100%)"
                : "linear-gradient(180deg, rgba(196,255,0,0.08) 0%, rgba(196,255,0,0.04) 40%, rgba(196,255,0,0.05) 100%)",
              transition: "background 0.8s",
              zIndex: 1,
            }}
          />

          {/* DOOR — hinged on LEFT, no gap on left side */}
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
                top: 0,
                bottom: 0,
                left: 0,
                /* Door fills full width, hinge flush to left frame edge */
                width: "100%",
                transformOrigin: "left center",
                transform: peeking ? "rotateY(25deg)" : "rotateY(12deg)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                backfaceVisibility: "hidden",
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
        </div>

        {/* FLOOR PROJECTION — container is 2.2x door width, clip-path makes trapezoid */}
        <div
          style={{
            width: "min(260px, 55vw)",
            height: "min(180px, 22vh)",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              /* Left/right extend beyond container to form trapezoid bottom */
              left: "-35%",
              right: "-35%",
              height: "100%",
              /* Top edges at 26%/74% = the 260px door width centered in the wider box */
              clipPath: "polygon(26% 0%, 74% 0%, 100% 100%, 0% 100%)",
              background: peeking
                ? `linear-gradient(180deg,
                    rgba(196,255,0,0.14) 0%,
                    rgba(196,255,0,0.07) 40%,
                    rgba(196,255,0,0.02) 80%,
                    transparent 100%
                  )`
                : `linear-gradient(180deg,
                    rgba(196,255,0,0.05) 0%,
                    rgba(196,255,0,0.02) 50%,
                    transparent 100%
                  )`,
              transition: "background 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0",
              paddingTop: "0.6rem",
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
                    : `rgba(196,255,0,${0.18 + i * 0.08})`,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transform: `perspective(400px) rotateX(50deg) scaleY(${1.3 + i * 0.12})`,
                  transformOrigin: "center top",
                  marginTop: i === 0 ? "0" : i === 1 ? "-0.15rem" : "-0.2rem",
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

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: "min(350px, 65vw)",
          height: "min(550px, 75vh)",
          background: peeking
            ? "radial-gradient(ellipse, rgba(196,255,0,0.04) 0%, transparent 60%)"
            : "radial-gradient(ellipse, rgba(196,255,0,0.015) 0%, transparent 60%)",
          transition: "background 0.8s",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
