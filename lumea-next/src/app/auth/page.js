'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || "Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      {/* Brand Header */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '-0.5rem' }}>🌙</h1>
        <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.2rem' }}>Lumea</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>Your Compassionate AI Companion</p>
      </div>

      {/* Auth Card */}
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', animationDelay: '0.2s' }}>
        
        {/* Tabs */}
        <div className="tabs-header">
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
        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Welcome Back</h3>
            
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In ✨'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Create Account</h3>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Create a password (min 8 chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating...' : 'Join Lumea 🌟'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
