'use client';

import { useEffect, useRef } from 'react';

export default function SkyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: false if the canvas fully covers the screen with solid background, speeds up rendering.
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking Coordinates
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Reset mouse pos if leaves window
    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mouseout', handleMouseOut);

    class Star {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.5 + 0.5; // Base radius
        
        // Random slow drift vector (-0.1 to 0.1 px/frame)
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        
        // Ensure not completely static
        if (Math.abs(this.vx) < 0.05) this.vx += 0.05 * Math.sign(this.vx || 1);
        if (Math.abs(this.vy) < 0.05) this.vy += 0.05 * Math.sign(this.vy || 1);

        this.baseAlpha = Math.random() * 0.6 + 0.1; // Base brightness between 0.1 and 0.7
        
        // Lumea's Celestial Theme Colors: pure white, muted lavender, light indigo
        const colors = [
          '255, 255, 255',   // White
          '186, 195, 255',   // Light muted blue 
          '241, 231, 255'    // Lavender
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      draw() {
        ctx.beginPath();
        
        // Sub-pixel positions for smooth dragging drifting
        const drawX = Math.round(this.x * 10) / 10;
        const drawY = Math.round(this.y * 10) / 10;

        // Calculate straight line distance to active absolute mouse cursor position
        const dx = mouse.x - drawX;
        const dy = mouse.y - drawY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let currentAlpha = this.baseAlpha;
        let currentRadius = this.radius;
        let glowBoost = 0;
        
        // Interaction Logic: Close proximity sharply boosts luminosity 
        if (distance < 180) {
          glowBoost = (180 - distance) / 180;
          currentAlpha = Math.min(1.0, this.baseAlpha + (glowBoost * 0.8));
          currentRadius = this.radius + (glowBoost * 1.5); // Gently swell size
        }

        ctx.arc(drawX, drawY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${currentAlpha})`;
        ctx.fill();

        // Bonus: Provide an expansive aura "halo" when the mouse is incredibly close
        if (glowBoost > 0.4) {
           ctx.beginPath();
           // Draw larger blur
           ctx.arc(drawX, drawY, currentRadius * 4, 0, Math.PI * 2);
           const outerAura = (glowBoost - 0.4) / 0.6; // Scale correctly
           ctx.fillStyle = `rgba(${this.color}, ${outerAura * 0.25})`; // Soft halo
           ctx.fill();
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around viewport boundaries naturally
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.draw();
      }
    }

    const starCount = width < 768 ? 80 : 250; // Responsive density
    const stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    const animate = () => {
      // Background void fill matches #05060b
      ctx.fillStyle = '#05060b';
      ctx.fillRect(0, 0, width, height);

      // Instruct stars
      for (let i = 0; i < stars.length; i++) {
          stars[i].update();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Kick-off animation loop
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        pointerEvents: 'none' // Ensures canvas NEVER intercepts layout clicks/scrolls
      }}
    />
  );
}
