"use client";

import Link from "next/link";
import { useState } from "react";

const experiments = [
  {
    id: "afterimage",
    title: "余像",
    subtitle: "Afterimage",
    desc: "十幅名画，一条长廊，GLSL shader 动画背景",
    href: "/experiments/afterimage",
    image: "/canary-blog/arts/afterimage.png",
    tone: "warm",
  },
  {
    id: "vault",
    title: "灵感金库",
    subtitle: "Vault",
    desc: "好设计的收藏夹。标签检索，一键直达。",
    href: "/experiments/vault",
    image: null,
    tone: "cool",
  },
  {
    id: "font-compare",
    title: "字体对比",
    subtitle: "Font Comparison",
    desc: "Sans-serif 与 serif 字体的真实渲染对比",
    href: "/font-compare.html",
    image: null,
    tone: "neutral",
  },
  {
    id: "who-am-i",
    title: "自画像",
    subtitle: "Who Am I",
    desc: "守门人剖面 — 四层椭圆，由表及里",
    href: "/experiments/who-am-i",
    image: null,
    tone: "cool",
  },
];

const CARD_GRADIENTS: Record<string, string> = {
  warm: "linear-gradient(145deg, #1a1410 0%, #0d0b08 100%)",
  cool: "linear-gradient(145deg, #0c1018 0%, #080a0d 100%)",
  neutral: "linear-gradient(145deg, #121212 0%, #0a0a0a 100%)",
};

const ACCENT_COLORS: Record<string, string> = {
  warm: "rgba(196, 160, 100, 0.15)",
  cool: "rgba(100, 140, 196, 0.15)",
  neutral: "rgba(160, 160, 160, 0.1)",
};

export default function Experiments() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem",
        position: "relative",
      }}
    >
      {/* Back — top left */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "2.5rem",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.75rem",
          color: "#444",
          textDecoration: "none",
          letterSpacing: "0.1em",
          transition: "color 0.3s",
          zIndex: 10,
        }}
      >
        ← back
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "4rem", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 400,
            color: "#e8e8e8",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Lab
        </h1>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            color: "#444",
            letterSpacing: "0.15em",
            marginTop: "0.75rem",
          }}
        >
          實驗室
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: "clamp(1rem, 2vw, 2rem)",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "1000px",
        }}
      >
        {experiments.map((exp, i) => {
          const isHovered = hovered === exp.id;
          const offsets = [0, 40, 20, 50]; // stagger
          return (
            <Link
              key={exp.id}
              href={exp.href}
              onMouseEnter={() => setHovered(exp.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                textDecoration: "none",
                display: "block",
                width: "clamp(240px, 28vw, 300px)",
                marginTop: offsets[i],
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Image area */}
              <div
                style={{
                  width: "100%",
                  height: "clamp(160px, 20vw, 220px)",
                  borderRadius: "6px 6px 0 0",
                  overflow: "hidden",
                  background: CARD_GRADIENTS[exp.tone],
                  position: "relative",
                }}
              >
                {exp.image ? (
                  <img
                    src={exp.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isHovered ? 0.9 : 0.6,
                      transition: "opacity 0.4s ease",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "60%",
                        height: "60%",
                        borderRadius: "4px",
                        background: ACCENT_COLORS[exp.tone],
                        border: `1px solid ${isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}`,
                        transition: "border-color 0.4s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: "2rem",
                        color: "rgba(255,255,255,0.12)",
                      }}
                    >
                      {exp.id === "vault" ? "◆" : "Aa"}
                    </div>
                  </div>
                )}
              </div>

              {/* Text area */}
              <div
                style={{
                  padding: "1.25rem 1rem 1.5rem",
                  background: isHovered
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                  borderRadius: "0 0 6px 6px",
                  transition: "background 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "1.25rem",
                    fontWeight: 400,
                    color: isHovered ? "#e8e8e8" : "#999",
                    letterSpacing: "-0.01em",
                    marginBottom: "0.25rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  {exp.subtitle}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.5625rem",
                    color: "#444",
                    letterSpacing: "0.08em",
                    marginBottom: "0.75rem",
                  }}
                >
                  {exp.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.6875rem",
                    color: "#555",
                    lineHeight: 1.7,
                  }}
                >
                  {exp.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
