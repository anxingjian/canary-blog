"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---- Simplex Noise (Stefan Gustavson, public domain) ----
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
  artist: string;
  year: string;
  colors: string[];
  interpretation: string;
  imageUrl: string;
  aspect: number;
}

const PAINTINGS: Painting[] = [
  {
    id: "starry-night",
    title: "星月夜",
    artist: "Vincent van Gogh",
    year: "1889",
    colors: ["#0B1D3A", "#1A3A6B", "#2E6B9E", "#E8C840", "#F5E8A0"],
    interpretation: "在圣雷米精神病院的窗口画的。不是他看见的夜空——是他感受到的。每一笔旋涡都是一个不肯安静的念头。柏树像黑色火焰往天上烧，村庄在底下安睡。他把自己的躁动画进了星星里。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    aspect: 1.25,
  },
  {
    id: "great-wave",
    title: "神奈川冲浪里",
    artist: "葛饰北斋",
    year: "1831",
    colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"],
    interpretation: "北斋七十岁才画出这幅。三十六景之一，却成了整个日本艺术的代名词。巨浪不是在吞噬渔船——是在展示自然的漠然。远处富士山安静得像个旁观者。浪花碎成爪子的形状，每一滴都是一个细节的执念。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/500px-Tsunami_by_hokusai_19th_century.jpg",
    aspect: 1.5,
  },
  {
    id: "nighthawks",
    title: "夜鹰",
    artist: "Edward Hopper",
    year: "1942",
    colors: ["#0A0F0A", "#1C3A28", "#4A7A5C", "#D4A030", "#F0E8C8"],
    interpretation: "珍珠港事件后几周画的。四个人坐在深夜的餐厅里，没有人说话，也没有门。Hopper 说他画的不是孤独——但每个看过的人都在里面看见了自己。那是城市给人的承诺：你可以在人群中彻底地独处。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/500px-Nighthawks_by_Edward_Hopper_1942.jpg",
    aspect: 1.44,
  },
  {
    id: "water-lilies",
    title: "睡莲",
    artist: "Claude Monet",
    year: "1906",
    colors: ["#2A4A3A", "#4A7A6A", "#7AAA8A", "#B8A0D0", "#D8C8E0"],
    interpretation: "莫奈晚年视力衰退，白内障让世界变得模糊。但他说'我画的不是东西，是光照在东西上的样子'。两百多幅睡莲，画的是同一个池塘——但没有两幅是一样的。因为光从来不重复自己。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/500px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    aspect: 1.2,
  },
  {
    id: "the-scream",
    title: "呐喊",
    artist: "Edvard Munch",
    year: "1893",
    colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"],
    interpretation: "蒙克在日记里写：'我和两个朋友走在路上，太阳落山了，天空突然变成血红色。我停下来，靠在栏杆上——感到一声无尽的尖叫穿过自然。'那个人不是在叫，他是在听。整个世界在替他叫。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/500px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    aspect: 0.8,
  },
  {
    id: "pearl-earring",
    title: "戴珍珠耳环的少女",
    artist: "Johannes Vermeer",
    year: "1665",
    colors: ["#0A0A0A", "#1A2A4A", "#3A5A8A", "#D4B870", "#F0E8D0"],
    interpretation: "不是肖像画——是'tronie'，一种角色习作。没人知道她是谁。维米尔用了当时最贵的颜料：天然群青和铅白。那颗珍珠可能根本不是真的——它太大、太亮、形状太完美。但正因为是假的，它才成了整幅画的锚点。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/500px-1665_Girl_with_a_Pearl_Earring.jpg",
    aspect: 0.86,
  },
  {
    id: "impression-sunrise",
    title: "日出·印象",
    artist: "Claude Monet",
    year: "1872",
    colors: ["#4A5A6A", "#6A7A8A", "#8A9AAA", "#E05A20", "#F08040"],
    interpretation: "给一整个流派命名的画。批评家嘲笑它'连草图都算不上'。莫奈说标题？随便叫日出印象吧。那个橙色太阳的亮度如果转成灰度，和周围天空一模一样——大脑看不见它，但眼睛看见了。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/500px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg",
    aspect: 1.3,
  },
  {
    id: "the-kiss",
    title: "吻",
    artist: "Gustav Klimt",
    year: "1908",
    colors: ["#1A1A10", "#6A5A20", "#B8982D", "#D4AF37", "#F0E8B0"],
    interpretation: "克里姆特'黄金时期'的巅峰。金箔不是装饰——是铠甲。两个人裹在金色的壳里，跪在悬崖边缘，花田到此为止。男人的长袍画满黑白方块，女人的裙上是圆形花纹。方与圆，刚与柔。他低头吻她，但她的眼睛是闭着的。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/500px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    aspect: 0.99,
  },
  {
    id: "wanderer-sea-fog",
    title: "雾海上的旅人",
    artist: "Caspar David Friedrich",
    year: "1818",
    colors: ["#2A3040", "#5A6A7A", "#8A9AAA", "#B0B8C0", "#D8D8D0"],
    interpretation: "浪漫主义的图腾。一个人背对我们站在山顶，面朝无穷。他不是在征服自然，是在被自然吞没——而且他知道。弗里德里希说'画家不应该只画眼前的，还要画心里的'。雾隐藏了一切，也暗示了一切。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/500px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    aspect: 0.74,
  },
  {
    id: "the-milkmaid",
    title: "倒牛奶的女仆",
    artist: "Johannes Vermeer",
    year: "1658",
    colors: ["#2A2820", "#5A5A40", "#8A8A60", "#C8B868", "#E0D8B0"],
    interpretation: "维米尔画了一个正在工作的普通女人，给了她纪念碑式的尊严。窗户左边进来的光照亮了她蓝色围裙上的每一条褶皱。面包的纹理、牛奶的弧线、墙上的钉孔——他把微不足道的日常升华成了永恒。X光扫描发现墙上原本有一幅地图，他后来涂掉了。留白。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/500px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg",
    aspect: 0.91,
  },
];

