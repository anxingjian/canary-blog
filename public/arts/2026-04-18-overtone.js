(() => {
  const container = document.getElementById('art-container');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Palette — arctic teal, electric violet, silver-white on charcoal
  const BG = '#1a1a2e';
  const TEAL = [45, 212, 191];    // odd harmonics
  const VIOLET = [139, 92, 246];  // even harmonics
  const SILVER = [226, 232, 240]; // nodes
  const DIM_TEAL = [45, 212, 191, 0.15];
  const DIM_VIOLET = [139, 92, 246, 0.15];

  let W, H, dpr;
  let harmonics = 3; // start with 3 harmonics
  const MAX_HARMONICS = 12;
  let time = 0;
  let particles = [];
  const NUM_PARTICLES = 200;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 2,
        harmonic: Math.floor(Math.random() * harmonics) + 1
      });
    }
  }

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  function lerpColor(c1, c2, t) {
    return [
      c1[0] + (c2[0] - c1[0]) * t,
      c1[1] + (c2[1] - c1[1]) * t,
      c1[2] + (c2[2] - c1[2]) * t
    ];
  }

  // Standing wave: y = A * sin(n * pi * x / L) * cos(omega * t)
  function waveY(x, n, t, amplitude) {
    return amplitude * Math.sin(n * Math.PI * x) * Math.cos(n * 0.8 * t);
  }

  function compositeWave(x, t, maxN) {
    let sum = 0;
    for (let n = 1; n <= maxN; n++) {
      const amp = 1.0 / n;
      sum += waveY(x, n, t, amp);
    }
    return sum;
  }

  function draw() {
    time += 0.015;

    // Background with slight trail
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(226,232,240,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const x = (i / 20) * W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    const margin = W * 0.08;
    const waveW = W - margin * 2;
    const sectionH = H / (harmonics + 2); // +1 for composite, +1 for spacing

    // Draw individual harmonics
    for (let n = 1; n <= harmonics; n++) {
      const baseY = sectionH * n;
      const amplitude = sectionH * 0.35;
      const isOdd = n % 2 === 1;
      const color = isOdd ? TEAL : VIOLET;

      // Glow layer
      ctx.beginPath();
      ctx.strokeStyle = rgba(color, 0.1);
      ctx.lineWidth = 8;
      for (let px = 0; px <= waveW; px += 2) {
        const xNorm = px / waveW;
        const y = baseY + waveY(xNorm, n, time, amplitude);
        if (px === 0) ctx.moveTo(margin + px, y);
        else ctx.lineTo(margin + px, y);
      }
      ctx.stroke();

      // Main line
      ctx.beginPath();
      ctx.strokeStyle = rgba(color, 0.7);
      ctx.lineWidth = 2;
      for (let px = 0; px <= waveW; px += 2) {
        const xNorm = px / waveW;
        const y = baseY + waveY(xNorm, n, time, amplitude);
        if (px === 0) ctx.moveTo(margin + px, y);
        else ctx.lineTo(margin + px, y);
      }
      ctx.stroke();

      // Nodes — zero crossings of the standing wave spatial component
      for (let k = 0; k <= n; k++) {
        const nodeX = margin + (k / n) * waveW;
        const nodeY = baseY;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + k);

        // Node glow
        const grad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, 6 + pulse * 4);
        grad.addColorStop(0, rgba(SILVER, 0.8));
        grad.addColorStop(1, rgba(SILVER, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 6 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();

        // Node dot
        ctx.fillStyle = rgba(SILVER, 0.9);
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Harmonic label
      ctx.fillStyle = rgba(color, 0.4);
      ctx.font = `${Math.max(10, W * 0.012)}px monospace`;
      ctx.fillText(`n=${n}`, margin - W * 0.06, baseY + 4);
    }

    // Composite waveform at top
    const compY = sectionH * (harmonics + 1.2);
    const compAmp = sectionH * 0.4;

    // Composite glow
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(200, 210, 230, 0.08)';
    ctx.lineWidth = 12;
    for (let px = 0; px <= waveW; px += 2) {
      const xNorm = px / waveW;
      const y = compY + compositeWave(xNorm, time, harmonics) * compAmp;
      if (px === 0) ctx.moveTo(margin + px, y);
      else ctx.lineTo(margin + px, y);
    }
    ctx.stroke();

    // Composite line with gradient
    for (let px = 0; px < waveW - 2; px += 2) {
      const xNorm = px / waveW;
      const xNorm2 = (px + 2) / waveW;
      const y1 = compY + compositeWave(xNorm, time, harmonics) * compAmp;
      const y2 = compY + compositeWave(xNorm2, time, harmonics) * compAmp;
      const t = px / waveW;
      const c = lerpColor(TEAL, VIOLET, t);
      ctx.beginPath();
      ctx.strokeStyle = rgba(c, 0.85);
      ctx.lineWidth = 2.5;
      ctx.moveTo(margin + px, y1);
      ctx.lineTo(margin + px + 2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(200,210,230,0.3)';
    ctx.font = `${Math.max(10, W * 0.012)}px monospace`;
    ctx.fillText('composite', margin - W * 0.06, compY + 4);

    // Particles — orbit around antinodes
    for (const p of particles) {
      const n = Math.min(p.harmonic, harmonics);
      const isOdd = n % 2 === 1;
      const color = isOdd ? TEAL : VIOLET;
      const baseY_p = sectionH * n;

      // Find nearest antinode
      const antinodes = [];
      for (let k = 0; k < n; k++) {
        antinodes.push(margin + ((k + 0.5) / n) * waveW);
      }
      let nearestX = antinodes[0];
      let minDist = Math.abs(p.x - antinodes[0]);
      for (let k = 1; k < antinodes.length; k++) {
        const d = Math.abs(p.x - antinodes[k]);
        if (d < minDist) { minDist = d; nearestX = antinodes[k]; }
      }

      // Attract to antinode with wave displacement
      const xNorm = (nearestX - margin) / waveW;
      const waveDisp = waveY(xNorm, n, time, sectionH * 0.35);

      const dx = nearestX - p.x;
      const dy = (baseY_p + waveDisp) - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

      // Orbital force
      p.vx += dx / dist * 0.05 + (-dy / dist) * 0.03;
      p.vy += dy / dist * 0.05 + (dx / dist) * 0.03;

      // Damping
      p.vx *= 0.96;
      p.vy *= 0.96;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const alpha = Math.max(0.2, 1 - dist / (waveW * 0.3));
      ctx.fillStyle = rgba(color, alpha * 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        const threshold = 2500;
        if (dist < threshold) {
          const alpha = (1 - dist / threshold) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = rgba(SILVER, alpha);
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Title
    ctx.fillStyle = rgba(SILVER, 0.15);
    ctx.font = `${Math.max(14, W * 0.025)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText('OVERTONE 泛音', W - margin, H - 20);
    ctx.textAlign = 'left';
    ctx.fillStyle = rgba(SILVER, 0.1);
    ctx.font = `${Math.max(10, W * 0.012)}px monospace`;
    ctx.fillText(`harmonics: ${harmonics}/${MAX_HARMONICS}  •  click to add`, margin, H - 20);

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('click', () => {
    if (harmonics < MAX_HARMONICS) {
      harmonics++;
      // Add more particles for new harmonic
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          size: 1 + Math.random() * 2,
          harmonic: harmonics
        });
      }
    }
  });

  window.addEventListener('resize', resize);
  resize();
  initParticles();
  draw();
})();
