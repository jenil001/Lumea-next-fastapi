'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  // Handle case where Supabase client is not initialized
  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication is not configured. Please check environment variables.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/dashboard');
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || "Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication is not configured. Please check environment variables.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (signUpError) throw signUpError;

      setMessage("✅ Account created! Please check your email to verify.");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      
      <div className="glass-card animate-scale-up" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        position: 'relative',
        padding: '2rem',
        backgroundColor: 'var(--background)',
        border: '1px solid var(--glass-border)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.2rem',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '1.4rem',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.color = 'var(--foreground)'}
          onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
        >
          ✕
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>Lumea</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Your Compassionate AI Companion</p>
        </div>

        {/* Tabs */}
        <div className="tabs-header" style={{ marginBottom: '1.2rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setError(''); setMessage(''); }}
          >
            🔐 Sign In
          </button>
          <button 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
          >
            ✨ Sign Up
          </button>
        </div>

        {/* Status Messages */}
        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ padding: '0.65rem', fontSize: '0.95rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ padding: '0.65rem', marginBottom: '1.2rem', fontSize: '0.95rem' }}
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In ✨'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={{ padding: '0.65rem', fontSize: '0.95rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ padding: '0.65rem', fontSize: '0.95rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ padding: '0.65rem', fontSize: '0.95rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              style={{ padding: '0.65rem', marginBottom: '1.2rem', fontSize: '0.95rem' }}
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Creating...' : 'Join Lumea 🌟'}
            </button>
          </form>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
