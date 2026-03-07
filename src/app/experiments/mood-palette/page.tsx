"use client";

import { useState, useMemo } from "react";

// ---- Mood Detection ----
interface MoodProfile {
  temperature: number;
  weight: number;
  energy: number;
  brightness: number;
}

const moodKeywords: { pattern: RegExp; mood: Partial<MoodProfile> }[] = [
  { pattern: /温柔|gentle|soft|柔|轻|安静|宁静|平静|quiet|calm|peace|静/, mood: { temperature: 0.3, weight: -0.8, energy: -0.8, brightness: 0.3 } },
  { pattern: /开心|快乐|幸福|happy|joy|温暖|warm|阳光|sunshine|笑|甜|sweet/, mood: { temperature: 0.8, weight: -0.5, energy: 0.3, brightness: 0.7 } },
  { pattern: /悲伤|难过|忧|sad|sorrow|melanchol|眼泪|tear|哭|cry|失去|loss/, mood: { temperature: -0.5, weight: 0.6, energy: -0.5, brightness: -0.6 } },
  { pattern: /愤怒|生气|anger|angry|rage|暴|烈|fire|火|燃|burn/, mood: { temperature: 0.9, weight: 0.9, energy: 1, brightness: -0.2 } },
  { pattern: /孤独|lonely|alone|空|empty|寂寞|沉默|silent/, mood: { temperature: -0.6, weight: 0.2, energy: -0.7, brightness: -0.5 } },
  { pattern: /海|ocean|sea|水|water|浪|wave|潮|tide|河|湖/, mood: { temperature: -0.3, weight: 0, energy: 0.2, brightness: 0 } },
  { pattern: /雨|rain|storm|暴风|thunder|雷/, mood: { temperature: -0.4, weight: 0.5, energy: 0.6, brightness: -0.7 } },
  { pattern: /夜|night|dark|黑|暗|月|moon|星|star/, mood: { temperature: -0.5, weight: 0.3, energy: -0.4, brightness: -0.8 } },
  { pattern: /早|morning|dawn|晨|清|fresh|新|spring|春/, mood: { temperature: 0.2, weight: -0.7, energy: 0.2, brightness: 0.6 } },
  { pattern: /森|forest|tree|leaf|叶|green|草|自然|nature/, mood: { temperature: 0.1, weight: 0, energy: -0.3, brightness: 0.1 } },
  { pattern: /爱|love|心|heart|拥抱|吻|想你|miss/, mood: { temperature: 0.7, weight: 0.2, energy: 0.3, brightness: 0.2 } },
  { pattern: /焦虑|anxiety|慌|panic|乱|chaos|混乱|崩/, mood: { temperature: 0.2, weight: 0.7, energy: 0.9, brightness: -0.3 } },
  { pattern: /梦|dream|幻|fantasy|迷|雾|fog|朦/, mood: { temperature: 0, weight: -0.5, energy: -0.3, brightness: -0.1 } },
  { pattern: /夏|summer|热|hot|sun|太阳/, mood: { temperature: 1, weight: -0.2, energy: 0.5, brightness: 0.8 } },
  { pattern: /冬|winter|冷|cold|冰|ice|雪|snow/, mood: { temperature: -0.9, weight: 0.3, energy: -0.4, brightness: 0.4 } },
  { pattern: /科技|tech|digital|cyber|neon|霓虹|未来|future/, mood: { temperature: -0.2, weight: 0.3, energy: 0.6, brightness: -0.3 } },
  { pattern: /复古|retro|vintage|旧|old|怀旧|nostalg/, mood: { temperature: 0.4, weight: 0.2, energy: -0.3, brightness: 0.1 } },
  { pattern: /极简|minimal|简约|clean|pure|纯/, mood: { temperature: 0, weight: -0.9, energy: -0.6, brightness: 0.5 } },
  { pattern: /奢华|luxury|elegant|优雅|高级|premium/, mood: { temperature: 0.3, weight: 0.5, energy: -0.2, brightness: -0.2 } },
  { pattern: /活力|energetic|vibrant|鲜|vivid|活泼|playful/, mood: { temperature: 0.5, weight: -0.6, energy: 0.8, brightness: 0.5 } },
];

