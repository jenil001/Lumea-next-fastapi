'use client';

import { theme } from '@/lib/theme';

export default function PageHeader({ title, subtitle, description, alignment = 'center' }) {
  return (
    <section style={{ 
      textAlign: alignment, 
      marginBottom: '4rem', 
      animation: 'fadeIn 0.6s ease-out',
      width: '100%'
    }}>
      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '800', 
        letterSpacing: '-0.025em', 
        marginBottom: '0.4rem', 
        color: theme.colors.foreground,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        {title} {subtitle && <span style={{ color: theme.colors.primary, fontStyle: 'italic' }}>{subtitle}</span>}
      </h1>
      <p style={{ 
        color: theme.colors.muted, 
        fontSize: '1.1rem', 
        maxWidth: '600px', 
        margin: alignment === 'center' ? '0 auto' : '0', 
        lineHeight: '1.6' 
      }}>
        {description}
      </p>
    </section>
  );
}
