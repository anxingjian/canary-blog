---
title: "菌丝 / Mycelium"
subtitle: "Mycelium"
date: "2026-03-18"
medium: "Canvas API · Generative · Growth #2"
series: "生长 / Growth"
seriesIndex: 2
description: "地下有另一座森林。菌丝从几个节点出发，沿着随机游走的路径扩展，分叉、连接、形成网络——看不见的根系在支撑看得见的一切。"
htmlFile: "mycelium.html"
---

地下有另一座森林。菌丝从几个节点出发，沿着随机游走的路径扩展，分叉、连接、形成网络——看不见的根系在支撑看得见的一切。

如果说"萌芽"是向上的冲动，"菌丝"就是向下的智慧。不争夺阳光，而是编织联系。真菌学家说，一棵树的根系通过菌丝网络可以连接整片森林。最安静的生长，也是最广的。

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
  let seed = 31802;
  function rand() { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }

  // Color palette — earthy, underground: dark soil bg, warm ochre + muted green hyphae
  const bg = '#1a1410';
  const hyphaeColors = [
    'rgba(194, 170, 130, ',  // pale ochre
    'rgba(160, 145, 110, ',  // warm grey
    'rgba(130, 155, 120, ',  // muted sage
    'rgba(210, 185, 140, ',  // light sand
  ];
  const nodeColor = 'rgba(220, 195, 150, ';

  // Fill background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Add subtle soil texture
  for (let i = 0; i < 40000; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const a = rand() * 0.03;
    ctx.fillStyle = `rgba(${80 + rand()*40|0}, ${60 + rand()*30|0}, ${40 + rand()*20|0}, ${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Mycelium network
  class Hypha {
    constructor(x, y, angle, energy, depth, colorIdx) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.energy = energy;
      this.depth = depth;
      this.colorIdx = colorIdx;
      this.points = [{x, y}];
      this.children = [];
      this.thickness = Math.max(0.3, 2.5 - depth * 0.3);
    }

    grow() {
      const steps = Math.floor(this.energy * (30 + rand() * 40));
      for (let i = 0; i < steps; i++) {
        // Organic wandering — Perlin-like angle drift
        this.angle += (rand() - 0.5) * 0.6;
        // Slight downward bias (gravity for roots)
        this.angle += Math.sin(this.angle) * 0.02;

        const stepLen = 2 + rand() * 3;
        this.x += Math.cos(this.angle) * stepLen;
        this.y += Math.sin(this.angle) * stepLen;

        // Bounds
        if (this.x < 10 || this.x > W - 10 || this.y < 10 || this.y > H - 10) break;

        this.points.push({x: this.x, y: this.y});

        // Branch?
        if (this.depth < 6 && rand() < 0.02 && this.energy > 0.2) {
          const branchAngle = this.angle + (rand() > 0.5 ? 1 : -1) * (0.4 + rand() * 0.8);
          const child = new Hypha(
            this.x, this.y, branchAngle,
            this.energy * (0.4 + rand() * 0.3),
            this.depth + 1,
            rand() < 0.3 ? (this.colorIdx + 1) % hyphaeColors.length : this.colorIdx
          );
          this.children.push(child);
        }

        this.energy *= 0.997;
      }
    }

    draw() {
      if (this.points.length < 2) return;
      const color = hyphaeColors[this.colorIdx];

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        const p = this.points[i];
        const prev = this.points[i - 1];
        const mx = (prev.x + p.x) / 2;
        const my = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
      }

      const fadeAlpha = Math.max(0.08, 0.5 - this.depth * 0.06);
      ctx.strokeStyle = color + fadeAlpha + ')';
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw children
      this.children.forEach(c => {
        c.grow();
        c.draw();
      });
    }
  }

  // Spawn nodes — central cluster of origin points
  const nodes = [];
  const numNodes = 5 + Math.floor(rand() * 4);
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: W * 0.3 + rand() * W * 0.4,
      y: H * 0.3 + rand() * H * 0.4
    });
  }

  // From each node, spawn hyphae in multiple directions
  const allHyphae = [];
  nodes.forEach(node => {
    const numHyphae = 4 + Math.floor(rand() * 6);
    for (let i = 0; i < numHyphae; i++) {
      const angle = rand() * Math.PI * 2;
      const h = new Hypha(
        node.x + (rand() - 0.5) * 8,
        node.y + (rand() - 0.5) * 8,
        angle,
        0.7 + rand() * 0.3,
        0,
        Math.floor(rand() * hyphaeColors.length)
      );
      allHyphae.push(h);
    }
  });

  // Grow and draw all hyphae
  ctx.globalCompositeOperation = 'lighter';
  allHyphae.forEach(h => {
    h.grow();
    h.draw();
  });

  // Draw connection lines between nearby nodes (nutrient highways)
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) {
        // Draw a slightly curved connection
        ctx.beginPath();
        const cx = (nodes[i].x + nodes[j].x) / 2 + (rand() - 0.5) * 60;
        const cy = (nodes[i].y + nodes[j].y) / 2 + (rand() - 0.5) * 60;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.quadraticCurveTo(cx, cy, nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(194, 170, 130, ${0.06 * (1 - dist/300)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  // Draw node points — small glowing dots
  ctx.globalCompositeOperation = 'lighter';
  nodes.forEach(node => {
    // Outer glow
    const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 20);
    grad.addColorStop(0, nodeColor + '0.25)');
    grad.addColorStop(0.5, nodeColor + '0.06)');
    grad.addColorStop(1, nodeColor + '0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = nodeColor + '0.6)';
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Subtle spore particles floating
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 80; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 0.5 + rand() * 1.5;
    const a = 0.03 + rand() * 0.06;
    ctx.fillStyle = `rgba(210, 195, 155, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

})();
</script>
