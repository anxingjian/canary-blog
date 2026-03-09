"use client";

import { useState, useEffect, useCallback } from "react";

const HASH = "91f5c2f267aebcf1c45cb7b575ae92bfcc90834d43a2a8b25f2fc0014adba2c6";
const STORAGE_KEY = "journal-auth";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === "1") setUnlocked(true);
    setChecking(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const hash = await sha256(input.trim());
    if (hash === HASH) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }, [input]);

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg, #0a0a0a)", padding: "2rem",
    }}>
      <h1 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 400, letterSpacing: "-0.04em", color: "var(--text-bright, #fafafa)",
        marginBottom: "3rem",
      }}>
        Journal
      </h1>
      <p style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
        color: "var(--text-dim, #555)", letterSpacing: "0.1em",
        marginBottom: "2rem",
      }}>
        private · password required
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="······"
          autoFocus
          style={{
            background: "transparent", border: `1px solid ${error ? "#a04040" : "var(--border, #222)"}`,
            borderRadius: "6px", padding: "10px 16px", fontSize: "1rem",
            color: "var(--text-bright, #fafafa)", outline: "none",
            fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
            width: "180px", transition: "border-color 0.3s",
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: "transparent", border: "1px solid var(--border, #222)",
            borderRadius: "6px", padding: "10px 16px", fontSize: "0.875rem",
            color: "var(--text-dim, #888)", cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent, #c8a882)"; e.currentTarget.style.color = "var(--text-bright, #fafafa)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border, #222)"; e.currentTarget.style.color = "var(--text-dim, #888)"; }}
        >
          →
        </button>
      </div>
      {error && (
        <p style={{
          marginTop: "1rem", fontSize: "0.75rem",
          color: "#a04040", fontFamily: "'Space Mono', monospace",
        }}>
          wrong password
        </p>
      )}
    </div>
  );
}
