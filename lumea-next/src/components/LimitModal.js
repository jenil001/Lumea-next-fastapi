'use client';

export default function LimitModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(var(--background-rgb, 0, 0, 0), 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '500px',
        width: '90%',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Celestial Backdrop in Modal */}
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.1)', filter: 'blur(50px)', top: '-50px', right: '-50px', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--primary-glow)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem auto',
            border: '1px solid var(--glass-border)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>bedtime</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--foreground)' }}>Celestial Energy Low</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            You've shared <span style={{ color: 'var(--primary)', fontWeight: '700' }}>100 thoughts</span> today. Your inner sky needs time to settle and recharge. 
            <br /><br />
            Please return tomorrow to continue your journey.
          </p>

          <button 
            onClick={onClose}
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '30px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--glass-shadow)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