// Museum wall color — deep hunter green
const WALL_COLOR = "#1a2820";

// Tighter layout for mobile density — ~4-5 visible at once on 400px screen
const CANVAS_W = 1500;
const CANVAS_H = 1100;
const FRAME_SIZE = 300;

interface FramePos { x: number; y: number; w: number; rot: number; }

function layoutFrames(): FramePos[] {
  // Uniform ~350px spacing both directions, 3 rows
  return [
    { x: 20,   y: 15,   w: FRAME_SIZE * 1.05, rot: -0.4 },
    { x: 370,  y: 25,   w: FRAME_SIZE * 1.1,  rot: 0.3 },
    { x: 730,  y: 10,   w: FRAME_SIZE * 1.0,  rot: -0.2 },
    { x: 1090, y: 20,   w: FRAME_SIZE * 1.05, rot: 0.4 },
    { x: 50,   y: 350,  w: FRAME_SIZE * 1.0,  rot: 0.2 },
    { x: 400,  y: 340,  w: FRAME_SIZE * 1.1,  rot: -0.3 },
    { x: 760,  y: 355,  w: FRAME_SIZE * 1.05, rot: 0.1 },
    { x: 1110, y: 345,  w: FRAME_SIZE * 0.95, rot: -0.4 },
    { x: 160,  y: 685,  w: FRAME_SIZE * 1.1,  rot: 0.3 },
    { x: 550,  y: 680,  w: FRAME_SIZE * 1.0,  rot: -0.2 },
  ];
}

// ---- p5 Sketch Functions ----
type SketchFn = (p: any, w: number, h: number, colors: string[], noise: SimplexNoise) => void;

// 星月夜 — Van Gogh saw spirals in everything during his episodes.
// Turbulent flow field: every particle follows a vortex. Stars pulse.
function sketchStarryNight(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const particles: { x: number; y: number; px: number; py: number; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b);
    for (let i = 0; i < 1200; i++) {
      const x = p.random(w), y = p.random(h);
      particles.push({ x, y, px: x, py: y, ci: 1 + (i % 4) });
    }
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 3); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.001;
    // Multiple vortex centers — like the spirals in the actual painting
    const vortices = [
      { x: w * 0.3, y: h * 0.3, strength: 1.2 },
      { x: w * 0.7, y: h * 0.25, strength: -0.8 },
      { x: w * 0.5, y: h * 0.5, strength: 0.6 },
    ];
    for (const pt of particles) {
      pt.px = pt.x; pt.py = pt.y;
      // Turbulent flow with vortices
      let angle = noise.noise2D(pt.x * 0.003, pt.y * 0.003 + t) * Math.PI * 4;
      for (const v of vortices) {
        const dx = pt.x - v.x, dy = pt.y - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        angle += v.strength * Math.atan2(dy, dx) / (dist * 0.005 + 1);
      }
      const speed = 1.5 + noise.noise2D(pt.x * 0.005 + 100, pt.y * 0.005) * 0.8;
      pt.x += Math.cos(angle) * speed; pt.y += Math.sin(angle) * speed;
      const [r, g, b] = hexToRGB(colors[pt.ci]);
      const alpha = 30 + Math.abs(noise.noise2D(pt.x * 0.01, pt.y * 0.01)) * 40;
      p.stroke(r, g, b, alpha); p.strokeWeight(0.8); p.line(pt.px, pt.py, pt.x, pt.y);
      if (pt.x < -10 || pt.x > w + 10 || pt.y < -10 || pt.y > h + 10) { pt.x = p.random(w); pt.y = p.random(h); pt.px = pt.x; pt.py = pt.y; }
    }
    // Pulsing stars
    if (p.frameCount % 3 === 0) {
      const [r, g, b] = hexToRGB(colors[3]);
      for (let i = 0; i < 3; i++) {
        const sx = p.random(w), sy = p.random(h * 0.45);
        const pulse = 1 + Math.sin(p.frameCount * 0.03 + sx) * 0.5;
        p.noStroke(); p.fill(r, g, b, 40 * pulse); p.circle(sx, sy, (2 + p.random(3)) * pulse);
      }
    }
  };
}

