---
title: "折射 / Refraction"
subtitle: "Refraction"
date: "2026-03-15"
medium: "Canvas API · Generative · Light & Shadow #3"
series: "光与影 / Light & Shadow"
seriesIndex: 3
description: "光穿过棱镜，在暗室墙上投下焦散纹理。白光被拆解，然后又在远处重逢。"
---

光穿过棱镜，在暗室墙上投下焦散纹理。白光被拆解，然后又在远处重逢。

前两幅画了光的出发和投影。这一幅是光被介质改变之后的样子——折射、色散、焦散。光不再是直线，而是被弯折、分裂、重新汇聚。

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

  // Dark room background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Subtle noise texture on background
  const imgData = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    imgData.data[i] += n;
    imgData.data[i+1] += n;
    imgData.data[i+2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  // --- Prism ---
  const prismCx = W * 0.35, prismCy = H * 0.45;
  const prismSize = 120;
  const prismAngle = -Math.PI / 12;

  function drawPrism() {
    ctx.save();
    ctx.translate(prismCx, prismCy);
    ctx.rotate(prismAngle);
    ctx.beginPath();
    const h = prismSize * Math.sqrt(3) / 2;
    ctx.moveTo(0, -h * 0.67);
    ctx.lineTo(-prismSize / 2, h * 0.33);
    ctx.lineTo(prismSize / 2, h * 0.33);
    ctx.closePath();

    // Glass-like fill
    const grad = ctx.createLinearGradient(-prismSize/2, -h*0.67, prismSize/2, h*0.33);
    grad.addColorStop(0, 'rgba(180, 200, 220, 0.08)');
    grad.addColorStop(0.5, 'rgba(200, 210, 230, 0.12)');
    grad.addColorStop(1, 'rgba(160, 180, 200, 0.06)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = 'rgba(200, 215, 235, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // --- Incoming white beam ---
  function drawBeam() {
    const beamGrad = ctx.createLinearGradient(0, prismCy - 20, prismCx - 30, prismCy - 5);
    beamGrad.addColorStop(0, 'rgba(255, 255, 245, 0)');
    beamGrad.addColorStop(0.3, 'rgba(255, 255, 245, 0.03)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 245, 0.15)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, prismCy - 40);
    ctx.lineTo(prismCx - 20, prismCy - 8);
    ctx.lineTo(prismCx - 20, prismCy + 8);
    ctx.lineTo(0, prismCy + 10);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();

    // Core bright line
    ctx.beginPath();
    ctx.moveTo(0, prismCy - 15);
    ctx.lineTo(prismCx - 25, prismCy);
    ctx.strokeStyle = 'rgba(255, 255, 250, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // --- Dispersed spectrum rays (caustics) ---
  const spectrumColors = [
    { h: 0,   s: 80, l: 55 },   // red
    { h: 25,  s: 85, l: 52 },   // orange
    { h: 48,  s: 75, l: 50 },   // yellow
    { h: 130, s: 50, l: 45 },   // green
    { h: 210, s: 60, l: 50 },   // blue
    { h: 250, s: 55, l: 45 },   // indigo
    { h: 280, s: 50, l: 48 },   // violet
  ];

  function drawDispersion() {
    const exitX = prismCx + 45;
    const exitY = prismCy + 10;
    const spreadAngle = Math.PI * 0.28;
    const baseAngle = -0.05;

    spectrumColors.forEach((col, i) => {
      const t = i / (spectrumColors.length - 1);
      const angle = baseAngle + (t - 0.5) * spreadAngle;
      const rayLen = 500 + Math.random() * 100;
      const endX = exitX + Math.cos(angle) * rayLen;
      const endY = exitY + Math.sin(angle) * rayLen;

      // Main ray
      const rayGrad = ctx.createLinearGradient(exitX, exitY, endX, endY);
      const baseColor = `hsla(${col.h}, ${col.s}%, ${col.l}%, `;
      rayGrad.addColorStop(0, baseColor + '0.4)');
      rayGrad.addColorStop(0.3, baseColor + '0.2)');
      rayGrad.addColorStop(0.7, baseColor + '0.08)');
      rayGrad.addColorStop(1, baseColor + '0)');

      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = 3 - t * 1.5;
      ctx.stroke();

      // Caustic glow at wall hit
      if (endX < W && endY < H && endY > 0) {
        const wallX = Math.min(endX, W - 20);
        const wallY = endY;
        const glowRad = 30 + Math.random() * 25;
        const glow = ctx.createRadialGradient(wallX, wallY, 0, wallX, wallY, glowRad);
        glow.addColorStop(0, baseColor + '0.15)');
        glow.addColorStop(0.5, baseColor + '0.05)');
        glow.addColorStop(1, baseColor + '0)');
        ctx.fillStyle = glow;
        ctx.fillRect(wallX - glowRad, wallY - glowRad, glowRad * 2, glowRad * 2);
      }
    });
  }

  // --- Caustic patterns on the right wall ---
  function drawCaustics() {
    const wallX = W * 0.7;
    const causticsCount = 60;

    for (let i = 0; i < causticsCount; i++) {
      const y = H * 0.15 + Math.random() * H * 0.7;
      const x = wallX + Math.random() * (W - wallX - 10);
      const col = spectrumColors[Math.floor(Math.random() * spectrumColors.length)];
      const t = (y - H * 0.15) / (H * 0.7);

      // Caustic blob
      const size = 3 + Math.random() * 15;
      const alpha = 0.03 + Math.random() * 0.08;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
      glow.addColorStop(0, `hsla(${col.h}, ${col.s * 0.7}%, ${col.l + 10}%, ${alpha})`);
      glow.addColorStop(1, `hsla(${col.h}, ${col.s * 0.5}%, ${col.l}%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      // Elongated caustic shapes
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.4 + Math.random() * 1.2);
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.restore();
      ctx.fill();
    }

    // A few bright caustic lines (light concentration)
    for (let i = 0; i < 8; i++) {
      const y = H * 0.25 + Math.random() * H * 0.5;
      const x1 = wallX + Math.random() * 30;
      const x2 = x1 + 20 + Math.random() * 80;
      const col = spectrumColors[Math.floor(Math.random() * spectrumColors.length)];
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.quadraticCurveTo(
        (x1 + x2) / 2, y + (Math.random() - 0.5) * 30,
        x2, y + (Math.random() - 0.5) * 15
      );
      ctx.strokeStyle = `hsla(${col.h}, ${col.s * 0.6}%, ${col.l + 15}%, 0.06)`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.stroke();
    }
  }

  // --- Floor reflection ---
  function drawFloorReflection() {
    const floorY = H * 0.78;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0, 'rgba(10, 10, 15, 0)');
    floorGrad.addColorStop(0.3, 'rgba(10, 10, 15, 0.5)');
    floorGrad.addColorStop(1, 'rgba(10, 10, 15, 0.9)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, W, H - floorY);

    // Faint spectrum reflection on floor
    spectrumColors.forEach((col, i) => {
      const t = i / (spectrumColors.length - 1);
      const x = W * 0.45 + t * W * 0.4;
      const glow = ctx.createRadialGradient(x, floorY + 30, 0, x, floorY + 50, 60);
      glow.addColorStop(0, `hsla(${col.h}, ${col.s * 0.4}%, ${col.l}%, 0.04)`);
      glow.addColorStop(1, `hsla(${col.h}, ${col.s * 0.3}%, ${col.l}%, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(x - 60, floorY, 120, 100);
    });
  }

  // --- Render ---
  drawBeam();
  drawPrism();
  drawDispersion();
  drawCaustics();
  drawFloorReflection();

  // Signature
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.font = '11px monospace';
  ctx.fillText('canary — 折射 / refraction — 2026.03.15', 16, H - 16);
})();
</script>
