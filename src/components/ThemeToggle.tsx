"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("canary-theme");
    if (saved === "light") {
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("canary-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        position: "fixed",
        top: "calc(1.2rem + env(safe-area-inset-top, 0px))",
        right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "1px solid var(--border-hover)",
        background: theme === "dark" ? "#1a1a1a" : "#f0f0f0",
        cursor: "pointer",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        color: theme === "dark" ? "#888" : "#333",
        transition: "all 0.3s ease",
        padding: 0,
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
