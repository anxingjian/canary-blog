"use client";

import { useState, useRef, useEffect } from "react";

// ---- Simplex Noise ----
class SimplexNoise {
  private grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  private perm: number[] = [];
  private gradP: number[][] = [];
  constructor(seed = 0) {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512); this.gradP = new Array(512);
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed); if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = (i & 1) ? p[i] ^ (seed & 255) : p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  noise2D(x: number, y: number): number {
    const F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
    const s = (x+y)*F2, i = Math.floor(x+s), j = Math.floor(y+s);
    const t = (i+j)*G2, x0 = x-i+t, y0 = y-j+t;
    const i1 = x0>y0?1:0, j1 = x0>y0?0:1;
    const x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
    const ii=i&255, jj=j&255;
    const gi0=this.gradP[ii+this.perm[jj]], gi1=this.gradP[ii+i1+this.perm[jj+j1]], gi2=this.gradP[ii+1+this.perm[jj+1]];
    let n0=0,n1=0,n2=0;
    let t0=0.5-x0*x0-y0*y0; if(t0>=0){t0*=t0;n0=t0*t0*(gi0[0]*x0+gi0[1]*y0)}
    let t1=0.5-x1*x1-y1*y1; if(t1>=0){t1*=t1;n1=t1*t1*(gi1[0]*x1+gi1[1]*y1)}
    let t2=0.5-x2*x2-y2*y2; if(t2>=0){t2*=t2;n2=t2*t2*(gi2[0]*x2+gi2[1]*y2)}
    return 70*(n0+n1+n2);
  }
}

