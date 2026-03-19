"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import type { Art } from "@/lib/arts";

function ArtEmbed({ art }: { art: Art }) {
  if (art.image) {
    return (
      <div style={{ aspectRatio: "1/1", background: "var(--bg)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={art.image} alt={art.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  if (art.htmlFile) {
    const isGrowth = art.series?.toLowerCase().includes("growth") || art.series?.includes("生长");
    return (
      <div style={{ aspectRatio: isGrowth ? "3/4" : "1/1", background: "#0a0a0a", borderRadius: 6, overflow: "hidden" }}>
        <iframe
          src={`/canary-blog/arts/${art.htmlFile}`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          loading="lazy"
        />
      </div>
    );
  }
  // No visual — placeholder
  return (
    <div style={{ aspectRatio: "1/1", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "'Space Mono', monospace" }}>
      {art.title}
    </div>
  );
}

function ListItem({ art, index, total }: { art: Art; index: number; total: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(total - index).padStart(2, "0");

  return (
    <div
      className="arts-list-item"
      style={{
        display: "grid",
        gridTemplateColumns: "400px 1fr",
        gap: "3rem",
        padding: index === 0 ? "1rem 0 4rem" : "4rem 0",
        borderBottom: "1px solid var(--border)",
        animation: `slideIn 0.5s ease-out ${index * 0.15}s both`,
        alignItems: "start",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ArtEmbed art={art} />

      <div className="piece-info" style={{ paddingTop: "1rem" }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif", fontSize: "2rem",
          color: hovered ? "var(--accent)" : "var(--border-hover)",
          lineHeight: 1, letterSpacing: "-0.04em", display: "block",
          marginBottom: "1.5rem", transition: "color 0.3s",
        }}>
          {num}
        </span>

        <h2 style={{
          fontFamily: "'Instrument Serif', 'Noto Serif SC', serif",
          fontSize: "1.5rem", fontWeight: 400, color: "var(--text-bright)",
          letterSpacing: "-0.02em", marginBottom: "0.375rem",
        }}>
          {art.title}
        </h2>

        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.6875rem",
          color: "var(--text-dim)", fontStyle: "italic", marginBottom: "1.25rem",
        }}>
          {art.subtitle}
        </p>

        <p style={{
          color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.9,
          maxWidth: "28rem", marginBottom: "1.5rem",
        }}>
          {art.description}
        </p>

        <div style={{
          display: "flex", gap: "2rem", fontSize: "0.5625rem",
          fontFamily: "'Space Mono', monospace", color: "var(--text-dim)",
          letterSpacing: "0.1em",
        }}>
          <span>{art.date}</span>
          <span>{art.medium}</span>
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ view, onToggle }: { view: "list" | "grid"; onToggle: (v: "list" | "grid") => void }) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "'Space Mono', monospace", fontSize: "0.5625rem",
    letterSpacing: "0.15em", color: active ? "var(--accent)" : "var(--text-dim)",
    padding: "0.5rem 0", transition: "color 0.2s", textTransform: "uppercase",
  });

  return (
    <div className="view-toggle-row" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <button style={btnStyle(view === "list")} onClick={() => onToggle("list")}>LIST</button>
      <span style={{ color: "var(--border)", fontSize: "0.5rem" }}>/</span>
      <button style={btnStyle(view === "grid")} onClick={() => onToggle("grid")}>GRID</button>
    </div>
  );
}

function GridCard({ art, index, total, size }: { art: Art; index: number; total: number; size: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(total - index).padStart(2, "0");

  return (
    <div
      style={{
        position: "relative", width: "100%", height: size > 0 ? `${size}px` : "100%",
        overflow: "hidden", animation: `fadeUp 0.5s ease-out ${index * 0.1}s both`, cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <ArtEmbed art={art} />
      </div>

      <div style={{
        position: "absolute", inset: 0,
        background: hovered ? "rgba(5,5,5,0.75)" : "transparent",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "1.25rem", transition: "background 0.3s", pointerEvents: "none",
      }}>
        <div style={{
          opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease-out",
        }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.25rem", color: "var(--border-hover)", display: "block", marginBottom: "0.375rem" }}>
            {num}
          </span>
          <h3 style={{ fontFamily: "'Instrument Serif', 'Noto Serif SC', serif", fontSize: "1.125rem", fontWeight: 400, color: "var(--text-bright)", marginBottom: "0.375rem" }}>
            {art.title}
          </h3>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5625rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
            {art.medium}
          </p>
        </div>
      </div>
    </div>
  );
}

function GridView({ arts }: { arts: Art[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!gridRef.current) return;
      const w = gridRef.current.getBoundingClientRect().width;
      setRowHeight((w - 3 * 2) / 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div ref={gridRef} style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      gridAutoRows: rowHeight > 0 ? `${rowHeight}px` : undefined,
      gap: "3px", paddingTop: "1rem",
    }}>
      {rowHeight > 0 && arts.map((art, i) => (
        <GridCard key={art.slug} art={art} index={i} total={arts.length} size={rowHeight} />
      ))}
    </div>
  );
}

export default function ArtsClient({ arts }: { arts: Art[] }) {
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, width: "3px", height: "100vh",
        background: "linear-gradient(180deg, var(--accent) 0%, var(--accent) 90%, transparent 100%)",
        zIndex: 100,
      }} />

      <header className="page-header" style={{ maxWidth: "72rem", margin: "0 auto", padding: "4rem 2rem 0", animation: "fadeUp 0.6s ease-out" }}>
        <div className="top-status-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6rem" }}>
          <a href="/canary-blog/" style={{ fontSize: "0.875rem", fontFamily: "'Space Mono', monospace", color: "var(--text-dim)", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}>
            ← Gate
          </a>
          <span style={{ fontSize: "0.5625rem", fontFamily: "'Space Mono', monospace", color: "var(--text-dim)", letterSpacing: "0.15em" }}>
            generative · interactive
          </span>
        </div>

        <h1 className="page-title" style={{
          fontFamily: "'Instrument Serif', serif", color: "var(--text-bright)",
          fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 400,
          letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: "1.5rem",
        }}>
          <a href="/canary-blog/" className="title-home-link" style={{ color: "inherit", textDecoration: "none" }}>Arts</a>
        </h1>

        <p className="page-subtitle" style={{
          fontSize: "0.8125rem", fontFamily: "'Space Mono', monospace",
          color: "var(--text-dim)", maxWidth: "28rem", lineHeight: 1.8, marginBottom: "4rem",
        }}>
          Output without input.
        </p>

        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <Nav />
          <div className="view-toggle-desktop" style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <ViewToggle view={view} onToggle={setView} />
          </div>
        </div>
      </header>

      <section className="page-section" style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 10rem" }}>
        {view === "list" ? (
          <div>
            {arts.map((art, i) => (
              <ListItem key={art.slug} art={art} index={i} total={arts.length} />
            ))}
          </div>
        ) : (
          <GridView arts={arts} />
        )}
      </section>

      <footer style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem 3rem" }}>
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: "var(--text-dim)", fontSize: "0.5rem", fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em" }}>
            C://KEEPER.SYS
          </span>
          <span style={{ color: "var(--accent)", fontSize: "0.5rem", fontFamily: "'Space Mono', monospace", animation: "blink 2.5s infinite" }}>
            ▮
          </span>
        </div>
      </footer>
      <ThemeToggle />
    </main>
  );
}
