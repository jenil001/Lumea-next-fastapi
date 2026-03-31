'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────────────
//  Canvas renderers — one per animated theme
// ─────────────────────────────────────────────

function renderNightSky(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let animationFrameId;
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const mouse = { x: -1000, y: -1000 };
  const onResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
  const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
  const onOut = () => { mouse.x = -1000; mouse.y = -1000; };
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseout', onOut);

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      if (Math.abs(this.vx) < 0.05) this.vx += 0.05 * Math.sign(this.vx || 1);
      if (Math.abs(this.vy) < 0.05) this.vy += 0.05 * Math.sign(this.vy || 1);
      this.baseAlpha = Math.random() * 0.6 + 0.1;
      const colors = ['255, 255, 255', '186, 195, 255', '241, 231, 255'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    draw() {
      const drawX = Math.round(this.x * 10) / 10;
      const drawY = Math.round(this.y * 10) / 10;
      const dx = mouse.x - drawX;
      const dy = mouse.y - drawY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let alpha = this.baseAlpha;
      let radius = this.radius;
      let boost = 0;
      if (dist < 180) {
        boost = (180 - dist) / 180;
        alpha = Math.min(1.0, this.baseAlpha + boost * 0.8);
        radius = this.radius + boost * 1.5;
      }
      ctx.beginPath();
      ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
      ctx.fill();
      if (boost > 0.4) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${((boost - 0.4) / 0.6) * 0.25})`;
        ctx.fill();
      }
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      this.draw();
    }
  }

  const count = width < 768 ? 80 : 250;
  const stars = Array.from({ length: count }, () => new Star());

  const animate = () => {
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, width, height);
    stars.forEach(s => s.update());
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseout', onOut);
    cancelAnimationFrame(animationFrameId);
  };
}

function renderDesert(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let animId, width = window.innerWidth, height = window.innerHeight;
  canvas.width = width; canvas.height = height;
  const onResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
  window.addEventListener('resize', onResize);

  class Grain {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.r = Math.random() * 1.2 + 0.3;
      this.vx = (Math.random() - 0.3) * 0.4;
      this.vy = Math.random() * 0.3 + 0.05;
      this.alpha = Math.random() * 0.5 + 0.1;
      const colors = ['250, 196, 130', '217, 119, 6', '251, 191, 36', '180, 120, 60'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.y > height) { this.y = -2; this.x = Math.random() * width; }
      if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  const grains = Array.from({ length: 320 }, () => new Grain());
  const animate = () => {
    ctx.fillStyle = '#1c0f05';
    ctx.fillRect(0, 0, width, height);
    // Horizon glow
    const grad = ctx.createLinearGradient(0, height * 0.55, 0, height);
    grad.addColorStop(0, 'rgba(217,119,6,0.08)');
    grad.addColorStop(1, 'rgba(28,15,5,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height * 0.55, width, height * 0.45);
    grains.forEach(g => g.update());
    animId = requestAnimationFrame(animate);
  };
  animate();
  return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
}

function renderOcean(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let animId, width = window.innerWidth, height = window.innerHeight;
  canvas.width = width; canvas.height = height;
  const onResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
  window.addEventListener('resize', onResize);

  class Bubble {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.r = Math.random() * 4 + 1.5;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.3 + 0.05;
      this.wobble = Math.random() * Math.PI * 2;
    }
    update() {
      this.y += this.vy;
      this.x += Math.sin(this.wobble) * 0.4;
      this.wobble += 0.02;
      this.vx += (Math.random() - 0.5) * 0.02;
      this.x += this.vx;
      if (this.y < -20) this.reset();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(103, 232, 249, ${this.alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 211, 238, ${this.alpha * 1.5})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  const bubbles = Array.from({ length: 180 }, () => { const b = new Bubble(); b.y = Math.random() * height; return b; });
  let waveT = 0;
  const animate = () => {
    ctx.fillStyle = '#020c14';
    ctx.fillRect(0, 0, width, height);
    // Deep ocean glow
    const glow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, height * 0.8);
    glow.addColorStop(0, 'rgba(14, 116, 144, 0.12)');
    glow.addColorStop(1, 'rgba(2, 12, 20, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    // Subtle wave lines
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const y = height * (0.3 + i * 0.12) + Math.sin((x / 180) + waveT + i) * 12;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    waveT += 0.008;
    bubbles.forEach(b => b.update());
    animId = requestAnimationFrame(animate);
  };
  animate();
  return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
}

function renderDark(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let animId, width = window.innerWidth, height = window.innerHeight;
  canvas.width = width; canvas.height = height;
  const onResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
  window.addEventListener('resize', onResize);

  class Mote {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : height + 10;
      this.r = Math.random() * 1 + 0.3;
      this.vy = -(Math.random() * 0.2 + 0.05);
      this.vx = (Math.random() - 0.5) * 0.1;
      this.alpha = Math.random() * 0.2 + 0.03;
    }
    update() {
      this.y += this.vy; this.x += this.vx;
      if (this.y < -10) this.reset();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 212, 216, ${this.alpha})`;
      ctx.fill();
    }
  }

  const motes = Array.from({ length: 120 }, () => new Mote());
  const animate = () => {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);
    motes.forEach(m => m.update());
    animId = requestAnimationFrame(animate);
  };
  animate();
  return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
}

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────

export default function DynamicBackground() {
  const { themeId } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 'none' theme has no canvas — just CSS gradient
    if (themeId === 'none') {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';

    const renderers = {
      'night-sky': renderNightSky,
      desert: renderDesert,
      ocean: renderOcean,
      dark: renderDark,
    };

    const renderer = renderers[themeId];
    if (renderer) {
      const cleanup = renderer(canvas);
      return cleanup;
    }
  }, [themeId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
}