function hexToRGB(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// ---- Painting Data ----
interface Painting {
  id: string;
  title: string;
  titleEn: string;
  artist: string;
  year: string;
  colors: string[];
  interpretation: string;
  thumb: string;
  aspect: "landscape" | "portrait" | "square";
}

const PAINTINGS: Painting[] = [
  {
    id: "starry-night",
    title: "星月夜",
    titleEn: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    colors: ["#0B1D3A", "#1A3A6B", "#2E6B9E", "#E8C840", "#F5E8A0"],
    interpretation: "不是看见的夜空，是感受到的。每颗星都在旋转，像思绪不肯安静。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    aspect: "landscape",
  },
  {
    id: "great-wave",
    title: "神奈川冲浪里",
    titleEn: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "1831",
    colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"],
    interpretation: "巨浪不是在摧毁什么。它只是在做它自己——而人类恰好在那里。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/300px-Tsunami_by_hokusai_19th_century.jpg",
    aspect: "landscape",
  },
  {
    id: "nighthawks",
    title: "夜鹰",
    titleEn: "Nighthawks",
    artist: "Edward Hopper",
    year: "1942",
    colors: ["#0A0F0A", "#1C3A28", "#4A7A5C", "#D4A030", "#F0E8C8"],
    interpretation: "城市里最孤独的灯光，不在暗处，在那个唯一亮着的窗里。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/300px-Nighthawks_by_Edward_Hopper_1942.jpg",
    aspect: "landscape",
  },
  {
    id: "water-lilies",
    title: "睡莲",
    titleEn: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    colors: ["#2A4A3A", "#4A7A6A", "#7AAA8A", "#B8A0D0", "#D8C8E0"],
    interpretation: "他画的不是莲。是水面上世界的倒影——模糊的、流动的、不确定的美。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/300px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    aspect: "landscape",
  },
  {
    id: "the-scream",
    title: "呐喊",
    titleEn: "The Scream",
    artist: "Edvard Munch",
    year: "1893",
    colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"],
    interpretation: "整个世界都在替他叫。天空在叫，水在叫，只有他自己是沉默的。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/220px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    aspect: "portrait",
  },
  {
    id: "pearl-earring",
    title: "戴珍珠耳环的少女",
    titleEn: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "1665",
    colors: ["#0A0A0A", "#1A2A4A", "#3A5A8A", "#D4B870", "#F0E8D0"],
    interpretation: "一颗珍珠就够了。整幅画的光都为了那一个亮点存在。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/220px-1665_Girl_with_a_Pearl_Earring.jpg",
    aspect: "portrait",
  },
  {
    id: "impression-sunrise",
    title: "日出·印象",
    titleEn: "Impression, Sunrise",
    artist: "Claude Monet",
    year: "1872",
    colors: ["#4A5A6A", "#6A7A8A", "#8A9AAA", "#E05A20", "#F08040"],
    interpretation: "给一个流派命名的画。所有的精确都让位于一瞬间的感觉。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/300px-Monet_-_Impression%2C_Sunrise.jpg",
    aspect: "landscape",
  },
  {
    id: "the-kiss",
    title: "吻",
    titleEn: "The Kiss",
    artist: "Gustav Klimt",
    year: "1908",
    colors: ["#1A1A10", "#6A5A20", "#B8982D", "#D4AF37", "#F0E8B0"],
    interpretation: "金箔不是装饰，是铠甲。两个人裹在金色的壳里，拒绝被外面的世界看见。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/220px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    aspect: "portrait",
  },
  {
    id: "persistence-memory",
    title: "记忆的永恒",
    titleEn: "The Persistence of Memory",
    artist: "Salvador Dalí",
    year: "1931",
    colors: ["#1A2A3A", "#5A7A6A", "#B8A870", "#D4C090", "#E8D8B0"],
    interpretation: "时间不是流逝的——它是融化的。在午后的热浪里，什么都撑不住原来的形状。",
    thumb: "https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/The_Persistence_of_Memory.jpg/300px-The_Persistence_of_Memory.jpg",
    aspect: "landscape",
  },
  {
    id: "wanderer-sea-fog",
    title: "雾海上的旅人",
    titleEn: "Wanderer above the Sea of Fog",
    artist: "Caspar David Friedrich",
    year: "1818",
    colors: ["#2A3040", "#5A6A7A", "#8A9AAA", "#B0B8C0", "#D8D8D0"],
    interpretation: "背对观众，面朝虚无。他不是在征服什么，是在承认自己的渺小。",
    thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/220px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    aspect: "portrait",
  },
];

// ---- Salon Wall Layout ----
// Pre-defined positions for salon-style hanging (percentage-based)
const WALL_POSITIONS = [
  // row 1 (top) - smaller paintings
  { left: 5, top: 4, w: 18, rot: -1.5 },
  { left: 28, top: 2, w: 14, rot: 0.8 },
  { left: 55, top: 5, w: 20, rot: -0.5 },
  { left: 80, top: 3, w: 15, rot: 1.2 },
  // row 2 (middle) - larger, more prominent
  { left: 2, top: 32, w: 22, rot: 0.3 },
  { left: 30, top: 28, w: 26, rot: -0.8 },
  { left: 62, top: 30, w: 18, rot: 0.6 },
  // row 3 (bottom)
  { left: 10, top: 60, w: 20, rot: -0.4 },
  { left: 38, top: 62, w: 24, rot: 1.0 },
  { left: 70, top: 58, w: 16, rot: -1.2 },
];

// ---- p5 Sketch Functions ----
type SketchFn = (p: any, w: number, h: number, colors: string[], noise: SimplexNoise) => void;

// Starry Night — swirling vortices
function sketchStarryNight(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const particles: { x: number; y: number; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    const [r, g, b] = hexToRGB(colors[0]);
    p.background(r, g, b);
    for (let i = 0; i < 800; i++) particles.push({ x: p.random(w), y: p.random(h), ci: 1 + (i % 4) });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]);
    p.fill(br, bg, bb, 2); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.002;
    for (const pt of particles) {
      // Swirl effect: add circular motion to noise
      const cx = w * 0.5, cy = h * 0.4;
      const dx = pt.x - cx, dy = pt.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const swirl = Math.atan2(dy, dx) + 0.3 / (dist * 0.01 + 1);
      const angle = noise.noise2D(pt.x * 0.004, pt.y * 0.004 + t) * Math.PI * 2 + swirl * 0.3;
      const prevX = pt.x, prevY = pt.y;
      pt.x += Math.cos(angle) * 2; pt.y += Math.sin(angle) * 2;
      const [r, g, b] = hexToRGB(colors[pt.ci]);
      p.stroke(r, g, b, 50); p.strokeWeight(1.2);
      p.line(prevX, prevY, pt.x, pt.y);
      if (pt.x < -5 || pt.x > w + 5 || pt.y < -5 || pt.y > h + 5) { pt.x = p.random(w); pt.y = p.random(h); }
    }
    // Stars
    if (p.frameCount % 4 === 0) {
      const [r, g, b] = hexToRGB(colors[3]);
      p.noStroke(); p.fill(r, g, b, 60 + Math.random() * 60);
      p.circle(p.random(w), p.random(h * 0.5), 2 + Math.random() * 3);
    }
  };
}