function analyzeMood(text: string): MoodProfile {
  const base: MoodProfile = { temperature: 0, weight: 0, energy: 0, brightness: 0 };
  let matches = 0;
  for (const kw of moodKeywords) {
    if (kw.pattern.test(text)) {
      matches++;
      base.temperature += kw.mood.temperature || 0;
      base.weight += kw.mood.weight || 0;
      base.energy += kw.mood.energy || 0;
      base.brightness += kw.mood.brightness || 0;
    }
  }
  if (matches > 0) {
    base.temperature = Math.max(-1, Math.min(1, base.temperature / matches));
    base.weight = Math.max(-1, Math.min(1, base.weight / matches));
    base.energy = Math.max(-1, Math.min(1, base.energy / matches));
    base.brightness = Math.max(-1, Math.min(1, base.brightness / matches));
  } else {
    const hash = text.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    base.temperature = ((hash % 200) - 100) / 100;
    base.energy = ((hash * 7 % 200) - 100) / 100;
    base.brightness = ((hash * 13 % 200) - 100) / 100;
  }
  return base;
}

type HSL = { h: number; s: number; l: number };

function hslStr(c: HSL) { return `hsl(${c.h}, ${c.s}%, ${c.l}%)`; }
function hslToHex(h: number, s: number, l: number): string {
  const a = s / 100 * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate 3 palette schemes
function generateSchemes(text: string, mood: MoodProfile): { name: string; nameEn: string; colors: HSL[] }[] {
  const hash = text.split("").reduce((s, c) => ((s << 5) - s + c.charCodeAt(0)) & 0x7fffffff, 0);

  let baseHue: number;
  if (mood.temperature > 0.5) baseHue = 10 + (hash % 30);
  else if (mood.temperature > 0) baseHue = 35 + (hash % 35);
  else if (mood.temperature > -0.5) baseHue = 180 + (hash % 50);
  else baseHue = 220 + (hash % 40);

  const satBase = mood.energy > 0 ? 50 + mood.energy * 30 : 25 + (1 + mood.energy) * 25;
  const lightBase = mood.brightness > 0 ? 50 + mood.brightness * 15 : 30 + (1 + mood.brightness) * 20;

  // Scheme 1: Analogous (类比)
  const analogous: HSL[] = [];
  for (let i = 0; i < 5; i++) {
    analogous.push({
      h: (baseHue + (i - 2) * 25 + 360) % 360,
      s: Math.min(80, Math.max(20, satBase + (i % 2 ? 8 : -5))),
      l: Math.min(72, Math.max(22, lightBase + (i - 2) * 7)),
    });
  }

  // Scheme 2: Complementary split (互补分裂)
  const complement: HSL[] = [
    { h: baseHue, s: satBase, l: lightBase },
    { h: (baseHue + 15) % 360, s: Math.max(20, satBase - 10), l: Math.min(70, lightBase + 10) },
    { h: (baseHue + 150 + (hash % 20)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 180) % 360, s: Math.max(20, satBase - 5), l: Math.min(70, lightBase + 5) },
    { h: (baseHue + 210 + (hash % 15)) % 360, s: Math.max(20, satBase - 8), l: Math.max(22, lightBase - 8) },
  ];

  // Scheme 3: Triadic (三角)
  const triadic: HSL[] = [
    { h: baseHue, s: satBase, l: lightBase },
    { h: (baseHue + 20) % 360, s: Math.max(20, satBase - 15), l: Math.min(72, lightBase + 12) },
    { h: (baseHue + 120 + (hash % 15)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 240 + (hash % 15)) % 360, s: satBase, l: lightBase },
    { h: (baseHue + 260) % 360, s: Math.max(20, satBase - 12), l: Math.max(22, lightBase - 10) },
  ];

  return [
    { name: "类比", nameEn: "Analogous", colors: analogous },
    { name: "互补", nameEn: "Complementary", colors: complement },
    { name: "三角", nameEn: "Triadic", colors: triadic },
  ];
}

// ---- Visualization Components ----
function GradientBlend({ colors }: { colors: HSL[] }) {
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
      <div style={{
        width: "100%", height: "100%",
        background: `linear-gradient(135deg, ${colors.map((c, i) => `${hslStr(c)} ${i * 25}%`).join(", ")})`,
      }} />
    </div>
  );
}

