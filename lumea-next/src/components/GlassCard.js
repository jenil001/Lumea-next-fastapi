'use client';

import { theme } from '@/lib/theme';

export default function GlassCard({ children, style = {}, className = "" }) {
  return (
    <div 
      className={`glass-card ${className}`}
      style={{
        background: theme.colors.glass,
        backdropFilter: 'blur(30px)',
        borderRadius: theme.borderRadius.xl,
        padding: '2rem',
        border: `1px solid ${theme.colors.glassBorder}`,
        boxShadow: 'var(--glass-shadow, 0 20px 50px rgba(0,0,0,0.5))',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
}
