'use client';

import { useState } from 'react';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';

export default function LunarBreathingPage() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="relative overflow-hidden w-full max-w-lg mx-auto" style={{ paddingBottom: '6rem' }}>
      
      {/* Ambient Orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '-15%', width: '384px', height: '384px', background: theme.colors.primary, opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '-15%', width: '384px', height: '384px', background: theme.colors.tertiary, opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }}></div>

      {/* Header */}
      <PageHeader 
        title="Lunar"
        subtitle="Solace"
        description="A celestial technique to center your mind. Box breathing helps regulate the nervous system, quieting the storm within."
      />

      {/* Reflection Orb / Breathing Guide */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '4rem', position: 'relative' }}>
        
        {/* The Orb Stack */}
        <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Inner Core */}
          <div className={`orb-core ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--primary)',
            borderRadius: '50%',
            boxShadow: '0 0 80px 20px var(--primary-glow)',
            opacity: 0.9,
            zIndex: 1
          }}></div>
          
          {/* Outer Pulse Rings */}
          <div className={`orb-ring-1 ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute', inset: 0, border: `1px solid ${theme.colors.primary}33`, borderRadius: '50%', opacity: 0.3, zIndex: 0
          }}></div>
          <div className={`orb-ring-2 ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute', inset: 0, border: `1px solid ${theme.colors.primary}1A`, borderRadius: '50%', opacity: 0.1, zIndex: 0
          }}></div>
          
          {/* Current Instruction */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
             <h2 className={`orb-text ${!isPlaying ? 'paused' : ''}`} style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}> </h2>
             <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>4 Seconds</p>
          </div>
        </div>

        {/* Phase Indicator Dots */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
          <div className={`dot dot-1 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-2 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-3 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-4 ${!isPlaying ? 'paused' : ''}`}></div>
        </div>
      </section>

      {/* Information & Technique */}
      <section style={{ width: '100%', marginBottom: '4rem' }}>
        {/* Bento Grid Instructions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {[
            { icon: 'air', title: 'Inhale', desc: 'Fill your lungs slowly for 4s.' },
            { icon: 'pause_circle', title: 'Hold', desc: 'Suspend your breath for 4s.' },
            { icon: 'wind_power', title: 'Exhale', desc: 'Release every drop for 4s.' },
            { icon: 'all_inclusive', title: 'Hold', desc: 'Wait in the stillness for 4s.' }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', padding: '1.25rem', borderRadius: theme.borderRadius.md, border: `1px solid var(--glass-border)`,
              transition: 'all 0.3s ease', cursor: 'default'
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>{item.icon}</span>
              <h4 style={{ fontWeight: '600', color: 'var(--foreground)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5rem', width: '100%' }}>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 3rem',
          background: 'var(--primary)', color: '#fff',
          borderRadius: theme.borderRadius.full, border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 30px var(--primary-glow)', transition: 'transform 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.025em' }}>{isPlaying ? 'Pause Practice' : 'Resume Practice'}</span>
        </button>
      </div>

      {/* Decorative Mood Card */}
      <div style={{ 
        width: '100%', padding: '2rem', borderRadius: theme.borderRadius.xl, position: 'relative', overflow: 'hidden',
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '8rem' }}>nights_stay</span>
        </div>
        
        <p style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Atmosphere</p>
        <h4 style={{ fontSize: '1.25rem', color: theme.colors.foreground, fontWeight: '700', marginBottom: '0.75rem' }}>Midnight Forest</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.onSurfaceVariant, marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>volume_up</span>
          <span style={{ fontSize: '0.85rem' }}>Soft wind and distant crickets</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '4px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--primary)', borderRadius: '4px' }}></div>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>12:04 / 20:00</span>
        </div>
      </div>

      {/* Inject Scoped CSS for Animations */}
      <style>{`
        /* 16 Second Total Loop: 4s Inhale (0-25%), 4s Hold (25-50%), 4s Exhale (50-75%), 4s Hold (75-100%) */
        @keyframes breath-cycle {
          0%, 100% { transform: scale(1); }
          25%, 50% { transform: scale(1.4); }
          75%, 99.9% { transform: scale(1); }
        }

        @keyframes breath-ring-1 {
          0%, 100% { transform: scale(1.25); opacity: 0.15; }
          25%, 50% { transform: scale(1.65); opacity: 0.3; }
          75%, 99.9% { transform: scale(1.25); opacity: 0.15; }
        }

        @keyframes breath-ring-2 {
          0%, 100% { transform: scale(1.5); opacity: 0.05; }
          25%, 50% { transform: scale(1.9); opacity: 0.1; }
          75%, 99.9% { transform: scale(1.5); opacity: 0.05; }
        }

        @keyframes breath-text {
          0%, 24.9% { content: 'Inhale'; }
          25%, 49.9% { content: 'Hold'; }
          50%, 74.9% { content: 'Exhale'; }
          75%, 100% { content: 'Hold'; }
        }

        /* Dot Indicators */
        @keyframes active-dot-1 {
          0%, 24.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          25%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-2 {
          0%, 24.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          25%, 49.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          50%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-3 {
          0%, 49.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          50%, 74.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          75%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-4 {
          0%, 74.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          75%, 100% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
        }

        .orb-core { animation: breath-cycle 16s ease-in-out infinite; }
        .orb-ring-1 { animation: breath-ring-1 16s ease-in-out infinite; }
        .orb-ring-2 { animation: breath-ring-2 16s ease-in-out infinite; }
        .orb-text::after { content: 'Inhale'; animation: breath-text 16s infinite; }
        
        .dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--glass-border); background: transparent; }
        .dot-1 { animation: active-dot-1 16s infinite; }
        .dot-2 { animation: active-dot-2 16s infinite; }
        .dot-3 { animation: active-dot-3 16s infinite; }
        .dot-4 { animation: active-dot-4 16s infinite; }

        .paused { animation-play-state: paused !important; }
      `}</style>

    </div>
  );
}