// 神奈川冲浪里 — Hokusai was obsessed with the fractal nature of waves.
// Self-similar waves that break into smaller waves. Foam as white dots.
function sketchGreatWave(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.008;
    // Layered waves with fractal detail
    for (let layer = 0; layer < 6; layer++) {
      const ci = Math.min(layer < 3 ? layer + 1 : 3, 4);
      const [r, g, b] = hexToRGB(colors[ci]);
      const baseY = h * (0.2 + layer * 0.1);
      const amp = 60 - layer * 6;
      p.noStroke(); p.fill(r, g, b, 20 + layer * 5); p.beginShape();
      for (let x = -10; x <= w + 10; x += 2) {
        // Main wave + harmonics (fractal-like)
        let y = baseY;
        y += Math.sin(x * 0.006 - t * 1.2 + layer) * amp;
        y += noise.noise2D(x * 0.008 + layer * 5, t * 0.6) * (amp * 0.5);
        y += Math.sin(x * 0.02 - t * 2.5) * (amp * 0.2); // small ripples
        // Cresting — waves peak and curl
        const crest = Math.max(0, Math.sin(x * 0.004 - t * 1.8 + layer * 0.5) - 0.3) * 30;
        y -= crest;
        p.vertex(x, y);
      }
      p.vertex(w + 10, h); p.vertex(-10, h); p.endShape(p.CLOSE);
    }
    // Foam spray at wave crests
    for (let i = 0; i < 8; i++) {
      const x = p.random(w);
      const waveY = h * 0.28 + Math.sin(x * 0.006 - t * 1.2) * 50 + noise.noise2D(x * 0.008, t * 0.6) * 25;
      const [r, g, b] = hexToRGB(colors[4]);
      p.noStroke(); p.fill(r, g, b, 20 + p.random(40));
      p.circle(x + p.random(-10, 10), waveY + p.random(-15, 5), 1 + p.random(2.5));
    }
  };
}

// 夜鹰 — The loneliest painting in American art.
// A glowing window in pure darkness. Figures are silhouettes. No door.
function sketchNighthawks(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.003;
    // The window — a trapezoid of warm light
    const wx = w * 0.2, wy = h * 0.3, ww = w * 0.6, wh = h * 0.35;
    // Light spill outward — concentric, dimming
    for (let i = 80; i > 0; i--) {
      const ratio = i / 80;
      const ci = ratio > 0.5 ? 3 : 4;
      const [r, g, b] = hexToRGB(colors[ci]);
      p.fill(r, g, b, (1 - ratio) * 4); p.noStroke();
      p.rect(wx - i * 3, wy - i * 2, ww + i * 6, wh + i * 4);
    }
    // Window glass — subtle green tint (Hopper's signature)
    const [gr, gg, gb] = hexToRGB(colors[2]);
    p.fill(gr, gg, gb, 15); p.rect(wx, wy, ww, wh);
    // Warm interior
    const [wr, wg, wb] = hexToRGB(colors[3]);
    p.fill(wr, wg, wb, 12 + Math.sin(t) * 3); p.rect(wx + 5, wy + 5, ww - 10, wh - 10);
    // Counter — horizontal line
    p.stroke(gr, gg, gb, 25); p.strokeWeight(1);
    p.line(wx + 15, wy + wh * 0.55, wx + ww - 15, wy + wh * 0.55);
    // Silhouettes — three lonely figures
    p.fill(10, 12, 10, 50); p.noStroke();
    const sway = (i: number) => noise.noise2D(i * 10, t * 0.5) * 1.5;
    p.ellipse(wx + ww * 0.25 + sway(0), wy + wh * 0.38, 18, 30); // hat
    p.ellipse(wx + ww * 0.45 + sway(1), wy + wh * 0.4, 15, 26);
    p.ellipse(wx + ww * 0.7 + sway(2), wy + wh * 0.36, 16, 28);
    // Street — horizontal lines suggesting pavement
    for (let y = wy + wh + 20; y < h; y += 15) {
      p.stroke(20, 25, 20, 8 + noise.noise2D(y * 0.1, t) * 3); p.strokeWeight(0.5);
      p.line(0, y, w, y);
    }
  };
}

// 睡莲 — Monet painted light, not objects. His cataracts made the world soft.
// Layered translucent circles drifting on flowing water reflections.
function sketchWaterLilies(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const lilies: { x: number; y: number; r: number; ci: number; phase: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 40; i++) lilies.push({ x: p.random(w), y: p.random(h), r: 15 + p.random(35), ci: 1 + (i % 4), phase: p.random(Math.PI * 2) });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 5); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.002;
    // Water surface — horizontal flowing lines, like reflections dissolving
    for (let y = 0; y < h; y += 6) {
      const xOff = noise.noise2D(y * 0.005, t * 0.5) * 30;
      const ci = y % 24 < 12 ? 1 : 2;
      const [r, g, b] = hexToRGB(colors[ci]);
      p.stroke(r, g, b, 4); p.strokeWeight(0.5);
      p.line(xOff, y, w + xOff, y);
    }
    // Lilies — translucent overlapping ellipses, drifting
    for (const lily of lilies) {
      const nx = lily.x + noise.noise2D(lily.phase, t) * 2;
      const ny = lily.y + noise.noise2D(t, lily.phase) * 2;
      const [r, g, b] = hexToRGB(colors[lily.ci]);
      // Outer glow (like light diffusing through water)
      for (let ring = 3; ring > 0; ring--) {
        p.fill(r, g, b, 3 + ring); p.noStroke();
        p.ellipse(nx, ny, lily.r + ring * 12, (lily.r + ring * 12) * 0.5);
      }
      // Lily pad
      const breathe = 1 + Math.sin(t * 0.5 + lily.phase) * 0.08;
      p.fill(r, g, b, 15); p.noStroke();
      p.ellipse(nx, ny, lily.r * breathe, lily.r * 0.5 * breathe);
    }
  };
}

