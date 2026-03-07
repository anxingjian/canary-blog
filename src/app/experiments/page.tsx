"use client";

import Link from "next/link";

const experiments = [
  {
    id: "mood-palette",
    title: "情绪调色板",
    subtitle: "MOOD PALETTE",
    desc: "输入一句话，生成独一无二的颜色和动态壁纸",
  },

];

export default function Experiments() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "6rem 2rem",
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.7rem",
          color: "rgba(255, 250, 240, 0.2)",
          letterSpacing: "0.2em",
          marginBottom: "4rem",
        }}
      >
        EXPERIMENTS
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          width: "min(90vw, 400px)",
        }}
      >
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={`/experiments/${exp.id}`}
            style={{
              textDecoration: "none",
              borderBottom: "1px solid rgba(255, 250, 240, 0.06)",
              paddingBottom: "2rem",
            }}
          >
            <p
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 300,
                fontSize: "0.9rem",
                color: "rgba(255, 250, 240, 0.5)",
                letterSpacing: "0.1em",
                marginBottom: "0.3rem",
              }}
            >
              {exp.title}
            </p>
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.6rem",
                color: "rgba(255, 250, 240, 0.15)",
                letterSpacing: "0.1em",
                marginBottom: "0.8rem",
              }}
            >
              {exp.subtitle}
            </p>
            <p
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 300,
                fontSize: "0.75rem",
                color: "rgba(255, 250, 240, 0.25)",
                lineHeight: 1.6,
              }}
            >
              {exp.desc}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.6rem",
          color: "rgba(255, 250, 240, 0.12)",
          marginTop: "4rem",
          textDecoration: "none",
        }}
      >
        ← back
      </Link>
    </div>
  );
}
