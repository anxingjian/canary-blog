---
title: "珊瑚 / Coral"
subtitle: "Coral"
date: "2026-03-19"
medium: "Canvas API · Generative · Growth #3"
series: "生长 / Growth"
seriesIndex: 3
description: "水下的生长没有重力的焦虑。珊瑚从礁石出发，一代代累积石灰质骨骼，分枝、弯曲、在水流中摇摆——用最慢的速度造出最复杂的城市。"
htmlFile: "coral.html"
---

水下的生长没有重力的焦虑。珊瑚从礁石出发，一代代累积石灰质骨骼，分枝、弯曲、在水流中摇摆——用最慢的速度造出最复杂的城市。

陆地上的生长要对抗重力，向上是一种意志。水里不一样——浮力兜住了一切，珊瑚可以朝任何方向伸展。所以珊瑚礁的形态比树更自由，更像一种三维的诗。它不赶时间，一年长几毫米，但几百年后就是一座大教堂。

<div id="art-container"></div>

<style>
  #art-container { display: flex; justify-content: center; margin: 2rem 0; }
  #art-container canvas { max-width: 100%; border-radius: 4px; }
</style>

<script>
(function() {
  const canvas = document.createElement('canvas');
  const W = 800, H = 800;
  canvas.width = W; canvas.height = H;
  document.getElementById('art-container').appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Seeded RNG
  let seed = 31903;
  function rand() { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }
  function randRange(a, b) { return a + rand() * (b - a); }

  // Deep ocean background — dark blue-green gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a1628');   // deep navy top
  bg.addColorStop(0.6, '#0d2137'); // mid ocean
  bg.addColorStop(1, '#162a3a');   // slightly lighter seabed
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle caustic light pattern on top
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) {
    const cx = randRange(0, W);
    const cy = randRange(0, H * 0.5);
    const r = randRange(30, 120);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, '#4488aa');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();

  // Sandy reef base
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let x = 0; x < W; x += 2) {
    const baseY = H - 40 + Math.sin(x * 0.02) * 15 + rand() * 10;
    const h = H - baseY;
    ctx.fillStyle = `hsl(${30 + rand() * 15}, ${20 + rand() * 10}%, ${18 + rand() * 8}%)`;
    ctx.fillRect(x, baseY, 2, h);
  }
  ctx.restore();

  // Coral color palettes — analogous warm tones, low-mid saturation
  const palettes = [
    // Salmon coral — warm pinks
    { h: [5, 20], s: [35, 55], l: [45, 60] },
    // Lavender coral — cool purple-pink
    { h: [280, 310], s: [25, 40], l: [50, 65] },
    // Ochre coral — earthy gold
    { h: [30, 50], s: [30, 50], l: [40, 55] },
    // Sea green coral — teal
    { h: [150, 175], s: [25, 40], l: [35, 50] },
  ];

  // Coral branch structure using recursive growth
  const branches = [];

  function growCoral(x, y, angle, length, thickness, depth, palette, drift) {
    if (depth <= 0 || length < 3 || thickness < 0.5) return;

    const p = palettes[palette];
    const h = randRange(p.h[0], p.h[1]);
    const s = randRange(p.s[0], p.s[1]);
    const l = randRange(p.l[0], p.l[1]) - depth * 1.5;

    // Curve the branch slightly (water current effect)
    const segments = Math.max(3, Math.floor(length / 4));
    const segLen = length / segments;
    let cx = x, cy = y, ca = angle;

    for (let i = 0; i < segments; i++) {
      const nx = cx + Math.cos(ca) * segLen;
      const ny = cy + Math.sin(ca) * segLen;
      const t = thickness * (1 - i / segments * 0.3);

      // Draw segment with rounded caps
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${0.6 + rand() * 0.3})`;
      ctx.lineWidth = t;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Subtle glow
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = `hsl(${h}, ${s + 10}%, ${l + 20}%)`;
      ctx.lineWidth = t * 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Water current drift
      ca += drift * 0.02 + randRange(-0.05, 0.05);
      cx = nx;
      cy = ny;
    }

    // Branching
    const numBranches = depth > 3 ? Math.floor(randRange(2, 4)) : Math.floor(randRange(1, 3));
    for (let b = 0; b < numBranches; b++) {
      const branchAngle = ca + randRange(-0.7, 0.7);
      const branchLen = length * randRange(0.55, 0.8);
      const branchThick = thickness * randRange(0.5, 0.7);
      const startT = randRange(0.3, 0.9);
      const bx = x + (cx - x) * startT;
      const by = y + (cy - y) * startT;
      growCoral(bx, by, branchAngle, branchLen, branchThick, depth - 1, palette, drift + randRange(-0.3, 0.3));
    }

    // Polyp tips at terminal branches
    if (depth <= 2) {
      ctx.save();
      ctx.globalAlpha = 0.5 + rand() * 0.3;
      const tipR = thickness * randRange(1.5, 3);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, tipR);
      g.addColorStop(0, `hsla(${h}, ${s + 15}%, ${l + 15}%, 0.8)`);
      g.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, tipR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Place coral colonies along the reef
  const colonies = [
    { x: 120, palette: 0, angle: -Math.PI / 2 + 0.15, len: 180, thick: 8, depth: 6, drift: 0.4 },
    { x: 280, palette: 2, angle: -Math.PI / 2 - 0.1, len: 220, thick: 10, depth: 7, drift: 0.3 },
    { x: 420, palette: 1, angle: -Math.PI / 2 + 0.05, len: 250, thick: 11, depth: 7, drift: 0.5 },
    { x: 560, palette: 3, angle: -Math.PI / 2 - 0.2, len: 200, thick: 9, depth: 6, drift: 0.2 },
    { x: 680, palette: 0, angle: -Math.PI / 2 + 0.1, len: 190, thick: 8, depth: 6, drift: 0.6 },
    // Smaller background corals
    { x: 50, palette: 3, angle: -Math.PI / 2, len: 80, thick: 4, depth: 4, drift: 0.3 },
    { x: 200, palette: 1, angle: -Math.PI / 2 + 0.2, len: 90, thick: 5, depth: 4, drift: 0.4 },
    { x: 750, palette: 2, angle: -Math.PI / 2 - 0.15, len: 100, thick: 5, depth: 4, drift: 0.2 },
    { x: 500, palette: 0, angle: -Math.PI / 2 + 0.08, len: 70, thick: 3, depth: 3, drift: 0.5 },
  ];

  // Draw smaller (background) colonies first
  colonies.sort((a, b) => a.len - b.len);
  for (const c of colonies) {
    const baseY = H - 35 + Math.sin(c.x * 0.02) * 12;
    growCoral(c.x, baseY, c.angle, c.len, c.thick, c.depth, c.palette, c.drift);
  }

  // Floating particles (plankton / sediment)
  ctx.save();
  for (let i = 0; i < 80; i++) {
    const px = randRange(0, W);
    const py = randRange(0, H);
    const pr = randRange(0.5, 2);
    const alpha = randRange(0.05, 0.2);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${randRange(180, 220)}, 30%, 70%, ${alpha})`;
    ctx.fill();
  }
  ctx.restore();

  // Subtle vignette
  const vig = ctx.createRadialGradient(W/2, H/2, W * 0.3, W/2, H/2, W * 0.75);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(5, 10, 20, 0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
})();
</script>