// 呐喊 — Munch heard it. The sky turned blood red. Everything rippled.
// Concentric distortion waves emanating from center. Colors bleed.
function sketchScream(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.006;
    const cx = w * 0.5, cy = h * 0.42;
    // Rippling bands of color — like the wavy sky/water in the original
    for (let r = Math.max(w, h) * 0.9; r > 3; r -= 3) {
      const n = noise.noise2D(r * 0.01, t) * 20;
      const breathe = Math.sin(t * 0.8 + r * 0.005) * 5;
      // Alternate between warm and cool
      const phase = (r + p.frameCount * 0.5) % 60;
      const ci = phase < 15 ? 2 : phase < 30 ? 3 : phase < 45 ? 4 : 1;
      const [cr, cg, cb] = hexToRGB(colors[ci]);
      p.noFill(); p.stroke(cr, cg, cb, 12 + Math.sin(r * 0.02 + t) * 6);
      p.strokeWeight(2);
      // Distorted ellipse — not perfect circles, wavy
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.08) {
        const distort = noise.noise2D(Math.cos(a) * 2 + r * 0.01, Math.sin(a) * 2 + t) * 20;
        const rx = (r + n + distort + breathe) * 1.1;
        const ry = (r + n + distort + breathe) * 0.65;
        p.vertex(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
      }
      p.endShape(p.CLOSE);
    }
    // Dark figure silhouette at center — just a suggestion
    p.fill(15, 15, 20, 30); p.noStroke();
    p.ellipse(cx, cy, 20, 35);
    p.ellipse(cx, cy - 22, 14, 14);
  };
}

// 戴珍珠耳环的少女 — Vermeer's fake pearl. All light leads to one point.
// Dark void with a single luminous point. Light traces radiate outward.
function sketchPearlEarring(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 4); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.004;
    const px = w * 0.52, py = h * 0.48;
    // Ambient blue — like the turban
    for (let i = 0; i < 5; i++) {
      const bx = w * 0.35 + noise.noise2D(i * 7, t * 0.3) * w * 0.3;
      const by = h * 0.25 + noise.noise2D(t * 0.3, i * 7) * h * 0.3;
      const [r, g, b] = hexToRGB(colors[2]);
      p.fill(r, g, b, 2); p.noStroke(); p.ellipse(bx, by, 180, 180);
    }
    // Warm tones — like skin catching light
    for (let i = 0; i < 3; i++) {
      const bx = w * 0.45 + noise.noise2D(i * 13 + 50, t * 0.2) * w * 0.15;
      const by = h * 0.35 + noise.noise2D(t * 0.2, i * 13 + 50) * h * 0.2;
      const [r, g, b] = hexToRGB(colors[3]);
      p.fill(r, g, b, 2); p.noStroke(); p.ellipse(bx, by, 120, 120);
    }
    // The pearl — pulsing point of pure light
    const breathe = 1 + Math.sin(t * 0.6) * 0.2;
    // Glow rings
    for (let r = 80; r > 0; r -= 2) {
      const ratio = r / 80;
      const [lr, lg, lb] = hexToRGB(ratio > 0.4 ? colors[4] : colors[3]);
      p.fill(lr, lg, lb, (1 - ratio) * 6 * breathe); p.noStroke();
      p.circle(px, py, r * breathe);
    }
    // Specular highlight
    p.fill(255, 252, 245, 50 * breathe); p.noStroke();
    p.circle(px - 2, py - 2, 5 * breathe);
  };
}

// 日出·印象 — The orange sun is invisible in grayscale. Pure color perception.
// Pointillist dots accumulating. Orange emerges from grey.
function sketchImpressionSunrise(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b); };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 1); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.002;
    const sunX = w * 0.48, sunY = h * 0.38;
    // Scatter impressionist dots
    for (let i = 0; i < 25; i++) {
      const x = p.random(w), y = p.random(h);
      const distToSun = Math.sqrt((x - sunX) ** 2 + (y - sunY) ** 2);
      const n = noise.noise2D(x * 0.005 + t, y * 0.005);
      // Near sun: warm. Far: cool grey
      let ci: number;
      if (distToSun < 60) ci = p.random() > 0.3 ? 3 : 4;
      else if (distToSun < 150) ci = p.random() > 0.6 ? 3 : (n > 0 ? 1 : 2);
      else ci = n > 0.3 ? 1 : n > -0.3 ? 2 : 0;
      const [r, g, b] = hexToRGB(colors[ci]);
      const size = 1.5 + Math.abs(n) * 4;
      p.fill(r, g, b, 15 + Math.abs(n) * 25); p.noStroke();
      p.circle(x, y, size);
    }
    // Sun reflection on water — orange streaks below
    if (p.frameCount % 2 === 0) {
      const rx = sunX + p.random(-40, 40);
      const ry = h * 0.55 + p.random(h * 0.3);
      const [r, g, b] = hexToRGB(colors[3]);
      p.fill(r, g, b, 8); p.noStroke();
      p.ellipse(rx, ry, 6 + p.random(8), 1.5);
    }
  };
}