// Great Wave — particle wave crashing
function sketchGreatWave(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.01;
    // Wave layers
    for (let layer = 0; layer < 4; layer++) {
      const ci = 1 + layer;
      const [r, g, b] = hexToRGB(colors[ci]);
      p.noStroke(); p.fill(r, g, b, 40 + layer * 15);
      p.beginShape();
      const yBase = h * (0.35 + layer * 0.12);
      for (let x = 0; x <= w; x += 2) {
        const wave = Math.sin(x * 0.008 - t + layer) * 40;
        const n = noise.noise2D(x * 0.005 + layer * 5, t * 0.5 + layer) * 50;
        // Curling wave peak
        const peak = Math.max(0, Math.sin(x * 0.003 - t * 1.5) * 30 - 10);
        p.vertex(x, yBase + wave + n - peak);
      }
      p.vertex(w, h); p.vertex(0, h); p.endShape(p.CLOSE);
    }
    // Foam/spray particles
    for (let i = 0; i < 5; i++) {
      const x = p.random(w);
      const yBase = h * 0.35 + Math.sin(x * 0.008 - t) * 40 + noise.noise2D(x * 0.005, t * 0.5) * 50;
      const [r, g, b] = hexToRGB(colors[4]);
      p.fill(r, g, b, 30 + p.random(50)); p.noStroke();
      p.circle(x, yBase - p.random(20), 1 + p.random(3));
    }
  };
}

// Nighthawks — light from a window in darkness
function sketchNighthawks(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.005;
    // The window — a warm trapezoid of light
    const wx = w * 0.3, wy = h * 0.35, ww = w * 0.4, wh = h * 0.3;
    // Light spill
    for (let i = 60; i > 0; i--) {
      const [r, g, b] = hexToRGB(i > 30 ? colors[3] : colors[4]);
      const alpha = (1 - i / 60) * 6 + noise.noise2D(i * 0.1, t) * 1;
      p.fill(r, g, b, Math.max(alpha, 0)); p.noStroke();
      p.rect(wx - i * 2, wy - i * 1.5, ww + i * 4, wh + i * 3, 2);
    }
    // Window interior
    const [wr, wg, wb] = hexToRGB(colors[3]);
    p.fill(wr, wg, wb, 40); p.rect(wx, wy, ww, wh);
    // Interior glow variation
    const [gr, gg, gb] = hexToRGB(colors[4]);
    p.fill(gr, gg, gb, 15 + Math.sin(t * 2) * 5);
    p.rect(wx + 5, wy + 5, ww - 10, wh - 10);
    // Silhouettes
    for (let i = 0; i < 3; i++) {
      const sx = wx + ww * (0.25 + i * 0.25);
      const sy = wy + wh * 0.4;
      const [sr, sg, sb] = hexToRGB(colors[2]);
      p.fill(sr, sg, sb, 50); p.noStroke();
      p.ellipse(sx + noise.noise2D(i * 10, t) * 2, sy, 15, 25);
    }
    // Street-level darkness with subtle green tones
    const [dr, dg, db] = hexToRGB(colors[2]);
    for (let i = 0; i < 10; i++) {
      const x = p.random(w), y = h * 0.7 + p.random(h * 0.3);
      p.fill(dr, dg, db, 3); p.noStroke(); p.rect(x, y, p.random(50), 1);
    }
  };
}

