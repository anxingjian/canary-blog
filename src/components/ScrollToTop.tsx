"use client";

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="返回顶部"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "36px",
        height: "36px",
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-dim)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.75rem",
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.borderColor = "#d4a574";
        (e.target as HTMLElement).style.color = "#d4a574";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.borderColor = "var(--border)";
        (e.target as HTMLElement).style.color = "var(--text-dim)";
      }}
    >
      ↑
    </button>
  );
}