// 吻 — Gold leaf falling like rain. Two shapes melting into one.
// Rectangles and circles (his pattern vs hers) falling through gold.
function sketchTheKiss(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const tiles: { x: number; y: number; vy: number; size: number; isCircle: boolean; ci: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h); const [r, g, b] = hexToRGB(colors[0]); p.background(r, g, b);
    for (let i = 0; i < 300; i++) tiles.push({
      x: p.random(w), y: p.random(h), vy: 0.15 + p.random(0.6),
      size: 2 + p.random(5), isCircle: i % 2 === 0, ci: 2 + (i % 3),
    });
  };
  p.draw = () => {
    const [br, bg, bb] = hexToRGB(colors[0]); p.fill(br, bg, bb, 4); p.noStroke(); p.rect(0, 0, w, h);
    const t = p.frameCount * 0.003;
    // Two merging forms at center — breathing
    const breathe = Math.sin(t * 0.4) * 4;
    for (let r = 120; r > 0; r -= 2) {
      const ratio = r / 120;
      const ci = ratio > 0.5 ? 3 : 4;
      const [cr, cg, cb] = hexToRGB(colors[ci]);
      p.fill(cr, cg, cb, (1 - ratio) * 3); p.noStroke();
      // Two overlapping forms merging
      p.ellipse(w * 0.46, h * 0.44 + breathe, r * 0.9, r * 1.4);
      p.ellipse(w * 0.54, h * 0.46 - breathe, r * 0.85, r * 1.35);
    }
    // Falling gold tiles — rectangles (his) and circles (hers)
    for (const tile of tiles) {
      tile.y += tile.vy; tile.x += noise.noise2D(tile.x * 0.01, t) * 0.3;
      if (tile.y > h + 10) { tile.y = -10; tile.x = p.random(w); }
      const [r, g, b] = hexToRGB(colors[tile.ci]);
      const alpha = 20 + Math.sin(tile.y * 0.01 + t) * 10;
      p.fill(r, g, b, alpha); p.noStroke();
      if (tile.isCircle) p.circle(tile.x, tile.y, tile.size);
      else p.rect(tile.x, tile.y, tile.size, tile.size);
    }
  };
}

// 雾海上的旅人 — Fog hides everything, implies everything.
// Layered fog planes with parallax. A silhouette stands still.
function sketchWanderer(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  p.setup = () => { p.createCanvas(w, h); };
  p.draw = () => {
    // Gradient sky
    for (let y = 0; y < h; y++) {
      const ratio = y / h;
      const [r1, g1, b1] = hexToRGB(colors[0]);
      const [r2, g2, b2] = hexToRGB(colors[2]);
      p.stroke(r1 + (r2 - r1) * ratio * 0.4, g1 + (g2 - g1) * ratio * 0.4, b1 + (b2 - b1) * ratio * 0.4);
      p.line(0, y, w, y);
    }
    const t = p.frameCount * 0.002;
    // Mountain ridges visible through fog — layered, receding
    for (let layer = 8; layer >= 0; layer--) {
      const [r, g, b] = hexToRGB(colors[Math.min(layer > 4 ? 4 : layer + 1, 4)]);
      const alpha = 8 + layer * 3;
      p.noStroke(); p.fill(r, g, b, alpha); p.beginShape();
      const baseY = h * (0.25 + layer * 0.065);
      for (let x = -10; x <= w + 10; x += 3) {
        const mountain = noise.noise2D(x * 0.002 + layer * 7, layer * 3) * (40 + layer * 15);
        const drift = noise.noise2D(x * 0.001 + layer * 3, t + layer) * 8;
        p.vertex(x, baseY + mountain + drift);
      }
      p.vertex(w + 10, h); p.vertex(-10, h); p.endShape(p.CLOSE);
    }
    // Fog layers — horizontal bands
    for (let i = 0; i < 5; i++) {
      const fy = h * (0.35 + i * 0.1) + noise.noise2D(i * 10, t) * 20;
      const [r, g, b] = hexToRGB(colors[3]);
      p.fill(r, g, b, 4 + Math.sin(t + i) * 2); p.noStroke();
      p.rect(0, fy, w, 30 + noise.noise2D(i * 5, t) * 15);
    }
    // The wanderer — small, still, silhouette
    const figX = w * 0.5, figY = h * 0.27;
    p.fill(20, 22, 28, 60); p.noStroke();
    p.rect(figX - 3, figY, 6, 20); // body
    p.circle(figX, figY - 3, 9); // head
  };
}