// Water Lilies — floating color patches
function sketchWaterLilies(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const pads: { x: number; y: number; r: number; ci: number; phase: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 30; i++) {
      pads.push({ x: p.random(w), y: p.random(h), r: 20 + p.random(40), ci: 1 + (i % 4), phase: p.random(100) });
    }
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb, 20);
    // Subtle background with previous frame bleeding
    p.fill(br, bg, bb, 8); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.003;
    // Water ripples
    for (let y = 0; y < h; y += 8) {
      const [wr, wg, wb] = hexToRGB(colors[1]);
      const offset = noise.noise2D(y * 0.01, t) * 10;
      p.stroke(wr, wg, wb, 8); p.strokeWeight(0.5);
      p.line(offset, y, w + offset, y);
    }
    // Lily pads
    for (const pad of pads) {
      const nx = pad.x + noise.noise2D(pad.phase, t) * 3;
      const ny = pad.y + noise.noise2D(t, pad.phase) * 3;
      const [r, g, b] = hexToRGB(colors[pad.ci]);
      // Soft glow
      for (let ring = 3; ring > 0; ring--) {
        p.fill(r, g, b, 5 + ring * 2); p.noStroke();
        p.ellipse(nx, ny, pad.r + ring * 8, pad.r * 0.6 + ring * 5);
      }
      p.fill(r, g, b, 25); p.noStroke();
      p.ellipse(nx, ny, pad.r, pad.r * 0.6);
    }
  };
}

// The Scream — radiating distortion waves
function sketchScream(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.008;
    const cx = w * 0.5, cy = h * 0.45;
    // Radiating waves of color
    for (let r = Math.max(w, h); r > 5; r -= 4) {
      const ci = r % 20 < 10 ? (r % 8 < 4 ? 2 : 3) : (r % 8 < 4 ? 4 : 1);
      const [cr, cg, cb] = hexToRGB(colors[ci]);
      const distort = noise.noise2D(r * 0.02, t) * 15;
      const pulse = Math.sin(r * 0.03 - t * 3) * 5;
      p.noFill(); p.stroke(cr, cg, cb, 15 + Math.sin(r * 0.05 + t) * 8);
      p.strokeWeight(3);
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.1) {
        const nr = r + noise.noise2D(Math.cos(a) * 3, Math.sin(a) * 3 + t) * distort + pulse;
        p.vertex(cx + Math.cos(a) * nr, cy + Math.sin(a) * nr * 0.7);
      }
      p.endShape(p.CLOSE);
    }
  };
}

// Girl with Pearl Earring — single luminous point in darkness
function sketchPearlEarring(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.005;
    // Deep blue ambient
    for (let i = 0; i < 8; i++) {
      const [r, g, b] = hexToRGB(colors[2]);
      const x = w * (0.2 + noise.noise2D(i * 5, t * 0.3) * 0.6);
      const y = h * (0.2 + noise.noise2D(t * 0.3, i * 5) * 0.6);
      p.fill(r, g, b, 3); p.noStroke();
      p.ellipse(x, y, 200 + noise.noise2D(i, t) * 50, 200);
    }
    // The pearl — single radiant point
    const px = w * 0.55, py = h * 0.52;
    const breathe = Math.sin(t * 0.8) * 0.15 + 1;
    for (let r = 120; r > 0; r -= 2) {
      const ratio = r / 120;
      const [lr, lg, lb] = hexToRGB(ratio > 0.5 ? colors[3] : colors[4]);
      const alpha = (1 - ratio) * 20 * breathe;
      p.fill(lr, lg, lb, alpha); p.noStroke();
      p.circle(px, py, r * breathe);
    }
    // Core
    p.fill(255, 255, 250, 80); p.noStroke();
    p.circle(px, py, 8 * breathe);
  };
}

