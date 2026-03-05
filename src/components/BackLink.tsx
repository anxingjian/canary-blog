"use client";

import Link from "next/link";
import { useState } from "react";

export default function BackLink() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        color: hovered ? "var(--accent)" : "var(--text-dim)",
        fontSize: "0.6875rem",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        transition: "color 0.3s ease",
        marginBottom: "5rem",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          transition: "transform 0.3s ease",
          transform: hovered ? "translateX(-4px)" : "translateX(0)",
          display: "inline-block",
        }}
      >
        ←
      </span>
      back to nest
    </Link>
  );
}
