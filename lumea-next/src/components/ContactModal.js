'use client';

import { useState } from 'react';

export default function ContactModal({ isOpen, onClose }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("Your message has been sent to the Lumea team! 🌌✨");
      setIsSending(false);
      setSubject('');
      setBody('');
      onClose();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'var(--background)',
        border: '1px solid var(--glass-border)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <header style={{ marginBottom: '2rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Reach Out to the Stars</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Have a question or feedback? Share your thoughts with the Lumea team.</p>
        </header>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Subject</label>
            <input 
              required
              type="text" 
              placeholder="What's on your mind?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'var(--background)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Your Message</label>
            <textarea 
              required
              rows="5"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'var(--background)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            ></textarea>
          </div>

          <button 
            disabled={isSending}
            type="submit"
            className="btn-primary"
            style={{ 
              marginTop: '1rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: isSending ? 0.7 : 1,
              cursor: isSending ? 'not-allowed' : 'pointer'
            }}
          >
            {isSending ? (
              <>
                <span className="material-symbols-outlined animate-spin">cyclone</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