// Impression, Sunrise — pointillist dots forming
function sketchImpressionSunrise(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => {
    p.createCanvas(w, h);
    const [r, g, b] = hexToRGB(colors[0]);
    p.background(r, g, b);
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]);
    p.fill(br, bg, bb, 1); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.003;
    // Pointillist dots
    for (let i = 0; i < 20; i++) {
      const x = p.random(w), y = p.random(h);
      const n = noise.noise2D(x * 0.005 + t, y * 0.005);
      // Sun area gets warm colors
      const sunX = w * 0.5, sunY = h * 0.4;
      const distToSun = Math.sqrt((x - sunX) ** 2 + (y - sunY) ** 2);
      const isSunArea = distToSun < 80;
      const ci = isSunArea ? (n > 0 ? 3 : 4) : (n > 0.3 ? 1 : n > -0.3 ? 2 : 0);
      const [r, g, b] = hexToRGB(colors[ci]);
      const size = 2 + Math.abs(n) * 4;
      p.fill(r, g, b, 20 + Math.abs(n) * 30); p.noStroke();
      p.circle(x, y, size);
    }
  };
}

// The Kiss — golden particle rain, two forms
function sketchTheKiss(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const golds: { x: number; y: number; vy: number; size: number; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 200; i++) {
      golds.push({ x: p.random(w), y: p.random(h), vy: 0.2 + p.random(0.8), size: 1 + p.random(4), ci: 2 + (i % 3) });
    }
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]);
    p.fill(br, bg, bb, 6); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.005;
    // Two merging forms in center
    const cx1 = w * 0.45, cy1 = h * 0.45;
    const cx2 = w * 0.55, cy2 = h * 0.48;
    for (let r = 100; r > 0; r -= 3) {
      const [cr, cg, cb] = hexToRGB(colors[r % 6 < 3 ? 3 : 4]);
      const breathe = Math.sin(t * 0.5) * 3;
      p.fill(cr, cg, cb, 3); p.noStroke();
      p.ellipse(cx1, cy1 + breathe, r * 1.2, r * 1.8);
      p.ellipse(cx2, cy2 - breathe, r * 1.1, r * 1.7);
    }
    // Falling gold
    for (const g of golds) {
      g.y += g.vy;
      g.x += noise.noise2D(g.x * 0.01, t) * 0.5;
      if (g.y > h + 5) { g.y = -5; g.x = p.random(w); }
      const [r, gg, b] = hexToRGB(colors[g.ci]);
      p.fill(r, gg, b, 30 + Math.sin(g.y * 0.02 + t) * 15); p.noStroke();
      p.rect(g.x, g.y, g.size, g.size);
    }
  };
}

// Persistence of Memory — melting forms
function sketchPersistenceMemory(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.004;
    // Horizon
    const horizonY = h * 0.55;
    // Sky
    for (let y = 0; y < horizonY; y++) {
      const ratio = y / horizonY;
      const [r1, g1, b1] = hexToRGB(colors[0]);
      const [r2, g2, b2] = hexToRGB(colors[3]);
      p.stroke(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio, 40);
      p.line(0, y, w, y);
    }
    // Ground
    for (let y = horizonY; y < h; y++) {
      const ratio = (y - horizonY) / (h - horizonY);
      const [r1, g1, b1] = hexToRGB(colors[2]);
      const [r2, g2, b2] = hexToRGB(colors[4]);
      p.stroke(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio, 30);
      p.line(0, y, w, y);
    }
    // Melting clock shapes
    for (let c = 0; c < 3; c++) {
      const cx = w * (0.25 + c * 0.25);
      const cy = horizonY + 10;
      const [cr, cg, cb] = hexToRGB(colors[3 + (c % 2)]);
      p.noFill(); p.stroke(cr, cg, cb, 30); p.strokeWeight(2);
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.05) {
        const baseR = 30 + c * 5;
        // Melt: bottom part droops
        const melt = a > Math.PI * 0.3 && a < Math.PI * 1.7 ? Math.sin((a - Math.PI * 0.3) / 1.4 * Math.PI) * 25 * (1 + Math.sin(t + c)) : 0;
        const nr = baseR + noise.noise2D(a * 2 + c * 10, t) * 8 + melt;
        p.vertex(cx + Math.cos(a) * nr, cy + Math.sin(a) * nr * 0.6 + melt * 0.5);
      }
      p.endShape(p.CLOSE);
    }
  };
}

