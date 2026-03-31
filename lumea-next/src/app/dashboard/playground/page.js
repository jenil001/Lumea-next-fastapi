'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '@/lib/theme';

const STAR_TYPES = [
  { label: 'Calm',    color: '#bac3ff', glow: 'rgba(186,195,255,0.6)', icon: 'flare',       size: 18 },
  { label: 'Joyful',  color: '#f1e7ff', glow: 'rgba(241,231,255,0.6)', icon: 'wb_sunny',    size: 22 },
  { label: 'Anxious', color: '#818cf8', glow: 'rgba(129,140,248,0.6)', icon: 'grain',       size: 14 },
  { label: 'Sad',     color: '#7dd3fc', glow: 'rgba(125,211,252,0.6)', icon: 'water_drop',  size: 16 },
  { label: 'Nova',    color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  icon: 'star',        size: 26 },
];

let nextId = 1;
function createStar(x, y, type) {
  return {
    id: nextId++,
    x, y,
    type,
    label: '',
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    born: Date.now(),
    pulse: Math.random() * Math.PI * 2,
  };
}

export default function PlaygroundPage() {
  const canvasRef = useRef(null);
  const [stars, setStars] = useState([]);
  const [selectedType, setSelectedType] = useState(0);
  const [dragId, setDragId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingStar, setEditingStar] = useState(null);
  const [labelInput, setLabelInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('playground_elapsed');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [showGuide, setShowGuide] = useState(true);

  const animFrameRef = useRef(null);
  const trailsRef = useRef([]);
  const canvasDims = useRef({ w: 800, h: 500 }); // updated via ResizeObserver

  // Track canvas size
  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      canvasDims.current = { w: width, h: height };
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // Dim guide after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowGuide(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Persistent session timer — counts up every second and saves to localStorage
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1;
        localStorage.setItem('playground_elapsed', next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Float + boundary bounce animation
  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      const { w, h } = canvasDims.current;
      setStars(prev => prev.map(s => {
        let { x, y, vx, vy } = s;
        const r = STAR_TYPES[s.type].size;

        x += vx;
        y += vy;

        // Boundary bounce
        if (x - r < 0)         { x = r;     vx = Math.abs(vx); }
        if (x + r > w)         { x = w - r; vx = -Math.abs(vx); }
        if (y - r < 0)         { y = r;     vy = Math.abs(vy); }
        if (y + r > h)         { y = h - r; vy = -Math.abs(vy); }

        return { ...s, x, y, vx, vy, pulse: s.pulse + 0.03 };
      }));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { active = false; cancelAnimationFrame(animFrameRef.current); };
  }, []);

  const handleCanvasClick = useCallback((e) => {
    if (dragId !== null) return; // Don't spawn when finishing a drag
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking an existing star
    const clicked = stars.find(s => {
      const r = STAR_TYPES[s.type].size + 10;
      return Math.hypot(s.x - x, s.y - y) < r;
    });

    if (clicked) {
      setEditingStar(clicked.id);
      setLabelInput(clicked.label || '');
    } else {
      const newStar = createStar(x, y, selectedType);
      trailsRef.current.push({ x, y, t: Date.now(), color: STAR_TYPES[selectedType].glow });
      setStars(prev => [...prev, newStar]);
      setShowGuide(false);
    }
  }, [stars, selectedType, dragId]);

  const handleMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    const star = stars.find(s => s.id === id);
    if (!star) return;
    const rect = e.currentTarget.closest('[data-canvas]').getBoundingClientRect();
    setDragId(id);
    setDragOffset({ x: e.clientX - rect.left - star.x, y: e.clientY - rect.top - star.y });
  }, [stars]);

  const handleMouseMove = useCallback((e) => {
    if (dragId === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setStars(prev => prev.map(s => s.id === dragId ? { ...s, x, y, vx: 0, vy: 0 } : s));
  }, [dragId, dragOffset]);

  const handleMouseUp = useCallback(() => setDragId(null), []);

  const deleteStar = (id) => {
    setStars(prev => prev.filter(s => s.id !== id));
    setEditingStar(null);
  };

  const saveLabel = () => {
    setStars(prev => prev.map(s => s.id === editingStar ? { ...s, label: labelInput } : s));
    setEditingStar(null);
  };

  const clearAll = () => {
    setStars([]);
    trailsRef.current = [];
  };

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            ✦ Star Playground
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Click anywhere to spawn stars. Drag to move. Click a star to label it.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {/* Session timer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Time in Playground</span>
            <span style={{
              fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.05em',
              color: '#bac3ff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0')}:{String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
            </span>
            <button
              onClick={() => { setElapsedSeconds(0); localStorage.setItem('playground_elapsed', '0'); }}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.65rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              reset
            </button>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.06)' }} />

          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stars.length} stars</span>
          <button onClick={clearAll} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
            Clear All
          </button>
        </div>
      </div>

      {/* Star Type Selector */}
      <div style={{ display: 'flex', gap: '0.8rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {STAR_TYPES.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedType(idx)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.2rem',
              borderRadius: '30px',
              border: selectedType === idx ? `1px solid ${t.color}` : '1px solid rgba(255,255,255,0.06)',
              background: selectedType === idx ? `${t.glow}22` : 'rgba(15,23,42,0.5)',
              color: selectedType === idx ? t.color : '#64748b',
              fontSize: '0.8rem', fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedType === idx ? `0 0 15px ${t.glow}` : 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        data-canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          flex: 1,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(30,41,59,0.8) 0%, rgba(2,6,23,0.95) 70%)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
          cursor: dragId ? 'grabbing' : 'crosshair',
          userSelect: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Ambient aurora blobs */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(129,140,248,0.04)', filter: 'blur(100px)', top: '0', left: '20%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(186,195,255,0.04)', filter: 'blur(80px)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

        {/* Subtle grid guide */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#bac3ff" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Guide hint */}
        {showGuide && stars.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', animation: 'fadeIn 0.5s ease' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#bac3ff', opacity: 0.2, marginBottom: '1rem' }}>touch_app</span>
            <p style={{ color: '#475569', fontSize: '1.1rem', fontStyle: 'italic' }}>Click anywhere to place a star</p>
          </div>
        )}

        {/* Stars */}
        {stars.map(star => {
          const t = STAR_TYPES[star.type];
          const pulseFactor = 1 + Math.sin(star.pulse) * 0.15;
          const size = t.size * pulseFactor;
          return (
            <div
              key={star.id}
              onMouseDown={(e) => handleMouseDown(e, star.id)}
              style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                transform: 'translate(-50%, -50%)',
                cursor: dragId === star.id ? 'grabbing' : 'grab',
                zIndex: dragId === star.id ? 100 : 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: dragId === star.id ? 'none' : 'none',
              }}
            >
              {/* Star orb */}
              <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: t.color,
                boxShadow: `0 0 ${20 * pulseFactor}px ${10 * pulseFactor}px ${t.glow}`,
                transition: 'width 0.1s, height 0.1s, box-shadow 0.1s',
              }} />

              {/* Label */}
              {star.label && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: '700', color: t.color,
                  background: 'rgba(2,6,23,0.7)', padding: '0.2rem 0.5rem',
                  borderRadius: '6px', backdropFilter: 'blur(8px)',
                  border: `1px solid ${t.color}33`,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  {star.label}
                </span>
              )}
            </div>
          );
        })}

        {/* Connection lines between nearby stars (SVG overlay) */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {stars.map((a, ai) =>
            stars.slice(ai + 1).map((b) => {
              const dist = Math.hypot(a.x - b.x, a.y - b.y);
              if (dist > 180) return null;
              const opacity = (1 - dist / 180) * 0.25;
              return (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="#bac3ff"
                  strokeWidth="0.8"
                  opacity={opacity}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Label Edit Modal */}
      {editingStar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingStar(null)}>
          <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', width: '360px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f8fafc', fontWeight: '800', margin: 0 }}>Name this Star</h3>
            <input
              autoFocus
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveLabel()}
              placeholder="e.g. Hope, Clarity, Growth..."
              style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.8rem 1rem', color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={saveLabel} style={{ flex: 1, background: 'linear-gradient(135deg, #3c4b9e, #293676)', border: 'none', borderRadius: '12px', color: '#fff', padding: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                Save
              </button>
              <button onClick={() => deleteStar(editingStar)} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#f87171', padding: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                Delete Star
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
