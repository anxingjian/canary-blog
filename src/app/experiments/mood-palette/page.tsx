"use client";

import { useState, useRef, useEffect } from "react";

// ---- Simplex Noise (public domain, Stefan Gustavson) ----
class SimplexNoise {
  private grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  private perm: number[] = [];
  private gradP: number[][] = [];

  constructor(seed = 0) {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      let v = (i & 1) ? p[i] ^ (seed & 255) : p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - i + t, y0 = y - j + t;
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = this.gradP[ii + this.perm[jj]];
    const gi1 = this.gradP[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.gradP[ii + 1 + this.perm[jj + 1]];
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (gi0[0] * x0 + gi0[1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (gi1[0] * x1 + gi1[1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (gi2[0] * x2 + gi2[1] * y2); }
    return 70 * (n0 + n1 + n2);
  }
}

// ---- Curated Palette Database ----
interface CuratedPalette {
  tags: string[];
  colors: string[];
  artType: "noiseField" | "metaball" | "aurora" | "ink" | "terrain" | "crystal";
}

const PALETTES: CuratedPalette[] = [
  // Warm & Gentle
  { tags: ["温柔", "柔", "gentle", "soft", "轻"], colors: ["#F2E6D9", "#D4A59A", "#C97C5D", "#B36A5E", "#8C5E58"], artType: "noiseField" },
  { tags: ["温柔", "粉", "pink", "blush", "甜"], colors: ["#FADADD", "#F4B6C2", "#D291A4", "#A76D8E", "#6B4C5A"], artType: "metaball" },
  { tags: ["温暖", "warm", "阳光", "amber"], colors: ["#FFF3E0", "#FFE0B2", "#FFB74D", "#F57C00", "#E65100"], artType: "aurora" },
  { tags: ["sunset", "日落", "黄昏"], colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"], artType: "terrain" },

  // Cool & Calm
  { tags: ["宁静", "平静", "calm", "peace", "安静", "静"], colors: ["#E8F0FE", "#B3C7E6", "#7096C4", "#4A6FA5", "#2D4A7A"], artType: "ink" },
  { tags: ["海", "ocean", "sea", "水", "wave", "浪"], colors: ["#0A1628", "#1A3A5C", "#2E86AB", "#45B7D1", "#96E6FF"], artType: "terrain" },
  { tags: ["深海", "deep", "abyss"], colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"], artType: "terrain" },
  { tags: ["冰", "ice", "冷", "cold", "冬", "winter", "snow", "雪"], colors: ["#F0F4F8", "#D9E2EC", "#9FB3C8", "#627D98", "#334E68"], artType: "crystal" },

  // Nature
  { tags: ["森", "forest", "tree", "自然", "nature", "green", "草"], colors: ["#1B2D1B", "#2D5016", "#4A7C59", "#8FBC8F", "#C5E1A5"], artType: "noiseField" },
  { tags: ["春", "spring", "morning", "早", "fresh", "清"], colors: ["#FAFDF6", "#E8F5E9", "#A5D6A7", "#66BB6A", "#2E7D32"], artType: "metaball" },
  { tags: ["花", "flower", "garden", "bloom", "樱"], colors: ["#FFF0F3", "#FFCCD5", "#FF8FA3", "#C9184A", "#590D22"], artType: "metaball" },
  { tags: ["秋", "autumn", "fall", "枫"], colors: ["#582F0E", "#7F4F24", "#936639", "#B6AD90", "#A68A64"], artType: "noiseField" },
  { tags: ["夏", "summer", "热", "hot", "sun", "太阳"], colors: ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"], artType: "aurora" },

  // Dark & Moody
  { tags: ["夜", "night", "dark", "暗", "黑"], colors: ["#0D0D0D", "#1A1A2E", "#16213E", "#0F3460", "#E94560"], artType: "ink" },
  { tags: ["月", "moon", "星", "star"], colors: ["#0C0F1A", "#1B1F3A", "#2E3A5C", "#546A8D", "#F4E8C1"], artType: "crystal" },
  { tags: ["孤独", "lonely", "alone", "寂寞", "empty", "空"], colors: ["#1A1A2E", "#2D2D44", "#4A4A6A", "#7B7B9E", "#B8B8D1"], artType: "ink" },
  { tags: ["悲伤", "sad", "sorrow", "忧", "melanchol"], colors: ["#1B1B2F", "#2E3047", "#43455C", "#707793", "#A5A5C0"], artType: "noiseField" },
  { tags: ["雨", "rain"], colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"], artType: "ink" },

  // Intense
  { tags: ["愤怒", "anger", "rage", "火", "fire", "烈", "burn", "燃"], colors: ["#1A0000", "#590000", "#9B0000", "#D00000", "#FF4D00"], artType: "aurora" },
  { tags: ["焦虑", "anxiety", "chaos", "乱", "崩", "panic"], colors: ["#2B2D42", "#8D0801", "#BC3908", "#F6AE2D", "#F2F4F3"], artType: "crystal" },
  { tags: ["暴", "storm", "thunder", "雷", "暴风"], colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"], artType: "terrain" },
  { tags: ["活力", "energetic", "vibrant", "vivid", "活泼", "playful"], colors: ["#FF006E", "#FB5607", "#FFBE0B", "#3A86FF", "#8338EC"], artType: "aurora" },

  // Dreamy
  { tags: ["梦", "dream", "幻", "fantasy", "朦", "haze"], colors: ["#2D1B69", "#5B3A8C", "#8B5FBF", "#C49AE8", "#E8D5F5"], artType: "metaball" },
  { tags: ["雾", "fog", "mist", "迷"], colors: ["#D6D6D6", "#B8B8B8", "#969696", "#6E6E6E", "#484848"], artType: "ink" },
  { tags: ["极光", "aurora"], colors: ["#0B0C10", "#1A3C40", "#2EC4B6", "#CBF3F0", "#FF6B6B"], artType: "aurora" },

  // Design Styles
  { tags: ["科技", "tech", "digital", "cyber", "未来", "future"], colors: ["#0A0A0F", "#1A1A2E", "#00F5FF", "#7B61FF", "#FF2E63"], artType: "crystal" },
  { tags: ["霓虹", "neon", "cyberpunk"], colors: ["#0D0221", "#0F084B", "#26086B", "#FF2281", "#00FFAB"], artType: "aurora" },
  { tags: ["极简", "minimal", "简约", "clean", "pure", "纯"], colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#424242", "#212121"], artType: "noiseField" },
  { tags: ["复古", "retro", "vintage", "旧", "怀旧", "nostalg"], colors: ["#F4E4C1", "#E2C391", "#CE8147", "#8B4513", "#3C1518"], artType: "noiseField" },
  { tags: ["奢华", "luxury", "elegant", "优雅", "高级", "premium"], colors: ["#0A0A0A", "#1C1C1C", "#C9A96E", "#D4AF37", "#F5F0E1"], artType: "crystal" },
  { tags: ["日系", "japanese", "muji", "侘寂", "wabi"], colors: ["#F5F0EB", "#D4C5B2", "#A89882", "#746859", "#4A3F35"], artType: "ink" },
  { tags: ["莫兰迪", "morandi", "muted", "灰调"], colors: ["#A09B8C", "#8E9AAF", "#B8A9C9", "#CBC0D3", "#D8C3A5"], artType: "metaball" },

  // Emotion
  { tags: ["爱", "love", "heart", "心", "拥抱", "吻", "想你", "miss"], colors: ["#2D0A1F", "#6B1839", "#C2185B", "#F06292", "#FCE4EC"], artType: "metaball" },
  { tags: ["希望", "hope", "光", "light", "dawn", "晨"], colors: ["#1A1A2E", "#16213E", "#E2B714", "#F5E6CA", "#FEFCFB"], artType: "aurora" },

  // Material
  { tags: ["咖啡", "coffee", "cafe", "拿铁", "mocha"], colors: ["#1B0E04", "#3C2415", "#6F4E37", "#A67B5B", "#D4B59E"], artType: "noiseField" },
  { tags: ["巧克力", "chocolate", "cocoa"], colors: ["#2C1608", "#4E2A0C", "#7B3F00", "#D2691E", "#FFDEAD"], artType: "noiseField" },
  { tags: ["薰衣草", "lavender", "紫", "purple", "violet"], colors: ["#1A0A2E", "#2D1B69", "#7B68AE", "#B39DDB", "#E1D5F0"], artType: "metaball" },
  { tags: ["薄荷", "mint", "清凉"], colors: ["#E0F7F1", "#A7E8D0", "#66CDAA", "#3CB371", "#1B5E3A"], artType: "terrain" },
  { tags: ["沙漠", "desert", "sand", "大地", "earth"], colors: ["#F5E6CA", "#D4A76A", "#B87333", "#8B6914", "#3D2B1F"], artType: "terrain" },

  // Color Hunt Popular
  { tags: ["珊瑚", "coral", "甜", "少女", "粉"], colors: ["#F57799", "#FB9B8F", "#FDC3A1", "#FFF7CD", "#F4B6C2"], artType: "metaball" },
  { tags: ["天空", "sky", "蓝", "blue", "清新"], colors: ["#F7F8F0", "#9CD5FF", "#7AAACE", "#355872", "#B3C7E6"], artType: "ink" },
  { tags: ["热带", "tropical", "海洋", "蓝绿"], colors: ["#F6E7BC", "#0AC4E0", "#0992C2", "#0B2D72", "#45B7D1"], artType: "terrain" },
  { tags: ["茶", "tea", "自然", "素雅"], colors: ["#7EACB5", "#FFF4EA", "#EDDCC6", "#BF4646", "#D4C5B2"], artType: "noiseField" },
  { tags: ["大地", "earth", "亚麻", "linen", "素"], colors: ["#DBCDA5", "#ECEDE7", "#8E977D", "#8A7650", "#A89882"], artType: "noiseField" },
  { tags: ["红", "red", "热情", "passion"], colors: ["#FFA4A4", "#FF7070", "#EB4C4C", "#E8F5D3", "#FFD5D5"], artType: "aurora" },
  { tags: ["抹茶", "matcha", "绿", "清新"], colors: ["#6D9E51", "#BCD9A2", "#FEFFD3", "#A82323", "#E8F5E9"], artType: "terrain" },
  { tags: ["奶油", "cream", "米", "beige", "素雅"], colors: ["#F8F3E1", "#E3DBB7", "#AEBB84", "#41431B", "#D4C5B2"], artType: "noiseField" },
  { tags: ["渐变", "gradient", "橙", "orange", "能量"], colors: ["#FFA47F", "#FF52A0", "#B500B2", "#8100D1", "#FF7E5F"], artType: "aurora" },
  { tags: ["橙", "orange", "活力", "阳光"], colors: ["#FF5F00", "#FF8C00", "#FFC300", "#FFD400", "#FFE0B2"], artType: "aurora" },
  { tags: ["紫粉", "purple", "pink", "梦幻", "fairy"], colors: ["#FFDBFB", "#C9BEFF", "#8494FF", "#6367FF", "#C49AE8"], artType: "metaball" },
  { tags: ["都市", "urban", "灰", "city", "中性"], colors: ["#D3DAD9", "#715A5A", "#44444E", "#37353E", "#4A4A6A"], artType: "ink" },
  { tags: ["暗粉", "pink", "dark", "玫瑰"], colors: ["#EF88AD", "#A53860", "#670D2F", "#3A0519", "#C2185B"], artType: "metaball" },
  { tags: ["沙岩", "sandstone", "质感", "high-end"], colors: ["#DFD0C0", "#948979", "#393E46", "#222831", "#D4C5B2"], artType: "ink" },
  { tags: ["晚霞", "dusk", "暖", "brown", "紫"], colors: ["#DCA06D", "#A55B4B", "#4F1C51", "#210F37", "#B36A5E"], artType: "noiseField" },
  { tags: ["琥珀", "amber", "dark", "高级"], colors: ["#FFCC00", "#EB5B00", "#B12C00", "#640D5F", "#D4AF37"], artType: "crystal" },
  { tags: ["暗翠", "teal", "dark", "宝石"], colors: ["#320A6B", "#065084", "#0F828C", "#78B9B9", "#2EC4B6"], artType: "terrain" },
  { tags: ["密林", "deep forest", "绿", "幽"], colors: ["#1F7D53", "#255F38", "#27391C", "#18230F", "#2D5016"], artType: "noiseField" },
];

function findPalette(text: string): CuratedPalette {
  let best: CuratedPalette | null = null;
  let bestScore = 0;
  for (const p of PALETTES) {
    let score = 0;
    for (const tag of p.tags) { if (text.includes(tag)) score += tag.length; }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  if (!best) {
    const hash = text.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    best = PALETTES[hash % PALETTES.length];
  }
  return best;
}

// ---- Color Utils ----
function hexToRGB(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRGB(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRGB(c1);
  const [r2, g2, b2] = hexToRGB(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

// ---- Art Renderers ----

// 1. Noise Flow Field — organic ink strokes following simplex noise
function renderNoiseField(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, colors[0]);
  bg.addColorStop(1, lerpColor(colors[0], colors[1], 0.3));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const particles = 800;
  const steps = 120;

  for (let i = 0; i < particles; i++) {
    let x = Math.random() * w;
    let y = Math.random() * h;
    const ci = 1 + (i % 4);
    const lineWidth = 0.5 + Math.random() * 1.5;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = rgba(colors[ci], 0.03 + Math.random() * 0.06);
    ctx.lineWidth = lineWidth;

    for (let s = 0; s < steps; s++) {
      const angle = noise.noise2D(x * 0.003, y * 0.003) * Math.PI * 2;
      x += Math.cos(angle) * 1.5;
      y += Math.sin(angle) * 1.5;
      ctx.lineTo(x, y);
      if (x < -10 || x > w + 10 || y < -10 || y > h + 10) break;
    }
    ctx.stroke();
  }
}

// 2. Metaball — soft organic blobs that appear to merge
function renderMetaball(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const bgRgb = hexToRGB(colors[0]);

  const blobs = [];
  for (let i = 0; i < 8; i++) {
    blobs.push({
      x: w * (0.15 + Math.random() * 0.7),
      y: h * (0.15 + Math.random() * 0.7),
      r: 60 + Math.random() * 120,
      ci: 1 + (i % 4),
    });
  }

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      let sum = 0;
      let cr = 0, cg = 0, cb = 0, totalWeight = 0;

      for (const blob of blobs) {
        const dx = px - blob.x;
        const dy = py - blob.y;
        const distSq = dx * dx + dy * dy;
        const influence = (blob.r * blob.r) / (distSq + 1);
        sum += influence;

        if (influence > 0.01) {
          const [r, g, b] = hexToRGB(colors[blob.ci]);
          cr += r * influence;
          cg += g * influence;
          cb += b * influence;
          totalWeight += influence;
        }
      }

      const idx = (py * w + px) * 4;
      if (sum > 1.0) {
        const t = Math.min((sum - 1.0) * 0.8, 1.0);
        if (totalWeight > 0) {
          data[idx] = Math.round(bgRgb[0] * (1 - t) + (cr / totalWeight) * t);
          data[idx + 1] = Math.round(bgRgb[1] * (1 - t) + (cg / totalWeight) * t);
          data[idx + 2] = Math.round(bgRgb[2] * (1 - t) + (cb / totalWeight) * t);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add subtle noise texture overlay
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const n = noise.noise2D(x * 0.01, y * 0.01);
    ctx.fillStyle = rgba(n > 0 ? colors[4] : colors[1], 0.015);
    ctx.fillRect(x, y, 1, 1);
  }
}

// 3. Aurora — layered glowing curtains
function renderAurora(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  // Deep background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, lerpColor(colors[0], "#000000", 0.5));
  bg.addColorStop(1, colors[0]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Aurora layers
  for (let layer = 0; layer < 5; layer++) {
    const ci = 1 + (layer % 4);
    ctx.beginPath();

    const yBase = h * (0.2 + layer * 0.1);
    const amplitude = 40 + layer * 15;

    for (let x = 0; x <= w; x += 2) {
      const n1 = noise.noise2D(x * 0.003 + layer * 10, layer * 5) * amplitude;
      const n2 = noise.noise2D(x * 0.008 + layer * 20, layer * 3) * amplitude * 0.5;
      const y = yBase + n1 + n2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Close at bottom for gradient fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, yBase + amplitude * 2);
    grad.addColorStop(0, rgba(colors[ci], 0));
    grad.addColorStop(0.3, rgba(colors[ci], 0.12 - layer * 0.015));
    grad.addColorStop(0.6, rgba(colors[ci], 0.06));
    grad.addColorStop(1, rgba(colors[ci], 0));
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Vertical light rays
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * w;
    const ci = 1 + (i % 4);
    const rayW = 2 + Math.random() * 6;
    const grad = ctx.createLinearGradient(x, 0, x, h * 0.7);
    grad.addColorStop(0, rgba(colors[ci], 0.08));
    grad.addColorStop(0.5, rgba(colors[ci], 0.03));
    grad.addColorStop(1, rgba(colors[ci], 0));
    ctx.fillStyle = grad;
    ctx.fillRect(x - rayW / 2, 0, rayW, h * 0.7);
  }
}

// 4. Ink — watercolor-like diffusion
function renderInk(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);

  // Large washes
  for (let wash = 0; wash < 6; wash++) {
    const cx = w * (0.2 + Math.random() * 0.6);
    const cy = h * (0.2 + Math.random() * 0.6);
    const ci = 1 + (wash % 4);
    const maxR = 100 + Math.random() * 150;

    for (let r = maxR; r > 5; r -= 3) {
      const alpha = (0.01 + Math.random() * 0.02) * (r / maxR);
      const offsetX = noise.noise2D(r * 0.05, wash * 10) * 20;
      const offsetY = noise.noise2D(wash * 10, r * 0.05) * 20;
      ctx.fillStyle = rgba(colors[ci], alpha);
      ctx.beginPath();

      // Organic shape using noise-deformed circle
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const noiseR = r + noise.noise2D(Math.cos(a) * 2 + wash, Math.sin(a) * 2 + r * 0.01) * r * 0.3;
        const px = cx + offsetX + Math.cos(a) * noiseR;
        const py = cy + offsetY + Math.sin(a) * noiseR;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Spatter
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const ci = 1 + (i % 4);
    const r = 0.5 + Math.random() * 2;
    ctx.fillStyle = rgba(colors[ci], 0.05 + Math.random() * 0.1);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 5. Terrain — noise-based topographic layers
function renderTerrain(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const scale = 0.004;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const n = (noise.noise2D(px * scale, py * scale) + 1) / 2;
      const n2 = (noise.noise2D(px * scale * 3, py * scale * 3) + 1) / 2;
      const val = n * 0.7 + n2 * 0.3;

      // Map to color bands
      let ci1: number, ci2: number, t: number;
      if (val < 0.2) { ci1 = 0; ci2 = 1; t = val / 0.2; }
      else if (val < 0.4) { ci1 = 1; ci2 = 2; t = (val - 0.2) / 0.2; }
      else if (val < 0.6) { ci1 = 2; ci2 = 3; t = (val - 0.4) / 0.2; }
      else if (val < 0.8) { ci1 = 3; ci2 = 4; t = (val - 0.6) / 0.2; }
      else { ci1 = 4; ci2 = 4; t = 1; }

      const [r1, g1, b1] = hexToRGB(colors[ci1]);
      const [r2, g2, b2] = hexToRGB(colors[ci2]);
      const idx = (py * w + px) * 4;
      data[idx] = Math.round(r1 + (r2 - r1) * t);
      data[idx + 1] = Math.round(g1 + (g2 - g1) * t);
      data[idx + 2] = Math.round(b1 + (b2 - b1) * t);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Contour lines
  for (let level = 0; level < 8; level++) {
    const threshold = level / 8;
    ctx.strokeStyle = rgba(colors[4], 0.06);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      for (let y = 0; y < h; y += 3) {
        const n = (noise.noise2D(x * scale, y * scale) + 1) / 2;
        if (Math.abs(n - threshold) < 0.008) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 1, y + 1);
        }
      }
    }
    ctx.stroke();
  }
}

// 6. Crystal — geometric facets with noise-based Voronoi-like cells
function renderCrystal(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) {
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);

  // Generate seed points
  const points: { x: number; y: number; ci: number }[] = [];
  const cellSize = 60;
  for (let gx = 0; gx < w + cellSize; gx += cellSize) {
    for (let gy = 0; gy < h + cellSize; gy += cellSize) {
      points.push({
        x: gx + (noise.noise2D(gx * 0.01, gy * 0.01) + 1) * cellSize * 0.4,
        y: gy + (noise.noise2D(gy * 0.01, gx * 0.01) + 1) * cellSize * 0.4,
        ci: Math.floor((noise.noise2D(gx * 0.005, gy * 0.005) + 1) * 2.5),
      });
    }
  }

  // Pixel-level Voronoi
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      let minDist = Infinity;
      let secondDist = Infinity;
      let closestCI = 0;

      for (const pt of points) {
        const dx = px - pt.x;
        const dy = py - pt.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          secondDist = minDist;
          minDist = dist;
          closestCI = pt.ci;
        } else if (dist < secondDist) {
          secondDist = dist;
        }
      }

      const edge = Math.sqrt(secondDist) - Math.sqrt(minDist);
      const [r, g, b] = hexToRGB(colors[closestCI]);
      const idx = (py * w + px) * 4;

      // Facet shading with noise
      const shade = 0.85 + noise.noise2D(px * 0.02, py * 0.02) * 0.15;

      if (edge < 2) {
        // Edge highlight
        const [er, eg, eb] = hexToRGB(colors[4]);
        const t = edge / 2;
        data[idx] = Math.round(er * (1 - t) + r * shade * t);
        data[idx + 1] = Math.round(eg * (1 - t) + g * shade * t);
        data[idx + 2] = Math.round(eb * (1 - t) + b * shade * t);
      } else {
        data[idx] = Math.round(r * shade);
        data[idx + 1] = Math.round(g * shade);
        data[idx + 2] = Math.round(b * shade);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

const RENDERERS: Record<CuratedPalette["artType"], (ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], noise: SimplexNoise) => void> = {
  noiseField: renderNoiseField,
  metaball: renderMetaball,
  aurora: renderAurora,
  ink: renderInk,
  terrain: renderTerrain,
  crystal: renderCrystal,
};

// ---- Canvas Component ----
function ArtCanvas({ palette }: { palette: CuratedPalette }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const seed = palette.colors.join("").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const noise = new SimplexNoise(seed);

    const render = RENDERERS[palette.artType];
    render(ctx, w, h, palette.colors, noise);
  }, [palette]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }} />;
}

// ---- Main ----
export default function MoodPalette() {
  const [text, setText] = useState("");
  const [palette, setPalette] = useState<CuratedPalette | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = () => { if (text.trim()) setPalette(findPalette(text.trim())); };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = () => {
    if (!palette) return;
    navigator.clipboard?.writeText(palette.colors.join(", "));
    setCopied("all");
    setTimeout(() => setCopied(null), 1200);
  };

  if (!palette) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "1rem", color: "rgba(255,250,240,0.45)", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>情绪调色板</p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,250,240,0.18)", letterSpacing: "0.12em", marginBottom: "3rem" }}>MOOD PALETTE</p>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="深海、温柔、科技感、咖啡、莫兰迪..." autoFocus
          style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,250,240,0.12)", color: "rgba(255,250,240,0.7)", fontFamily: "'Noto Serif SC', serif", fontSize: "1rem", fontWeight: 300, padding: "0.75rem 0", width: "min(80vw, 420px)", textAlign: "center", outline: "none" }} />
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,250,240,0.1)", marginTop: "2rem" }}>press enter</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ArtCanvas palette={palette} />
      <div style={{ position: "fixed", top: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,250,240,0.3)", letterSpacing: "0.1em" }}>{text}</p>
      </div>
      <div style={{ position: "fixed", bottom: "4rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", zIndex: 10 }}>
        {palette.colors.map((hex, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
            <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: hex, border: "1px solid rgba(255,255,255,0.08)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.25)", marginTop: "4px" }}>{copied === hex ? "✓" : hex}</p>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "2rem", zIndex: 10 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,250,240,0.2)", cursor: "pointer" }} onClick={() => { setPalette(null); setText(""); }}>new</p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,250,240,0.2)", cursor: "pointer" }} onClick={copyAll}>{copied === "all" ? "✓ copied" : "copy all"}</p>
      </div>
    </div>
  );
}