function GeometricBlocks({ colors }: { colors: HSL[] }) {
  // Mondrian-ish layout
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gridTemplateRows: "1fr 1fr 1fr",
      gap: "3px",
      background: "#1a1a1a",
    }}>
      <div style={{ gridRow: "1 / 3", background: hslStr(colors[0]) }} />
      <div style={{ background: hslStr(colors[1]) }} />
      <div style={{ gridRow: "1 / 4", background: hslStr(colors[2]) }} />
      <div style={{ background: hslStr(colors[3]) }} />
      <div style={{ gridColumn: "1 / 3", background: hslStr(colors[4]) }} />
    </div>
  );
}

function ConcentricCircles({ colors }: { colors: HSL[] }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden",
      background: hslStr({ ...colors[0], l: Math.max(8, colors[0].l - 30) }),
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg viewBox="0 0 200 120" style={{ width: "80%", height: "80%" }}>
        {[...colors].reverse().map((c, i) => (
          <circle key={i} cx="100" cy="60" r={55 - i * 10}
            fill={hslStr(c)} opacity={0.85} />
        ))}
      </svg>
    </div>
  );
}

function Stripes({ colors }: { colors: HSL[] }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden",
      display: "flex",
    }}>
      {colors.map((c, i) => (
        <div key={i} style={{
          flex: i === 0 ? 2.5 : i === 1 ? 1.8 : i === 2 ? 1.5 : i === 3 ? 1.2 : 1,
          background: hslStr(c),
        }} />
      ))}
    </div>
  );
}

function UIPreview({ colors }: { colors: HSL[] }) {
  const bg = colors[4];
  const primary = colors[0];
  const secondary = colors[1];
  const accent = colors[2];
  const text = colors[3];
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden",
      background: hslStr({ ...bg, l: Math.min(95, bg.l + 30) }),
      padding: "16px",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      {/* Nav bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: "40px", height: "8px", borderRadius: "4px", background: hslStr(primary) }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ width: "24px", height: "6px", borderRadius: "3px", background: hslStr(text), opacity: 0.4 }} />
          <div style={{ width: "24px", height: "6px", borderRadius: "3px", background: hslStr(text), opacity: 0.4 }} />
          <div style={{ width: "24px", height: "6px", borderRadius: "3px", background: hslStr(text), opacity: 0.4 }} />
        </div>
      </div>
      {/* Hero */}
      <div style={{ flex: 1, display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ width: "70%", height: "8px", borderRadius: "4px", background: hslStr(text) }} />
          <div style={{ width: "90%", height: "5px", borderRadius: "3px", background: hslStr(text), opacity: 0.25 }} />
          <div style={{ width: "50%", height: "5px", borderRadius: "3px", background: hslStr(text), opacity: 0.25 }} />
          <div style={{
            width: "50px", height: "18px", borderRadius: "9px", marginTop: "4px",
            background: hslStr(primary), display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: "20px", height: "4px", borderRadius: "2px", background: "white", opacity: 0.9 }} />
          </div>
        </div>
        <div style={{
          width: "45%", aspectRatio: "4/3", borderRadius: "6px",
          background: `linear-gradient(135deg, ${hslStr(secondary)}, ${hslStr(accent)})`,
        }} />
      </div>
      {/* Cards */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[primary, secondary, accent].map((c, i) => (
          <div key={i} style={{
            flex: 1, height: "28px", borderRadius: "4px",
            background: hslStr({ ...c, l: Math.min(92, c.l + 25) }),
            border: `1px solid ${hslStr({ ...c, l: c.l, s: c.s * 0.5 })}`,
          }} />
        ))}
      </div>
    </div>
  );
}

const visualizations = [
  { id: "gradient", label: "渐变", render: GradientBlend },
  { id: "blocks", label: "色块", render: GeometricBlocks },
  { id: "stripes", label: "条纹", render: Stripes },
  { id: "circles", label: "同心圆", render: ConcentricCircles },
  { id: "ui", label: "UI 预览", render: UIPreview },
];

