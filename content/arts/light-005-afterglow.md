---
title: "余晖 / Afterglow"
date: "2026-03-17"
series: "光与影 / Light & Shadow"
seriesNumber: 5
description: "光源已沉没地平线，但天空还记得它。大气层替光做最后一次散射——暖色先走，冷色殿后，直到一切归于深蓝。"
tags: ["light", "afterglow", "atmosphere", "gradient", "generative"]
---

光源已沉没地平线，但天空还记得它。大气层替光做最后一次散射——暖色先走，冷色殿后，直到一切归于深蓝。

这是"光与影"系列的最后一幅。从光的诞生（光源）、光的投射（影戏）、光的拆解（折射）、光的弥散（散射），到此刻——光的告别。余晖不是光本身，是光走后空气对它的记忆。

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

  // Seed RNG
  let seed = 31705;
  function rand() { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }

  // Color palette: afterglow spectrum
  // Deep navy → indigo → purple → magenta → coral → amber → pale gold
  const skyLayers = [
    { y: 0.0, color: [12, 15, 38] },      // deep night
    { y: 0.15, color: [22, 28, 65] },      // navy
    { y: 0.30, color: [45, 35, 85] },      // indigo
    { y: 0.45, color: [85, 40, 90] },      // muted purple
    { y: 0.58, color: [140, 55, 70] },     // dusty rose
    { y: 0.70, color: [190, 85, 55] },     // coral
    { y: 0.80, color: [220, 130, 50] },    // amber
    { y: 0.88, color: [235, 175, 75] },    // warm gold
    { y: 0.94, color: [240, 200, 120] },   // pale gold
    { y: 1.0, color: [245, 215, 155] },    // horizon glow
  ];

  function lerpColor(c1, c2, t) {
    return [
      c1[0] + (c2[0] - c1[0]) * t,
      c1[1] + (c2[1] - c1[1]) * t,
      c1[2] + (c2[2] - c1[2]) * t
    ];
  }

  function getSkyColor(yNorm) {
    for (let i = 0; i < skyLayers.length - 1; i++) {
      if (yNorm >= skyLayers[i].y && yNorm <= skyLayers[i + 1].y) {
        const t = (yNorm - skyLayers[i].y) / (skyLayers[i + 1].y - skyLayers[i].y);
        return lerpColor(skyLayers[i].color, skyLayers[i + 1].color, t);
      }
    }
    return skyLayers[skyLayers.length - 1].color;
  }

  // Draw the gradient sky with atmospheric noise
  const imgData = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const yNorm = y / H;
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      // Slight horizontal variation near horizon
      const horizonInfluence = Math.max(0, 1 - Math.abs(yNorm - 0.92) * 8);
      const xWave = Math.sin(x * 0.008 + y * 0.003) * 0.015 * horizonInfluence;
      const c = getSkyColor(Math.min(1, Math.max(0, yNorm + xWave)));
      // Atmospheric noise — subtle grain
      const noise = (rand() - 0.5) * 8;
      imgData.data[idx] = Math.min(255, Math.max(0, c[0] + noise));
      imgData.data[idx + 1] = Math.min(255, Math.max(0, c[1] + noise));
      imgData.data[idx + 2] = Math.min(255, Math.max(0, c[2] + noise));
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Thin cloud wisps — high altitude cirrus catching last light
  function drawCloudWisp(yCenter, width, thickness, warmth) {
    const segments = 60;
    for (let s = 0; s < 12; s++) {
      ctx.beginPath();
      const yOff = (rand() - 0.5) * thickness;
      const xStart = W * 0.05 + rand() * W * 0.15;
      const xEnd = W * 0.6 + rand() * W * 0.35;
      ctx.moveTo(xStart, yCenter + yOff);
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const x = xStart + (xEnd - xStart) * t;
        const drift = Math.sin(t * Math.PI * (2 + rand() * 3)) * thickness * 0.6;
        const taper = Math.sin(t * Math.PI); // fade at edges
        ctx.lineTo(x, yCenter + yOff + drift * taper);
      }
      const alpha = 0.03 + rand() * 0.06;
      const r = 200 + warmth * 55;
      const g = 140 + warmth * 60;
      const b = 100 + (1 - warmth) * 80;
      ctx.strokeStyle = `rgba(${r|0},${g|0},${b|0},${alpha})`;
      ctx.lineWidth = 0.5 + rand() * 1.5;
      ctx.stroke();
    }
  }

  // Several cloud layers at different heights
  drawCloudWisp(H * 0.22, W * 0.8, 15, 0.1);  // high, cool
  drawCloudWisp(H * 0.35, W * 0.7, 20, 0.3);
  drawCloudWisp(H * 0.48, W * 0.9, 25, 0.5);
  drawCloudWisp(H * 0.58, W * 0.8, 18, 0.7);
  drawCloudWisp(H * 0.68, W * 0.7, 22, 0.85); // low, warm

  // Stars in the upper portion — night is arriving
  for (let i = 0; i < 120; i++) {
    const x = rand() * W;
    const y = rand() * H * 0.4;
    const yNorm = y / H;
    const visibility = Math.max(0, 1 - yNorm * 4); // only visible high up
    if (visibility < 0.1) continue;
    const size = 0.5 + rand() * 1.5;
    const alpha = (0.1 + rand() * 0.5) * visibility;
    // Slight twinkle: warm or cool stars
    const temp = rand();
    const r = temp > 0.5 ? 220 + rand() * 35 : 180 + rand() * 40;
    const g = 190 + rand() * 40;
    const b = temp > 0.5 ? 180 + rand() * 30 : 220 + rand() * 35;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${alpha})`;
    ctx.fill();
  }

  // Horizon glow — radial light from where the sun just set
  const sunX = W * 0.38;
  const sunY = H * 0.95;
  const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.7);
  glowGrad.addColorStop(0, 'rgba(255, 200, 100, 0.12)');
  glowGrad.addColorStop(0.2, 'rgba(240, 160, 70, 0.08)');
  glowGrad.addColorStop(0.5, 'rgba(200, 100, 60, 0.03)');
  glowGrad.addColorStop(1, 'rgba(100, 50, 40, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // Silhouette landscape — dark ground with subtle variation
  ctx.beginPath();
  ctx.moveTo(0, H);
  const groundY = H * 0.92;
  ctx.lineTo(0, groundY + 8);
  for (let x = 0; x <= W; x += 2) {
    const hill1 = Math.sin(x * 0.004) * 12;
    const hill2 = Math.sin(x * 0.011 + 2) * 6;
    const hill3 = Math.sin(x * 0.025 + 5) * 3;
    const detail = (rand() - 0.5) * 1.5;
    ctx.lineTo(x, groundY + hill1 + hill2 + hill3 + detail);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = 'rgb(8, 10, 18)';
  ctx.fill();

  // A few silhouette trees on the horizon
  function drawTree(tx, ty, height, spread) {
    // Trunk
    ctx.fillStyle = 'rgb(6, 8, 15)';
    ctx.fillRect(tx - 1.5, ty - height, 3, height);
    // Canopy — simple organic shape
    ctx.beginPath();
    const levels = 3 + (rand() * 3) | 0;
    for (let l = 0; l < levels; l++) {
      const ly = ty - height * (0.4 + l * 0.15);
      const lw = spread * (1 - l * 0.2) * (0.8 + rand() * 0.4);
      ctx.ellipse(tx + (rand()-0.5) * 3, ly, lw, lw * 0.7, 0, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgb(6, 8, 15)';
    ctx.fill();
  }

  drawTree(W * 0.12, groundY + 5, 55, 18);
  drawTree(W * 0.15, groundY + 3, 35, 12);
  drawTree(W * 0.72, groundY + 6, 60, 20);
  drawTree(W * 0.76, groundY + 4, 40, 14);
  drawTree(W * 0.88, groundY + 7, 45, 15);

  // Faint reflection of afterglow on ground (wet surface hint)
  const reflGrad = ctx.createLinearGradient(0, groundY, 0, H);
  reflGrad.addColorStop(0, 'rgba(180, 120, 60, 0.04)');
  reflGrad.addColorStop(0.3, 'rgba(100, 60, 40, 0.02)');
  reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Venus — the evening star, bright point in the mid-sky
  const venusX = W * 0.55;
  const venusY = H * 0.30;
  const venusGlow = ctx.createRadialGradient(venusX, venusY, 0, venusX, venusY, 15);
  venusGlow.addColorStop(0, 'rgba(255, 250, 230, 0.9)');
  venusGlow.addColorStop(0.1, 'rgba(255, 240, 200, 0.4)');
  venusGlow.addColorStop(0.4, 'rgba(200, 190, 170, 0.08)');
  venusGlow.addColorStop(1, 'rgba(150, 140, 130, 0)');
  ctx.fillStyle = venusGlow;
  ctx.fillRect(venusX - 15, venusY - 15, 30, 30);

})();
</script>