// 倒牛奶的女仆 — Vermeer's light from the left window. Dignity in the ordinary.
// Light beam from left, illuminating particles. Stillness.
function sketchMilkmaid(p: any, w: number, h: number, colors: string[], noise: SimplexNoise) {
  const dust: { x: number; y: number; size: number; speed: number }[] = [];
  p.setup = () => {
    p.createCanvas(w, h);
    for (let i = 0; i < 100; i++) dust.push({ x: p.random(w * 0.5), y: p.random(h), size: 0.5 + p.random(1.5), speed: 0.1 + p.random(0.3) });
  };
  p.draw = () => {
    // Warm, dim interior
    const [br, bg, bb] = hexToRGB(colors[0]); p.background(br, bg, bb);
    const t = p.frameCount * 0.003;
    // Light beam from upper-left window
    p.noStroke();
    for (let i = 40; i > 0; i--) {
      const ratio = i / 40;
      const [r, g, b] = hexToRGB(colors[3]);
      p.fill(r, g, b, (1 - ratio) * 3);
      // Trapezoid light beam
      p.beginShape();
      p.vertex(0, 0); p.vertex(w * 0.15, 0);
      p.vertex(w * (0.3 + i * 0.005), h * (0.7 + i * 0.005));
      p.vertex(0, h * (0.5 + i * 0.005));
      p.endShape(p.CLOSE);
    }
    // Wall texture — subtle horizontal lines
    for (let y = 0; y < h; y += 8) {
      const [r, g, b] = hexToRGB(colors[2]);
      p.stroke(r, g, b, 3 + noise.noise2D(y * 0.05, 0) * 2); p.strokeWeight(0.3);
      p.line(0, y, w, y);
    }
    // Floating dust in the light beam
    for (const d of dust) {
      d.y += d.speed; d.x += noise.noise2D(d.y * 0.02, t) * 0.3;
      if (d.y > h) { d.y = 0; d.x = p.random(w * 0.4); }
      // Only visible in the light beam area
      const inLight = d.x < w * 0.3 && d.x / d.y < 0.5;
      if (inLight) {
        const [r, g, b] = hexToRGB(colors[4]);
        p.fill(r, g, b, 25 + Math.sin(d.y * 0.05 + t) * 15); p.noStroke();
        p.circle(d.x, d.y, d.size);
      }
    }
    // Still life suggestion — table line
    const [tr, tg, tb] = hexToRGB(colors[2]);
    p.stroke(tr, tg, tb, 15); p.strokeWeight(1);
    p.line(w * 0.2, h * 0.65, w * 0.7, h * 0.65);
  };
}

const SKETCH_MAP: Record<string, SketchFn> = {
  "starry-night": sketchStarryNight, "great-wave": sketchGreatWave, "nighthawks": sketchNighthawks,
  "water-lilies": sketchWaterLilies, "the-scream": sketchScream, "pearl-earring": sketchPearlEarring,
  "impression-sunrise": sketchImpressionSunrise, "the-kiss": sketchTheKiss,
  "wanderer-sea-fog": sketchWanderer, "the-milkmaid": sketchMilkmaid,
};

// ---- GLSL Shaders ----
// Shared noise functions injected into every shader
const GLSL_NOISE = `
precision highp float;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx),i1;
  i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.,h=abs(x)-.5,a0=x-floor(x+.5);
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
float fbm(vec2 p){float f=0.;float w=.5;for(int i=0;i<5;i++){f+=w*snoise(p);p*=2.;w*=.5;}return f;}
`;

