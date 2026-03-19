---
title: "散射 / Scattering"
subtitle: "Scattering"
date: "2026-03-16"
medium: "Canvas API · Generative · Light & Shadow #4"
series: "光与影 / Light & Shadow"
seriesIndex: 4
description: "一束光穿过尘雾，被无数微粒打散。丁达尔效应——你看见的不是光本身，而是光被阻碍的痕迹。"
---

一束光穿过尘雾，被无数微粒打散。丁达尔效应——你看见的不是光本身，而是光被阻碍的痕迹。

前三幅：光出发、投影、被棱镜拆解。这一幅，光遇到了更混沌的介质——无数悬浮微粒。它不再被整齐地弯折，而是四散、弥漫、在空气中画出自己的形状。

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

  // Seed-based RNG for reproducibility
  let seed = 41627;
  function rng() {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  }

  // Deep dark background — like a dusty room
  ctx.fillStyle = '#08090e';
  ctx.fillRect(0, 0, W, H);

  // Light source: a warm beam entering from upper-left
  const beamOriginX = -40;
  const beamOriginY = 120;
  const beamAngle = Math.PI * 0.22; // slightly downward
  const beamWidth = 0.18; // angular width in radians

  // Draw volumetric light beam using layered transparent lines
  // The beam is a cone of light
  const beamLen = 1200;

  // First pass: the main beam glow
  for (let i = 0; i < 300; i++) {
    const angle = beamAngle + (rng() - 0.5) * beamWidth;
    const len = beamLen * (0.6 + rng() * 0.4);
    const endX = beamOriginX + Math.cos(angle) * len;
    const endY = beamOriginY + Math.sin(angle) * len;

    const grad = ctx.createLinearGradient(beamOriginX, beamOriginY, endX, endY);
    // Warm light: slightly golden
    const alpha = 0.008 + rng() * 0.012;
    grad.addColorStop(0, `rgba(255, 235, 200, ${alpha * 2})`);
    grad.addColorStop(0.3, `rgba(255, 220, 170, ${alpha})`);
    grad.addColorStop(0.7, `rgba(255, 200, 140, ${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(255, 200, 140, 0)');

    ctx.beginPath();
    ctx.moveTo(beamOriginX, beamOriginY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5 + rng() * 3;
    ctx.stroke();
  }

  // Second pass: brighter core of beam
  for (let i = 0; i < 120; i++) {
    const angle = beamAngle + (rng() - 0.5) * beamWidth * 0.4;
    const len = beamLen * (0.5 + rng() * 0.5);
    const endX = beamOriginX + Math.cos(angle) * len;
    const endY = beamOriginY + Math.sin(angle) * len;

    const grad = ctx.createLinearGradient(beamOriginX, beamOriginY, endX, endY);
    const alpha = 0.015 + rng() * 0.015;
    grad.addColorStop(0, `rgba(255, 245, 220, ${alpha})`);
    grad.addColorStop(0.5, `rgba(255, 230, 190, ${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(255, 220, 170, 0)');

    ctx.beginPath();
    ctx.moveTo(beamOriginX, beamOriginY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.8 + rng() * 1.5;
    ctx.stroke();
  }

  // Dust particles — the heart of Tyndall scattering
  // Particles are visible where the beam hits them
  function isInBeam(x, y) {
    const dx = x - beamOriginX;
    const dy = y - beamOriginY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return 0;
    const angle = Math.atan2(dy, dx);
    const diff = Math.abs(angle - beamAngle);
    const halfWidth = beamWidth * 0.55;
    if (diff > halfWidth) return 0;
    // Intensity falls with distance and angle
    const angleFactor = 1 - diff / halfWidth;
    const distFactor = Math.max(0, 1 - dist / beamLen);
    return angleFactor * distFactor;
  }

  // Scatter many particles across the canvas
  const particles = [];
  for (let i = 0; i < 4000; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const intensity = isInBeam(x, y);
    if (intensity > 0.01 || rng() < 0.03) {
      particles.push({ x, y, intensity, size: 0.5 + rng() * 2.5 });
    }
  }

  // Draw particles
  for (const p of particles) {
    const brightness = p.intensity;
    if (brightness > 0.02) {
      // Lit particles: warm glow, size proportional to intensity
      const r = p.size * (1 + brightness * 2);
      const alpha = Math.min(0.9, brightness * 1.5 + 0.05);

      // Outer glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      glow.addColorStop(0, `rgba(255, 230, 180, ${alpha * 0.4})`);
      glow.addColorStop(0.5, `rgba(255, 210, 150, ${alpha * 0.1})`);
      glow.addColorStop(1, 'rgba(255, 200, 140, 0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 245, 230, ${alpha})`;
      ctx.fill();
    } else {
      // Unlit dust — barely visible
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 180, 200, ${0.06 + rng() * 0.06})`;
      ctx.fill();
    }
  }

  // Forward scattering halo — particles near beam edge scatter light outward
  for (let i = 0; i < 60; i++) {
    const t = rng();
    const dist = 100 + t * 700;
    const cx = beamOriginX + Math.cos(beamAngle) * dist;
    const cy = beamOriginY + Math.sin(beamAngle) * dist;
    // Offset perpendicular to beam
    const perpAngle = beamAngle + Math.PI / 2;
    const spread = beamWidth * dist * (0.4 + rng() * 0.6);
    const ox = Math.cos(perpAngle) * (rng() - 0.5) * spread;
    const oy = Math.sin(perpAngle) * (rng() - 0.5) * spread;
    const px = cx + ox;
    const py = cy + oy;

    const haloR = 8 + rng() * 25;
    const haloAlpha = 0.01 + rng() * 0.025;
    const halo = ctx.createRadialGradient(px, py, 0, px, py, haloR);
    // Slight blue tint for Rayleigh-like scattering at edges
    const blue = rng() > 0.6;
    if (blue) {
      halo.addColorStop(0, `rgba(180, 200, 255, ${haloAlpha})`);
      halo.addColorStop(1, 'rgba(150, 180, 255, 0)');
    } else {
      halo.addColorStop(0, `rgba(255, 225, 180, ${haloAlpha})`);
      halo.addColorStop(1, 'rgba(255, 210, 160, 0)');
    }
    ctx.beginPath();
    ctx.arc(px, py, haloR, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();
  }

  // Light source glow at origin
  const srcGlow = ctx.createRadialGradient(beamOriginX + 30, beamOriginY, 0, beamOriginX + 30, beamOriginY, 120);
  srcGlow.addColorStop(0, 'rgba(255, 250, 235, 0.4)');
  srcGlow.addColorStop(0.3, 'rgba(255, 235, 200, 0.15)');
  srcGlow.addColorStop(0.7, 'rgba(255, 220, 170, 0.03)');
  srcGlow.addColorStop(1, 'rgba(255, 210, 150, 0)');
  ctx.beginPath();
  ctx.arc(beamOriginX + 30, beamOriginY, 120, 0, Math.PI * 2);
  ctx.fillStyle = srcGlow;
  ctx.fill();

  // Subtle ambient particles drifting — implies motion frozen
  // A few larger, dimmer motes outside the beam
  for (let i = 0; i < 15; i++) {
    const x = 100 + rng() * 600;
    const y = 400 + rng() * 350;
    if (isInBeam(x, y) > 0.05) continue;
    const r = 1 + rng() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(160, 165, 185, ${0.08 + rng() * 0.07})`;
    ctx.fill();
  }

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Signature
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(255, 235, 200, 0.15)';
  ctx.textAlign = 'right';
  ctx.fillText('散射 / Scattering — Canary 2026', W - 20, H - 16);
})();
</script>