// Wanderer — fog layers and solitude
function sketchWanderer(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.003;
    // Layered fog from bottom to top
    for (let layer = 6; layer >= 0; layer--) {
      const ci = Math.min(layer + 1, 4);
      const [r, g, b] = hexToRGB(colors[ci]);
      const yBase = h * (0.3 + layer * 0.08);
      p.noStroke();
      p.beginShape();
      for (let x = -10; x <= w + 10; x += 3) {
        const n = noise.noise2D(x * 0.003 + layer * 10, t + layer * 2) * (30 + layer * 10);
        p.vertex(x, yBase + n);
      }
      p.vertex(w + 10, h); p.vertex(-10, h); p.endShape(p.CLOSE);
      p.fill(r, g, b, 12 + layer * 3);
      p.beginShape();
      for (let x = -10; x <= w + 10; x += 3) {
        const n = noise.noise2D(x * 0.003 + layer * 10, t + layer * 2) * (30 + layer * 10);
        p.vertex(x, yBase + n);
      }
      p.vertex(w + 10, h); p.vertex(-10, h); p.endShape(p.CLOSE);
    }
    // Solitary figure silhouette (small, center-top)
    const fx = w * 0.5, fy = h * 0.28;
    p.fill(20, 20, 25, 60); p.noStroke();
    p.rect(fx - 3, fy, 6, 18); // body
    p.circle(fx, fy - 2, 8); // head
  };
}

const SKETCH_MAP: Record<string, SketchFn> = {
  "starry-night": sketchStarryNight,
  "great-wave": sketchGreatWave,
  "nighthawks": sketchNighthawks,
  "water-lilies": sketchWaterLilies,
  "the-scream": sketchScream,
  "pearl-earring": sketchPearlEarring,
  "impression-sunrise": sketchImpressionSunrise,
  "the-kiss": sketchTheKiss,
  "persistence-memory": sketchPersistenceMemory,
  "wanderer-sea-fog": sketchWanderer,
};

// ---- p5 Canvas ----
function P5Canvas({ painting }: { painting: Painting }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    import("p5").then((mod) => {
      const p5 = mod.default;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const seed = painting.colors.join("").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const noise = new SimplexNoise(seed);
      const sketchFn = SKETCH_MAP[painting.id];
      if (!sketchFn) return;
      p5Ref.current = new p5((p: any) => { sketchFn(p, w, h, painting.colors, noise); }, containerRef.current!);
    });
    return () => { if (p5Ref.current) { p5Ref.current.remove(); p5Ref.current = null; } };
  }, [painting]);

  return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}