const SHADER_STARRY_NIGHT = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.15;
  
  // Turbulent flow field — multiple vortex centers like Van Gogh's spirals
  vec2 v1=vec2(-.2,.15),v2=vec2(.25,.2),v3=vec2(0.,-.1);
  float angle=0.;
  // Vortex influence
  for(int i=0;i<3;i++){
    vec2 vc=i==0?v1:i==1?v2:v3;
    float str=i==0?1.2:i==1?-.9:.7;
    vec2 d=p-vc;
    float dist=length(d);
    angle+=str*atan(d.y,d.x)/(dist*4.+.3);
  }
  // Noise turbulence layered on top
  angle+=fbm(p*3.+t*.3)*3.14;
  
  // Trace the flow — accumulate color along flow direction
  vec2 flow=vec2(cos(angle),sin(angle));
  float streak=0.;
  for(int i=0;i<6;i++){
    float fi=float(i)*.15;
    vec2 sp=p+flow*fi*.08;
    streak+=abs(snoise(sp*8.+t*.5))*.16;
  }
  
  // Sky color mixing based on height and turbulence
  float skyGrad=smoothstep(-.3,.5,p.y);
  vec3 deep=u_c0;
  vec3 mid=mix(u_c1,u_c2,streak);
  vec3 sky=mix(deep,mid,skyGrad+streak*.3);
  
  // Swirling highlights — the thick impasto strokes
  float swirl=snoise(p*4.+vec2(cos(angle),sin(angle))*t*.2);
  float highlight=smoothstep(.3,.8,swirl);
  sky=mix(sky,u_c2,highlight*.4);
  
  // Stars — bright pulsing dots
  for(int i=0;i<8;i++){
    float fi=float(i);
    vec2 starPos=vec2(sin(fi*1.7+.3)*.35,cos(fi*2.1+.7)*.2+.15);
    float d=length(p-starPos);
    float pulse=.5+.5*sin(t*2.+fi*1.3);
    float star=smoothstep(.025,.005,d)*pulse;
    float halo=smoothstep(.08,.02,d)*pulse*.3;
    sky+=u_c3*(star+halo);
  }
  
  // Moon — large bright area
  float moon=smoothstep(.06,.02,length(p-vec2(.3,.25)));
  float moonHalo=smoothstep(.12,.04,length(p-vec2(.3,.25)))*.4;
  sky+=u_c4*(moon+moonHalo);
  
  // Village silhouette at bottom
  float ground=smoothstep(-.35,-.38,p.y+snoise(vec2(p.x*12.,0.))*.03);
  // Church spire
  float spire=smoothstep(.008,.003,abs(p.x+.05))*smoothstep(-.25,-.18,p.y)*step(p.y,-.18);
  sky=mix(sky,u_c0*.3,ground+spire*.8);
  
  // Cypress tree — dark flame shape on left
  float cx=p.x+.38;
  float cy=p.y+.1;
  float cypress=smoothstep(.04,.01,abs(cx)*(1.+cy*.8))*smoothstep(-.4,.3,p.y);
  sky=mix(sky,u_c0*.2,cypress);
  
  // Impasto texture
  float tex=snoise(gl_FragCoord.xy*.5)*.04;
  sky+=tex;
  
  gl_FragColor=vec4(sky,1.);
}
`;

const SHADER_GREAT_WAVE = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.2;
  
  // Sky gradient
  vec3 col=mix(u_c3*.6,u_c4*.8,uv.y);
  
  // Multiple wave layers with fractal detail — Hokusai's obsession
  for(int layer=0;layer<7;layer++){
    float fl=float(layer);
    float baseY=-.15+fl*.08;
    float amp=.18-fl*.015;
    
    // Main wave shape
    float wave=sin(p.x*3.-t*1.5+fl*.7)*amp;
    // Fractal harmonics — self-similar detail
    wave+=sin(p.x*7.-t*2.3+fl*1.3)*amp*.35;
    wave+=snoise(vec2(p.x*4.+fl*3.,t*.4+fl))*amp*.25;
    wave+=snoise(vec2(p.x*12.+fl*7.,t*.8))*amp*.1;
    
    // Wave crest — curling over
    float crest=smoothstep(.0,.15,sin(p.x*2.5-t*1.8+fl*.4)-.5);
    wave-=crest*.08;
    
    float waveLine=p.y-baseY-wave;
    float fill=smoothstep(.005,-.005,waveLine);
    
    // Color: deeper layers are darker
    float depth=fl/7.;
    vec3 waveCol=mix(u_c2,u_c1,depth);
    waveCol=mix(waveCol,u_c0,depth*depth);
    
    col=mix(col,waveCol,fill*(1.-depth*.3));
    
    // Foam on crests — white frothy lines
    float foam=smoothstep(.01,.002,abs(waveLine))*(1.-depth*.5);
    foam*=smoothstep(-.05,.1,wave); // only on peaks
    col=mix(col,u_c4,foam*.6);
    
    // Spray — small dots breaking off crests
    if(crest>.3){
      float spray=snoise(vec2(p.x*40.+fl*20.,p.y*40.+t*3.));
      float sprayMask=smoothstep(.02,.0,abs(waveLine-.01))*smoothstep(.4,1.,crest);
      col=mix(col,u_c4,step(.6,spray)*sprayMask*.4);
    }
  }
  
  // The great wave crest — a massive curling form
  float greatX=p.x+.1;
  float greatWave=.2+sin(greatX*2.-t)*.15+snoise(vec2(greatX*5.,t*.3))*.06;
  float curl=smoothstep(.0,.1,greatX)*smoothstep(.5,.2,greatX);
  greatWave+=curl*.1;
  float gwFill=smoothstep(.01,-.01,p.y-greatWave)*step(-.3,greatX)*step(greatX,.5);
  col=mix(col,mix(u_c1,u_c2,.5),gwFill*.3);
  
  // Foam texture on great wave
  float foamTex=snoise(vec2(p.x*30.,p.y*30.-t*2.));
  float foamMask=smoothstep(.01,.0,abs(p.y-greatWave))*gwFill;
  col=mix(col,u_c4,step(.3,foamTex)*foamMask*.5);
  
  // Distant Fuji — small, calm
  float fuji=smoothstep(.01,.0,p.y+.1-max(0.,.04-abs(p.x-.35)*.3));
  col=mix(col,u_c4*.9,fuji*.3);
  
  gl_FragColor=vec4(col,1.);
}
`;

