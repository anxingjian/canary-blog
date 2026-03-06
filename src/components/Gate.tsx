"use client";

import { useState, useRef, useEffect } from "react";

const ENTRIES = [
  { name: "Journal", href: "/" },
  { name: "Essays", href: "/essays" },
  { name: "Arts", href: "/arts" },
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
        <span
          style={{
            color: "var(--accent)",
            animation: "pulse 3s infinite",
          }}
        >
          ●
        </span>{" "}
        SYS.ONLINE
      </div>

      {/* Left door */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "50%",
          background: "linear-gradient(90deg, #060606 0%, #0a0a0a 80%, #0e0e0e 100%)",
          borderRight: "1px solid #151515",
          transform: peeking ? "translateX(-16px)" : "translateX(0)",
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 3,
        }}
      >
        {/* Door handle */}
        <div
          style={{
            position: "absolute",
            right: "36px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "2px",
            height: "36px",
            background: peeking ? "#2a2a2a" : "#1a1a1a",
            borderRadius: "1px",
            transition: "background 0.5s",
          }}
        />
      </div>

      {/* Right door */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "50%",
          background: "linear-gradient(-90deg, #060606 0%, #0a0a0a 80%, #0e0e0e 100%)",
          borderLeft: "1px solid #151515",
          transform: peeking ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 3,
        }}
      />

      {/* Crack glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: peeking ? "36px" : "3px",
          background: `linear-gradient(180deg,
            transparent 5%,
            rgba(196,255,0,0.03) 15%,
            rgba(196,255,0,0.08) 35%,
            rgba(196,255,0,0.14) 50%,
            rgba(196,255,0,0.08) 65%,
            rgba(196,255,0,0.03) 85%,
            transparent 95%
          )`,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 2,
        }}
      />

      {/* Floor light */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: peeking ? "500px" : "100px",
          height: peeking ? "150px" : "80px",
          background: "radial-gradient(ellipse at center top, rgba(196,255,0,0.03) 0%, transparent 70%)",
          transition: "width 0.8s, height 0.8s",
          zIndex: 1,
        }}
      />

      {/* Entries - perspective text */}
      <div
        style={{
          position: "absolute",
          left: "calc(50% + 40px)",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "2.2rem",
          zIndex: 5,
          opacity: peeking ? 1 : 0,
          transition: "opacity 0.6s 0.2s",
        }}
      >
        {ENTRIES.map((entry, i) => (
          <div
            key={entry.name}
            onClick={() => handleEntryClick(entry.href)}
            onMouseEnter={() => setHoveredEntry(i)}
            onMouseLeave={() => setHoveredEntry(null)}
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "2.8rem",
              color: hoveredEntry === i ? "var(--accent)" : "#333",
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "color 0.3s",
              whiteSpace: "nowrap",
              transform: "perspective(300px) rotateY(-35deg)",
              transformOrigin: "left center",
            }}
          >
            {entry.name}
          </div>
        ))}
      </div>

      {/* Hover zone */}
      <div
        onMouseEnter={() => setPeeking(true)}
        onMouseLeave={() => setPeeking(false)}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "30%",
          right: "30%",
          zIndex: 10,
          cursor: "pointer",
        }}
      />
    </div>
  );
}