// ---- Gallery Wall ----
function GalleryWall({ onSelect }: { onSelect: (p: Painting) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{
      width: "100vw", minHeight: "100vh", background: "#111010",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='6' height='6' fill='%23111010'/%3E%3Crect width='1' height='1' x='2' y='2' fill='%23161414' opacity='0.3'/%3E%3C/svg%3E\")",
      position: "relative", overflow: "hidden",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", paddingTop: "min(6vh, 40px)", marginBottom: "min(2vh, 16px)" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)", color: "rgba(255,250,240,0.25)", letterSpacing: "0.3em" }}>
          名 画 · 意 象
        </p>
      </div>

      {/* Salon wall */}
      <div style={{ position: "relative", width: "92vw", maxWidth: "1100px", margin: "0 auto", height: "max(80vh, 600px)" }}>
        {PAINTINGS.map((painting, i) => {
          const pos = WALL_POSITIONS[i];
          const isHovered = hoveredId === painting.id;
          const frameW = `${pos.w}%`;

          return (
            <div
              key={painting.id}
              style={{
                position: "absolute",
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: frameW,
                transform: `rotate(${pos.rot}deg) scale(${isHovered ? 1.05 : 1})`,
                cursor: "pointer",
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
                zIndex: isHovered ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredId(painting.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(painting)}
            >
              {/* Frame */}
              <div style={{
                background: "#2A2218",
                padding: "clamp(4px, 0.8vw, 10px)",
                borderRadius: "1px",
                boxShadow: isHovered
                  ? "0 8px 30px rgba(0,0,0,0.7), 0 0 15px rgba(212,175,55,0.15)"
                  : "0 4px 15px rgba(0,0,0,0.5)",
                border: "1px solid rgba(180,160,120,0.15)",
                transition: "box-shadow 0.4s ease",
              }}>
                {/* Inner mat */}
                <div style={{
                  background: "#1A1610",
                  padding: "clamp(2px, 0.4vw, 5px)",
                }}>
                  {/* Image */}
                  <div style={{
                    width: "100%",
                    aspectRatio: painting.aspect === "portrait" ? "3/4" : painting.aspect === "square" ? "1/1" : "4/3",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={painting.thumb}
                      alt={painting.title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        filter: isHovered ? "brightness(1.1)" : "brightness(0.85) saturate(0.9)",
                        transition: "filter 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div style={{
                textAlign: "center", marginTop: "clamp(4px, 0.6vw, 8px)",
                opacity: isHovered ? 0.7 : 0.25,
                transition: "opacity 0.4s ease",
              }}>
                <p style={{
                  fontFamily: "'Noto Serif SC', serif", fontWeight: 300,
                  fontSize: "clamp(0.45rem, 0.8vw, 0.65rem)",
                  color: "rgba(255,250,240,0.7)",
                  letterSpacing: "0.08em",
                }}>{painting.title}</p>
                <p style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "clamp(0.35rem, 0.6vw, 0.5rem)",
                  color: "rgba(255,250,240,0.4)",
                  marginTop: "1px",
                }}>{painting.artist}, {painting.year}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Art View ----
function ArtView({ painting, onBack }: { painting: Painting; onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <P5Canvas painting={painting} />

      {/* Top info */}
      <div style={{ position: "fixed", top: "2rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center", maxWidth: "80vw" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)", color: "rgba(255,250,240,0.35)", letterSpacing: "0.1em" }}>
          {painting.title}
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(0.5rem, 0.7vw, 0.6rem)", color: "rgba(255,250,240,0.18)", marginTop: "4px" }}>
          {painting.artist}, {painting.year}
        </p>
      </div>

      {/* Interpretation */}
      <div style={{ position: "fixed", bottom: "7rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center", maxWidth: "min(80vw, 500px)" }}>
        <p style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "clamp(0.65rem, 1vw, 0.8rem)", color: "rgba(255,250,240,0.3)", lineHeight: "1.8", letterSpacing: "0.05em" }}>
          {painting.interpretation}
        </p>
      </div>

      {/* Color swatches */}
      <div style={{ position: "fixed", bottom: "3.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", zIndex: 10 }}>
        {painting.colors.map((hex, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => copyHex(hex)}>
            <div style={{ width: "40px", height: "40px", borderRadius: "4px", background: hex, border: "1px solid rgba(255,255,255,0.08)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", color: copied === hex ? "rgba(255,250,240,0.6)" : "rgba(255,250,240,0.2)", marginTop: "3px" }}>
              {copied === hex ? "✓" : hex}
            </p>
          </div>
        ))}
      </div>

      {/* Back */}
      <div style={{ position: "fixed", bottom: "1.2rem", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,250,240,0.2)", cursor: "pointer", letterSpacing: "0.1em" }} onClick={onBack}>
          ← back
        </p>
      </div>
    </div>
  );
}

// ---- Main ----
export default function Gallery() {
  const [selected, setSelected] = useState<Painting | null>(null);

  if (selected) {
    return <ArtView painting={selected} onBack={() => setSelected(null)} />;
  }

  return <GalleryWall onSelect={setSelected} />;
}