const SHADER_PEARL_EARRING = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.1;
  
  // Vermeer's black void — not empty, but velvet-deep
  vec3 col=u_c0;
  
  // Subtle warmth from the right — ambient reflected light
  float ambient=smoothstep(.8,.0,length(p-vec2(.3,-.1)))*.08;
  col+=u_c3*ambient;
  
  // The turban — ultramarine blue, the most expensive pigment
  vec2 turbanCenter=vec2(.02,.08);
  float turbanDist=length(p-turbanCenter);
  float turban=smoothstep(.22,.08,turbanDist);
  // Fabric folds via noise
  float folds=snoise(vec2(atan(p.y-turbanCenter.y,p.x-turbanCenter.x)*3.,turbanDist*8.+t*.3))*.15;
  vec3 turbanCol=mix(u_c1,u_c2,.5+folds);
  col=mix(col,turbanCol,turban*.5);
  
  // Skin — warm light from the left, Vermeer's signature directional light
  vec2 faceCenter=vec2(.0,-.02);
  float faceDist=length((p-faceCenter)*vec2(1.,1.2));
  float face=smoothstep(.15,.06,faceDist);
  vec3 skinCol=mix(u_c3,u_c4,.3);
  // Light direction: upper-left
  float faceLight=smoothstep(.15,.04,length(p-faceCenter-vec2(-.05,.03)));
  col=mix(col,skinCol,face*.35);
  col+=u_c4*faceLight*.1;
  
  // The glance — she's looking right at you
  // Subtle eye highlight
  vec2 eyePos=vec2(-.02,.01);
  float eyeLight=smoothstep(.015,.005,length(p-eyePos));
  col+=u_c4*eyeLight*.2;
  
  // THE PEARL — the anchor of the entire painting
  vec2 pearlPos=vec2(.04,-.1);
  float pearlDist=length(p-pearlPos);
  float breathe=1.+sin(t*.6)*.08;
  
  // Outer glow — light scattered through the pearl
  float glow=smoothstep(.08,.01,pearlDist)*breathe;
  col+=mix(u_c4,u_c3,.3)*glow*.3;
  
  // Pearl body — luminous, slightly warm
  float pearl=smoothstep(.025,.015,pearlDist)*breathe;
  col=mix(col,u_c4*.95,pearl*.7);
  
  // Specular highlight — the bright spot that makes it "real"
  // Vermeer probably used a tiny dot of pure lead white
  vec2 specPos=pearlPos+vec2(-.008,.008);
  float spec=smoothstep(.006,.001,length(p-specPos))*breathe;
  col+=vec3(1.,.98,.95)*spec*.8;
  
  // Secondary reflection — bottom of pearl catches fabric color
  vec2 refPos=pearlPos+vec2(.005,-.01);
  float ref2=smoothstep(.008,.003,length(p-refPos))*breathe;
  col+=u_c2*ref2*.15;
  
  // Yellow headband draping down
  float band=smoothstep(.01,.004,abs(p.x-.06+sin(p.y*8.)*.01))*smoothstep(.1,-.05,p.y)*smoothstep(-.2,-.05,p.y);
  col=mix(col,u_c3,band*.25);
  
  // Very subtle canvas texture
  float grain=snoise(gl_FragCoord.xy*.8)*.02;
  col+=grain;
  
  // Vignette — drawing eye to center/pearl
  float vig=smoothstep(.7,.3,length(p));
  col*=.7+vig*.3;
  
  gl_FragColor=vec4(col,1.);
}
`;

const SHADER_MAP: Record<string, string> = {
  "starry-night": SHADER_STARRY_NIGHT,
  "great-wave": SHADER_GREAT_WAVE,
  "pearl-earring": SHADER_PEARL_EARRING,
};

// ---- WebGL Shader Canvas ----
function ShaderCanvas({ painting }: { painting: Painting }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);

    const vertSrc = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;
    const fragSrc = SHADER_MAP[painting.id]!;

    function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
      return s;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    gl.uniform2f(uRes, w, h);

    // Color uniforms
    for (let i = 0; i < 5; i++) {
      const loc = gl.getUniformLocation(prog, `u_c${i}`);
      const [r, g, b] = hexToRGB(painting.colors[i]);
      gl.uniform3f(loc, r / 255, g / 255, b / 255);
    }

    const startTime = performance.now();
    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      gl!.uniform1f(uTime, elapsed);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [painting]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}

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
        background: WALL_COLOR,
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
                {/* Minimal gilt frame — thin gold edge */}
                <div style={{
                  border: `2px solid rgba(180,160,100,${isHovered ? 0.25 : 0.1})`,
                  padding: "2px",
                  background: "rgba(30,28,22,0.8)",
                  transition: "border-color 0.5s ease",
                  boxShadow: isHovered ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 10px rgba(0,0,0,0.3)",
                }}>
                  <div style={{
                    width: "100%",
                    aspectRatio: `${painting.aspect}`,
                    overflow: "hidden",
                    filter: isHovered ? "brightness(1.1)" : "brightness(0.85)",
                    transition: "filter 0.5s ease",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={painting.imageUrl}
                      alt={painting.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---- Art View ----
function ArtView({ painting, onBack }: { painting: Painting; onBack: () => void }) {
  const hasShader = painting.id in SHADER_MAP;
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {hasShader ? <ShaderCanvas painting={painting} /> : <P5Canvas painting={painting} />}

      {/* Top — painting identity */}
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
          fontSize: "0.875rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.3)",
          cursor: "pointer",
        }} onClick={onBack}>←</p>
      </div>

      {/* Bottom — interpretation */}
      <div style={{
        position: "fixed", bottom: "2rem", left: "2.5rem", right: "2.5rem", zIndex: 10,
        maxWidth: "min(80vw, 480px)",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: "0.875rem",
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
