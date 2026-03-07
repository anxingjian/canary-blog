"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
  aspect: number; // w/h ratio
}

const PAINTINGS: Painting[] = [
  { id: "starry-night", title: "星月夜", titleEn: "The Starry Night", artist: "Vincent van Gogh", year: "1889", colors: ["#0B1D3A", "#1A3A6B", "#2E6B9E", "#E8C840", "#F5E8A0"], interpretation: "不是看见的夜空，是感受到的。每颗星都在旋转，像思绪不肯安静。", aspect: 1.25 },
  { id: "great-wave", title: "神奈川冲浪里", titleEn: "The Great Wave off Kanagawa", artist: "Katsushika Hokusai", year: "1831", colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"], interpretation: "巨浪不是在摧毁什么。它只是在做它自己——而人类恰好在那里。", aspect: 1.5 },
  { id: "nighthawks", title: "夜鹰", titleEn: "Nighthawks", artist: "Edward Hopper", year: "1942", colors: ["#0A0F0A", "#1C3A28", "#4A7A5C", "#D4A030", "#F0E8C8"], interpretation: "城市里最孤独的灯光，不在暗处，在那个唯一亮着的窗里。", aspect: 1.44 },
  { id: "water-lilies", title: "睡莲", titleEn: "Water Lilies", artist: "Claude Monet", year: "1906", colors: ["#2A4A3A", "#4A7A6A", "#7AAA8A", "#B8A0D0", "#D8C8E0"], interpretation: "他画的不是莲。是水面上世界的倒影——模糊的、流动的、不确定的美。", aspect: 1.2 },
  { id: "the-scream", title: "呐喊", titleEn: "The Scream", artist: "Edvard Munch", year: "1893", colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"], interpretation: "整个世界都在替他叫。天空在叫，水在叫，只有他自己是沉默的。", aspect: 0.8 },
  { id: "pearl-earring", title: "戴珍珠耳环的少女", titleEn: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: "1665", colors: ["#0A0A0A", "#1A2A4A", "#3A5A8A", "#D4B870", "#F0E8D0"], interpretation: "一颗珍珠就够了。整幅画的光都为了那一个亮点存在。", aspect: 0.86 },
  { id: "impression-sunrise", title: "日出·印象", titleEn: "Impression, Sunrise", artist: "Claude Monet", year: "1872", colors: ["#4A5A6A", "#6A7A8A", "#8A9AAA", "#E05A20", "#F08040"], interpretation: "给一个流派命名的画。所有的精确都让位于一瞬间的感觉。", aspect: 1.3 },
  { id: "the-kiss", title: "吻", titleEn: "The Kiss", artist: "Gustav Klimt", year: "1908", colors: ["#1A1A10", "#6A5A20", "#B8982D", "#D4AF37", "#F0E8B0"], interpretation: "金箔不是装饰，是铠甲。两个人裹在金色的壳里，拒绝被外面的世界看见。", aspect: 0.99 },
  { id: "persistence-memory", title: "记忆的永恒", titleEn: "The Persistence of Memory", artist: "Salvador Dalí", year: "1931", colors: ["#1A2A3A", "#5A7A6A", "#B8A870", "#D4C090", "#E8D8B0"], interpretation: "时间不是流逝的——它是融化的。在午后的热浪里，什么都撑不住原来的形状。", aspect: 1.33 },
  { id: "wanderer-sea-fog", title: "雾海上的旅人", titleEn: "Wanderer above the Sea of Fog", artist: "Caspar David Friedrich", year: "1818", colors: ["#2A3040", "#5A6A7A", "#8A9AAA", "#B0B8C0", "#D8D8D0"], interpretation: "背对观众，面朝虚无。他不是在征服什么，是在承认自己的渺小。", aspect: 0.74 },
];

// Infinite canvas — spacious, asymmetric, salon-style
// On mobile (~400px), need 4-5 paintings visible at once
// Canvas repeats seamlessly.
const CANVAS_W = 1800;
const CANVAS_H = 2200;
const FRAME_SIZE = 160; // smaller base for mobile density

interface FramePos {
  x: number; y: number; w: number; rot: number;
}

function layoutFrames(): FramePos[] {
  return [
    { x: 40,   y: 60,   w: FRAME_SIZE * 1.0,  rot: -0.6 },
    { x: 380,  y: 30,   w: FRAME_SIZE * 1.2,  rot: 0.3 },
    { x: 720,  y: 80,   w: FRAME_SIZE * 1.1,  rot: -0.2 },
    { x: 1100, y: 40,   w: FRAME_SIZE * 0.95, rot: 0.5 },
    { x: 80,   y: 430,  w: FRAME_SIZE * 0.9,  rot: 0.2 },
    { x: 420,  y: 380,  w: FRAME_SIZE * 1.25, rot: -0.4 },
    { x: 820,  y: 450,  w: FRAME_SIZE * 1.05, rot: 0.1 },
    { x: 1200, y: 400,  w: FRAME_SIZE * 0.9,  rot: -0.3 },
    { x: 200,  y: 780,  w: FRAME_SIZE * 1.15, rot: 0.3 },
    { x: 650,  y: 820,  w: FRAME_SIZE * 1.0,  rot: -0.5 },
  ];
}

// ---- Mini canvas preview (static, using palette colors) ----
function PaintingPreview({ painting, width, height }: { painting: Painting; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seed = painting.colors.join("").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const noise = new SimplexNoise(seed);

    // Paint abstract color field based on palette
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const n = (noise.noise2D(x * 0.008, y * 0.008) + 1) / 2;
        const n2 = (noise.noise2D(x * 0.02 + 100, y * 0.02 + 100) + 1) / 2;
        const val = n * 0.65 + n2 * 0.35;
        const ci = Math.min(4, Math.floor(val * 5));
        const [r, g, b] = hexToRGB(painting.colors[ci]);
        // Slight variation
        const v = 0.85 + noise.noise2D(x * 0.03, y * 0.03) * 0.15;
        ctx.fillStyle = `rgb(${Math.round(r * v)},${Math.round(g * v)},${Math.round(b * v)})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }, [painting, width, height]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ---- p5 Sketch Functions ----
type SketchFn = (p: any, w: number, h: number, colors: string[], noise: SimplexNoise) => void;

function sketchStarryNight(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const particles: { x: number; y: number; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b);
    for (let i = 0; i < 800; i++) particles.push({ x: p.random(w), y: p.random(h), ci: 1 + (i % 4) });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 2); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.002;
    for (const pt of particles) {
      const cx = w * 0.5, cy = h * 0.4, dx = pt.x - cx, dy = pt.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const swirl = Math.atan2(dy, dx) + 0.3 / (dist * 0.01 + 1);
      const angle = noise.noise2D(pt.x * 0.004, pt.y * 0.004 + t) * Math.PI * 2 + swirl * 0.3;
      const prevX = pt.x, prevY = pt.y;
      pt.x += Math.cos(angle) * 2; pt.y += Math.sin(angle) * 2;
      const [r, g, b] = hexToRGB(colors[pt.ci]);
      p.stroke(r, g, b, 50); p.strokeWeight(1.2); p.line(prevX, prevY, pt.x, pt.y);
      if (pt.x < -5 || pt.x > w + 5 || pt.y < -5 || pt.y > h + 5) { pt.x = p.random(w); pt.y = p.random(h); }
    }
    if (p.frameCount % 4 === 0) {
      const [r, g, b] = hexToRGB(colors[3]); p.noStroke(); p.fill(r, g, b, 60 + Math.random() * 60);
      p.circle(p.random(w), p.random(h * 0.5), 2 + Math.random() * 3);
    }
  };
}

function sketchGreatWave(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.01;
    for (let layer = 0; layer < 4; layer++) {
      const [r, g, b] = hexToRGB(colors[1 + layer]);
      p.noStroke(); p.fill(r, g, b, 40 + layer * 15); p.beginShape();
      for (let x = 0; x <= w; x += 2) {
        const wave = Math.sin(x * 0.008 - t + layer) * 40;
        const n = noise.noise2D(x * 0.005 + layer * 5, t * 0.5 + layer) * 50;
        const peak = Math.max(0, Math.sin(x * 0.003 - t * 1.5) * 30 - 10);
        p.vertex(x, h * (0.35 + layer * 0.12) + wave + n - peak);
      }
      p.vertex(w, h); p.vertex(0, h); p.endShape(p.CLOSE);
    }
    for (let i = 0; i < 5; i++) {
      const x = p.random(w);
      const [r, g, b] = hexToRGB(colors[4]);
      p.fill(r, g, b, 30 + p.random(50)); p.noStroke(); p.circle(x, h * 0.3 + p.random(40), 1 + p.random(3));
    }
  };
}

function sketchNighthawks(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.005;
    const wx = w * 0.3, wy = h * 0.35, ww = w * 0.4, wh = h * 0.3;
    for (let i = 60; i > 0; i--) {
      const [r, g, b] = hexToRGB(i > 30 ? colors[3] : colors[4]);
      p.fill(r, g, b, Math.max((1 - i / 60) * 6, 0)); p.noStroke();
      p.rect(wx - i * 2, wy - i * 1.5, ww + i * 4, wh + i * 3, 2);
    }
    const [wr, wg, wb] = hexToRGB(colors[3]); p.fill(wr, wg, wb, 40); p.rect(wx, wy, ww, wh);
    const [gr, gg, gb] = hexToRGB(colors[4]); p.fill(gr, gg, gb, 15 + Math.sin(t * 2) * 5); p.rect(wx + 5, wy + 5, ww - 10, wh - 10);
    for (let i = 0; i < 3; i++) {
      const [sr, sg, sb] = hexToRGB(colors[2]); p.fill(sr, sg, sb, 50); p.noStroke();
      p.ellipse(wx + ww * (0.25 + i * 0.25) + noise.noise2D(i * 10, t) * 2, wy + wh * 0.4, 15, 25);
    }
  };
}

function sketchWaterLilies(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const pads: { x: number; y: number; r: number; ci: number; phase: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 30; i++) pads.push({ x: p.random(w), y: p.random(h), r: 20 + p.random(40), ci: 1 + (i % 4), phase: p.random(100) });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 8); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.003;
    for (let y = 0; y < h; y += 8) {
      const [wr, wg, wb] = hexToRGB(colors[1]);
      p.stroke(wr, wg, wb, 8); p.strokeWeight(0.5); p.line(noise.noise2D(y * 0.01, t) * 10, y, w, y);
    }
    for (const pad of pads) {
      const nx = pad.x + noise.noise2D(pad.phase, t) * 3, ny = pad.y + noise.noise2D(t, pad.phase) * 3;
      const [r, g, b] = hexToRGB(colors[pad.ci]);
      for (let ring = 3; ring > 0; ring--) { p.fill(r, g, b, 5 + ring * 2); p.noStroke(); p.ellipse(nx, ny, pad.r + ring * 8, pad.r * 0.6 + ring * 5); }
      p.fill(r, g, b, 25); p.noStroke(); p.ellipse(nx, ny, pad.r, pad.r * 0.6);
    }
  };
}

function sketchScream(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.008; const cx = w * 0.5, cy = h * 0.45;
    for (let r = Math.max(w, h); r > 5; r -= 4) {
      const ci = r % 20 < 10 ? (r % 8 < 4 ? 2 : 3) : (r % 8 < 4 ? 4 : 1);
      const [cr, cg, cb] = hexToRGB(colors[ci]);
      p.noFill(); p.stroke(cr, cg, cb, 15 + Math.sin(r * 0.05 + t) * 8); p.strokeWeight(3);
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.1) {
        const nr = r + noise.noise2D(Math.cos(a) * 3, Math.sin(a) * 3 + t) * 15;
        p.vertex(cx + Math.cos(a) * nr, cy + Math.sin(a) * nr * 0.7);
      }
      p.endShape(p.CLOSE);
    }
  };
}

function sketchPearlEarring(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.005;
    for (let i = 0; i < 8; i++) {
      const [r, g, b] = hexToRGB(colors[2]);
      p.fill(r, g, b, 3); p.noStroke();
      p.ellipse(w * (0.2 + noise.noise2D(i * 5, t * 0.3) * 0.6), h * (0.2 + noise.noise2D(t * 0.3, i * 5) * 0.6), 200, 200);
    }
    const px = w * 0.55, py = h * 0.52, breathe = Math.sin(t * 0.8) * 0.15 + 1;
    for (let r = 120; r > 0; r -= 2) {
      const ratio = r / 120; const [lr, lg, lb] = hexToRGB(ratio > 0.5 ? colors[3] : colors[4]);
      p.fill(lr, lg, lb, (1 - ratio) * 20 * breathe); p.noStroke(); p.circle(px, py, r * breathe);
    }
    p.fill(255, 255, 250, 80); p.noStroke(); p.circle(px, py, 8 * breathe);
  };
}

function sketchImpressionSunrise(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 1); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.003;
    for (let i = 0; i < 20; i++) {
      const x = p.random(w), y = p.random(h);
      const n = noise.noise2D(x * 0.005 + t, y * 0.005);
      const distToSun = Math.sqrt((x - w * 0.5) ** 2 + (y - h * 0.4) ** 2);
      const ci = distToSun < 80 ? (n > 0 ? 3 : 4) : (n > 0.3 ? 1 : n > -0.3 ? 2 : 0);
      const [r, g, b] = hexToRGB(colors[ci]);
      p.fill(r, g, b, 20 + Math.abs(n) * 30); p.noStroke(); p.circle(x, y, 2 + Math.abs(n) * 4);
    }
  };
}

function sketchTheKiss(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const golds: { x: number; y: number; vy: number; size: number; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 200; i++) golds.push({ x: p.random(w), y: p.random(h), vy: 0.2 + p.random(0.8), size: 1 + p.random(4), ci: 2 + (i % 3) });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 6); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.005;
    for (let r = 100; r > 0; r -= 3) {
      const [cr, cg, cb] = hexToRGB(colors[r % 6 < 3 ? 3 : 4]);
      const breathe = Math.sin(t * 0.5) * 3;
      p.fill(cr, cg, cb, 3); p.noStroke();
      p.ellipse(w * 0.45, h * 0.45 + breathe, r * 1.2, r * 1.8);
      p.ellipse(w * 0.55, h * 0.48 - breathe, r * 1.1, r * 1.7);
    }
    for (const g of golds) {
      g.y += g.vy; g.x += noise.noise2D(g.x * 0.01, t) * 0.5;
      if (g.y > h + 5) { g.y = -5; g.x = p.random(w); }
      const [r, gg, b] = hexToRGB(colors[g.ci]);
      p.fill(r, gg, b, 30 + Math.sin(g.y * 0.02 + t) * 15); p.noStroke(); p.rect(g.x, g.y, g.size, g.size);
    }
  };
}

function sketchPersistenceMemory(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.004; const horizonY = h * 0.55;
    for (let y = 0; y < horizonY; y++) {
      const ratio = y / horizonY;
      const [r1, g1, b1] = hexToRGB(colors[0]); const [r2, g2, b2] = hexToRGB(colors[3]);
      p.stroke(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio, 40); p.line(0, y, w, y);
    }
    for (let c = 0; c < 3; c++) {
      const cx = w * (0.25 + c * 0.25), cy = horizonY + 10;
      const [cr, cg, cb] = hexToRGB(colors[3 + (c % 2)]);
      p.noFill(); p.stroke(cr, cg, cb, 30); p.strokeWeight(2); p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.05) {
        const melt = a > Math.PI * 0.3 && a < Math.PI * 1.7 ? Math.sin((a - Math.PI * 0.3) / 1.4 * Math.PI) * 25 * (1 + Math.sin(t + c)) : 0;
        const nr = 30 + c * 5 + noise.noise2D(a * 2 + c * 10, t) * 8 + melt;
        p.vertex(cx + Math.cos(a) * nr, cy + Math.sin(a) * nr * 0.6 + melt * 0.5);
      }
      p.endShape(p.CLOSE);
    }
  };
}

function sketchWanderer(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.003;
    for (let layer = 6; layer >= 0; layer--) {
      const [r, g, b] = hexToRGB(colors[Math.min(layer + 1, 4)]);
      p.noStroke(); p.fill(r, g, b, 12 + layer * 3); p.beginShape();
      for (let x = -10; x <= w + 10; x += 3) {
        p.vertex(x, h * (0.3 + layer * 0.08) + noise.noise2D(x * 0.003 + layer * 10, t + layer * 2) * (30 + layer * 10));
      }
      p.vertex(w + 10, h); p.vertex(-10, h); p.endShape(p.CLOSE);
    }
    p.fill(20, 20, 25, 60); p.noStroke(); p.rect(w * 0.5 - 3, h * 0.28, 6, 18); p.circle(w * 0.5, h * 0.28 - 2, 8);
  };
}

const SKETCH_MAP: Record<string, SketchFn> = {
  "starry-night": sketchStarryNight, "great-wave": sketchGreatWave, "nighthawks": sketchNighthawks,
  "water-lilies": sketchWaterLilies, "the-scream": sketchScream, "pearl-earring": sketchPearlEarring,
  "impression-sunrise": sketchImpressionSunrise, "the-kiss": sketchTheKiss,
  "persistence-memory": sketchPersistenceMemory, "wanderer-sea-fog": sketchWanderer,
};

// ---- p5 Canvas for full view ----
function P5Canvas({ painting }: { painting: Painting }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<any>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    import("p5").then((mod) => {
      const p5 = mod.default;
      const w = window.innerWidth, h = window.innerHeight;
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

// ---- Infinite Canvas Gallery ----
function InfiniteGallery({ onSelect }: { onSelect: (p: Painting) => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startOx: 0, startOy: 0, moved: false });
  const frames = useRef(layoutFrames()).current;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startOx: offset.x, startOy: offset.y, moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [offset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragRef.current.moved = true;
    setOffset({ x: dragRef.current.startOx + dx, y: dragRef.current.startOy + dy });
  }, []);

  const handlePointerUp = useCallback(() => { dragRef.current.dragging = false; }, []);

  const tiles: { tx: number; ty: number }[] = [];
  for (let tx = -1; tx <= 1; tx++) for (let ty = -1; ty <= 1; ty++) tiles.push({ tx, ty });

  return (
    <div
      style={{
        width: "100vw", height: "100vh", overflow: "hidden",
        background: "#0a0a0a",
        cursor: dragRef.current.dragging ? "grabbing" : "grab",
        touchAction: "none",
        position: "relative",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {tiles.map(({ tx, ty }) => (
        <div key={`${tx},${ty}`} style={{
          position: "absolute",
          left: offset.x + tx * CANVAS_W,
          top: offset.y + ty * CANVAS_H,
          width: CANVAS_W,
          height: CANVAS_H,
        }}>
          {PAINTINGS.map((painting, i) => {
            const frame = frames[i];
            const isHovered = hovered === `${tx},${ty},${painting.id}`;
            return (
              <div
                key={painting.id}
                style={{
                  position: "absolute",
                  left: frame.x,
                  top: frame.y,
                  width: frame.w,
                  transform: `rotate(${frame.rot}deg)`,
                  cursor: "pointer",
                  transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={() => setHovered(`${tx},${ty},${painting.id}`)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { if (!dragRef.current.moved) onSelect(painting); }}
              >
                {/* Minimal frame — thin border, no gradient, no wood texture */}
                <div style={{
                  border: `1px solid rgba(255,255,255,${isHovered ? 0.08 : 0.03})`,
                  padding: "3px",
                  transition: "border-color 0.5s ease",
                }}>
                  <div style={{
                    width: "100%",
                    aspectRatio: `${painting.aspect}`,
                    overflow: "hidden",
                    filter: isHovered ? "brightness(1.15)" : "brightness(0.9)",
                    transition: "filter 0.5s ease",
                  }}>
                    <PaintingPreview painting={painting} width={Math.round(frame.w)} height={Math.round(frame.w / painting.aspect)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Subtle corner label — typography as element */}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 10,
        pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5625rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.08)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>drag to explore</p>
      </div>
    </div>
  );
}

// ---- Art View ----
function ArtView({ painting, onBack }: { painting: Painting; onBack: () => void }) {

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <P5Canvas painting={painting} />

      {/* Top — painting identity, typography-driven */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6875rem",
            fontWeight: 400,
            color: "rgba(255,250,240,0.35)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>{painting.artist}</p>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            fontWeight: 400,
            color: "rgba(255,250,240,0.18)",
            letterSpacing: "0.08em",
            marginTop: "2px",
          }}>{painting.year}</p>
        </div>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.6875rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.25)",
          cursor: "pointer",
          letterSpacing: "0.05em",
        }} onClick={onBack}>←</p>
      </div>

      {/* Bottom left — interpretation */}
      <div style={{
        position: "fixed", bottom: "2rem", left: "2.5rem", right: "2.5rem", zIndex: 10,
        maxWidth: "min(80vw, 420px)",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: "0.9375rem",
          color: "rgba(255,250,240,0.4)",
          lineHeight: "2",
          letterSpacing: "0.03em",
        }}>{painting.interpretation}</p>
      </div>
    </div>
  );
}

// ---- Main ----
export default function Gallery() {
  const [selected, setSelected] = useState<Painting | null>(null);
  if (selected) return <ArtView painting={selected} onBack={() => setSelected(null)} />;
  return <InfiniteGallery onSelect={setSelected} />;
}
