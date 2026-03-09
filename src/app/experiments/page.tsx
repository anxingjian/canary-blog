"use client";

import Link from "next/link";

const experiments = [
  {
    id: "afterimage",
    title: "余像",
    subtitle: "AFTERIMAGE",
    desc: "十幅名画，一条长廊，GLSL shader 动画背景",
    thumb: "/canary-blog/arts/afterimage.png",
  },
  {
    id: "vault",
    title: "灵感金库",
    subtitle: "VAULT",
    desc: "好设计的收藏夹。标签检索，一键直达。",
    thumbText: "◆",
  },
  {
    id: "font-compare",
    title: "字体对比",
    subtitle: "FONT COMPARISON",
    desc: "Sans-serif 与 serif 字体的真实渲染对比",
    external: true,
    thumbText: "Aa",
  },
];

function Thumbnail({ thumb, thumbText }: { thumb?: string; thumbText?: string }) {
  if (thumb) {
    return (
      <div
        style={{
          width: 80,
          height: 80,
          minWidth: 80,
          borderRadius: 4,
          overflow: "hidden",
          background: "#111",
        }}
      >
        <img
          src={thumb}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 80,
        height: 80,
        minWidth: 80,
        borderRadius: 4,
        background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Instrument Serif', serif",
        fontSize: "2rem",
        color: "rgba(255, 250, 240, 0.25)",
        letterSpacing: "-0.03em",
      }}
    >
      {thumbText || "?"}
    </div>
  );
}

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
          width: "min(90vw, 500px)",
        }}
      >
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={(exp as any).external ? `/font-compare.html` : `/experiments/${exp.id}`}
            style={{
              textDecoration: "none",
              borderBottom: "1px solid rgba(255, 250, 240, 0.06)",
              paddingBottom: "2rem",
              display: "flex",
              gap: "1.25rem",
              alignItems: "flex-start",
            }}
          >
            <Thumbnail thumb={(exp as any).thumb} thumbText={(exp as any).thumbText} />
            <div>
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
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/canary-blog/"
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
