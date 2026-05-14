"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  // 初始化主题（客户端）
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    let initialTheme: Theme = "dark";

    if (stored) {
      initialTheme = stored;
    } else if (typeof window !== "undefined") {
      // 检查系统偏好
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initialTheme = prefersDark ? "dark" : "light";
    }

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      return newTheme;
    });
  };

  // 避免 hydration mismatch
  if (theme === null) {
    return <>{children}</>;
  }

  return (
    <div data-theme-provider>
      {children}
      <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
    </div>
  );
}

function ThemeToggleButton({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        color: "var(--text-bright)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        transition: "all 0.3s ease",
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 8px var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--border)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-bright)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