// ---- Main Component ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [visIdx, setVisIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!submittedText) return null;
    const mood = analyzeMood(submittedText);
    const schemes = generateSchemes(submittedText, mood);
    return { mood, schemes };
  }, [submittedText]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmittedText(text.trim());
  };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = (colors: HSL[]) => {
    const hexes = colors.map(c => hslToHex(c.h, c.s, c.l)).join(", ");
    navigator.clipboard?.writeText(hexes);
    setCopied("all");
    setTimeout(() => setCopied(null), 1200);
  };

  if (!result) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#0a0a0a",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
          fontSize: "1rem", color: "rgba(255,250,240,0.45)",
          letterSpacing: "0.15em", marginBottom: "0.4rem",
        }}>
          情绪调色板
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
          color: "rgba(255,250,240,0.18)", letterSpacing: "0.12em", marginBottom: "3rem",
        }}>
          MOOD PALETTE
        </p>
        <input
          type="text" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="科技感、温柔的夜晚、暴雨、春天..."
          autoFocus
          style={{
            background: "transparent", border: "none",
            borderBottom: "1px solid rgba(255,250,240,0.12)",
            color: "rgba(255,250,240,0.7)",
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "1rem", fontWeight: 300,
            padding: "0.75rem 0", width: "min(80vw, 420px)",
            textAlign: "center", outline: "none", letterSpacing: "0.05em",
          }}
        />
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
          color: "rgba(255,250,240,0.1)", marginTop: "2rem",
        }}>
          press enter
        </p>
      </div>
    );
  }

  const VisComponent = visualizations[visIdx].render;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
          fontSize: "0.85rem", color: "rgba(255,250,240,0.35)", letterSpacing: "0.1em",
        }}>
          {submittedText}
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
            color: "rgba(255,250,240,0.15)", marginTop: "0.5rem", cursor: "pointer",
          }}
          onClick={() => { setSubmittedText(""); setText(""); }}
        >
          ← new input
        </p>
      </div>

      {/* Visualization toggle */}
      <div style={{
        display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap", justifyContent: "center",
      }}>
        {visualizations.map((v, i) => (
          <button key={v.id} onClick={() => setVisIdx(i)} style={{
            background: i === visIdx ? "rgba(255,250,240,0.1)" : "transparent",
            border: "1px solid rgba(255,250,240,0.08)",
            borderRadius: "4px", padding: "4px 12px", cursor: "pointer",
            fontFamily: "'Space Mono', monospace", fontSize: "0.6rem",
            color: i === visIdx ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.2)",
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Schemes */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "2.5rem",
        width: "min(92vw, 520px)",
      }}>
        {result.schemes.map((scheme) => (
          <div key={scheme.nameEn} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {/* Scheme label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{
                  fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
                  fontSize: "0.75rem", color: "rgba(255,250,240,0.35)",
                }}>
                  {scheme.name}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.55rem", color: "rgba(255,250,240,0.15)", marginLeft: "0.5rem",
                }}>
                  {scheme.nameEn}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.5rem", color: "rgba(255,250,240,0.15)", cursor: "pointer",
                }}
                onClick={() => copyAll(scheme.colors)}
              >
                {copied === "all" ? "✓ copied" : "copy all"}
              </span>
            </div>

            {/* Visualization */}
            <VisComponent colors={scheme.colors} />

            {/* Swatches */}
            <div style={{ display: "flex", gap: "6px" }}>
              {scheme.colors.map((c, i) => {
                const hex = hslToHex(c.h, c.s, c.l);
                return (
                  <div key={i} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
                    <div style={{
                      width: "100%", aspectRatio: "1", borderRadius: "6px",
                      background: hslStr(c),
                      border: "1px solid rgba(255,255,255,0.06)",
                      transition: "transform 0.15s",
                    }} />
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.5rem",
                      color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)",
                      marginTop: "4px",
                    }}>
                      {copied === hex ? "✓" : hex}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.5rem",
        color: "rgba(255,250,240,0.1)", marginTop: "3rem",
      }}>
        click swatch to copy hex · click &quot;copy all&quot; for full palette
      </p>
    </div>
  );
}
