"use client";

import { useState } from "react";

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        <span style={{ color: "var(--accent)", animation: "pulse 3s infinite" }}>●</span>{" "}
        SYS.ONLINE
      </div>

      {/* Door frame — centered, not full width */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "520px",
        }}
      >
        {/* Door frame border */}
        <div
          style={{
            position: "absolute",
            inset: "-4px",
            border: "1px solid #1a1a1a",
            borderRadius: "2px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Door frame top accent */}
        <div
          style={{
            position: "absolute",
            top: "-4px",
            left: "20%",
            right: "20%",
            height: "1px",
            background: "rgba(196,255,0,0.15)",
            zIndex: 2,
          }}
        />

        {/* Left door panel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "50%",
            background: "linear-gradient(90deg, #0a0a0a 0%, #0f0f0f 60%, #121212 100%)",
            borderRight: "1px solid #1a1a1a",
            transform: peeking ? "translateX(-14px)" : "translateX(0)",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 4,
          }}
        >
          {/* Panel inset detail */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              bottom: "15%",
              left: "20%",
              right: "12%",
              border: "1px solid #1a1a1a",
              borderRadius: "1px",
            }}
          />
          {/* Door handle */}
          <div
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "3px",
              height: "28px",
              background: peeking ? "#333" : "#222",
              borderRadius: "1.5px",
              transition: "background 0.5s",
            }}
          />
        </div>

        {/* Right door panel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "50%",
            background: "linear-gradient(-90deg, #0a0a0a 0%, #0f0f0f 60%, #121212 100%)",
            borderLeft: "1px solid #1a1a1a",
            transform: peeking ? "translateX(14px)" : "translateX(0)",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 4,
          }}
        >
          {/* Panel inset detail */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              bottom: "15%",
              right: "20%",
              left: "12%",
              border: "1px solid #1a1a1a",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Crack glow between doors */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: peeking ? "32px" : "2px",
            background: `linear-gradient(180deg,
              transparent 5%,
              rgba(196,255,0,0.04) 15%,
              rgba(196,255,0,0.1) 35%,
              rgba(196,255,0,0.16) 50%,
              rgba(196,255,0,0.1) 65%,
              rgba(196,255,0,0.04) 85%,
              transparent 95%
            )`,
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 3,
          }}
        />

        {/* Floor light spill */}
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: peeking ? "300px" : "60px",
            height: peeking ? "80px" : "30px",
            background: "radial-gradient(ellipse at center top, rgba(196,255,0,0.04) 0%, transparent 70%)",
            transition: "all 0.8s",
            zIndex: 0,
          }}
        />

        {/* Hover zone — over the door area */}
        <div
          onMouseEnter={() => setPeeking(true)}
          onMouseLeave={() => { setPeeking(false); setHoveredEntry(null); }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            cursor: "pointer",
          }}
        >
          {/* Entries — inside the hover zone so they stay visible */}
          <div
            style={{
              position: "absolute",
              left: "calc(50% + 24px)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              opacity: peeking ? 1 : 0,
              transition: "opacity 0.5s 0.25s",
              zIndex: 15,
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
                  fontSize: "2.4rem",
                  color: hoveredEntry === i ? "var(--accent)" : "#2a2a2a",
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
        </div>
      </div>
    </div>
  );
}
