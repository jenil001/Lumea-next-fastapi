'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEMES, THEME_ORDER } from '@/lib/themes';

export default function ThemeSwitcher({ isOpen, onClose }) {
  const { themeId, setTheme } = useTheme();

  const handleSelect = (id) => {
    setTheme(id);
    // Keep panel open so user can preview
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Slide-in Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          height: '100vh',
          zIndex: 999,
          background: 'var(--background)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--glass-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isOpen ? 'all' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--foreground)', margin: 0 }}>
              Appearance
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.2rem 0 0 0' }}>
              Choose your environment
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '10px',
              color: 'var(--muted)',
              width: '34px', height: '34px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--glass-border)' }} />

        {/* Theme Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {THEME_ORDER.map((id) => {
            const t = THEMES[id];
            const isActive = themeId === id;
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '14px',
                  border: isActive
                    ? `1.5px solid var(--primary)`
                    : '1.5px solid var(--glass-border)',
                  background: isActive
                    ? 'var(--primary-glow)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isActive ? '0 0 0 1px var(--primary-glow) inset' : 'none',
                }}
              >
                {/* Swatch */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: t.swatchGradient,
                    flexShrink: 0,
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  {t.icon}
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    color: isActive ? 'var(--foreground)' : 'var(--muted)',
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', opacity: 0.8, marginTop: '0.1rem' }}>
                    {t.description}
                  </div>
                </div>

                {/* Active check */}
                {isActive && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.1rem', color: '#a5b4fc' }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: '0.7rem',
          color: 'var(--muted)',
          textAlign: 'center',
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--glass-border)'
        }}>
          Your theme preference is saved locally.
        </p>
      </aside>
    </>
  );
}
