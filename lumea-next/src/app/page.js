'use client';

import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { currentTheme } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Scroll-triggered animations via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.05
    });

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 0);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const features = [
    { emoji: "💬", title: "Empathic Chat", desc: "Reflective conversations designed to validate emotions and reduce stress in real-time." },
    { emoji: "📊", title: "Mood Analytics", desc: "Log feelings easily and view beautiful visual dashboards to spot cyclical triggers." },
    { emoji: "📓", title: "Secure Journal", desc: "A private, structured space to pen thoughts into structured digital archives safely." }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <ThemeSwitcher isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Navbar Header */}
      <header className="glass-card" style={{
        position: 'sticky',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        width: 'calc(100% - 2rem)',
        maxWidth: '1200px',
        margin: '1rem auto 0 auto',
        padding: '0.8rem 2rem',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.6rem' }}>{currentTheme.icon}</span>
          <span className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: '800' }}>Lumea</span>
        </div>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => setIsThemeOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '12px',
              transition: 'background 0.3s'
            }}
            className="nav-link"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>palette</span>
            <span>{currentTheme.label}</span>
          </button>
          <a href="#about" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }} className="nav-link">About</a>
          <a href="#features" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }} className="nav-link">Features</a>
          <a href="#contact" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }} className="nav-link">Contact</a>
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="btn-primary" 
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
        </nav>
      </header>

      <style>{`
        .nav-link { transition: color 0.3s ease; }
        .nav-link:hover { color: var(--foreground) !important; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflowX: 'hidden' }}>

        {/* Floating backdrop blur mesh */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -2 }}></div>
        <div style={{ position: 'absolute', bottom: '30%', right: '25%', width: '350px', height: '350px', background: 'radial-gradient(circle, var(--primary-glow) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -2 }}></div>

        {/* 1. Hero Section */}
        <section style={{ 
          minHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '0 2rem', 
          textAlign: 'center' 
        }}>
          <h1 className="text-gradient reveal" style={{ 
            fontSize: '5.5rem', 
            fontWeight: '900', 
            lineHeight: '1.1', 
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 30px var(--primary-glow))',
            whiteSpace: 'pre-line'
          }}>
            {currentTheme.copy.heroHeadline}
          </h1>
          <p className="reveal" style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '1.5rem 0 2.5rem 0', lineHeight: '1.6' }}>
            {currentTheme.copy.heroTagline}
          </p>
          <button onClick={() => setIsAuthOpen(true)} className="btn-primary reveal" style={{ padding: '1rem 2.2rem', fontSize: '1.15rem' }}>
            {currentTheme.copy.heroCTA}
          </button>
        </section>


        {/* 2. Features Grid */}
        <section id="features" style={{ width: '100%', maxWidth: '1100px', padding: '5rem 2rem', textAlign: 'center' }}>
          <h2 className="reveal" style={{ position: 'relative', fontSize: '2.5rem', marginBottom: '3.3rem', fontWeight: '800', display: 'inline-block' }}>
            <div className="neon-orb" style={{ width: '200px', height: '200px', background: 'var(--primary)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}></div>
            Features Crafted For Mindful Rest
          </h2>
          
          <div className="bento-grid">
            {/* 1. Empathic Chat (8 Col) */}
            <div className="feature-card bento-8 reveal" style={{ padding: '2.5rem', transitionDelay: '0s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
              <div>
                <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px var(--primary-glow)' }}>💬</div>
                <h3 style={{ marginBottom: '0.8rem', fontSize: '1.5rem', fontWeight: '800' }}>Empathic Chat</h3>
                <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '400px' }}>Engage in deep, empathetic conversations. Lumea understands your feelings and offers comfort whenever you need it.</p>
              </div>
              <div style={{ marginTop: '2rem', padding: '1.2rem', background: 'var(--glass-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontSize: '0.95rem' }}>"I'm here to listen, exactly as you are."</span>
              </div>
            </div>

            {/* 2. Mood Analytics (4 Col) */}
            <div className="feature-card bento-4 reveal" style={{ padding: '2.5rem', transitionDelay: '0.1s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
              <div>
                <div style={{ width: '50px', height: '50px', background: 'var(--glass-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>📊</div>
                <h3 style={{ marginBottom: '0.8rem', fontSize: '1.35rem', fontWeight: '800' }}>Mood Cycles</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>Visualize your emotional tides. Track shifts over time to understand your personal rhythms.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', height: '80px', marginTop: '2rem', padding: '0 0.5rem' }}>
                <div style={{ flex: 1, background: 'var(--primary-glow)', height: '40%', borderRadius: '4px' }}></div>
                <div style={{ flex: 1, background: 'var(--primary-glow)', height: '60%', borderRadius: '4px', opacity: 0.8 }}></div>
                <div style={{ flex: 1, background: 'var(--primary)', height: '100%', borderRadius: '4px', boxShadow: '0 0 15px var(--primary-glow)' }}></div>
                <div style={{ flex: 1, background: 'var(--primary-glow)', height: '70%', borderRadius: '4px', opacity: 1.2 }}></div>
                <div style={{ flex: 1, background: 'var(--primary-glow)', height: '50%', borderRadius: '4px', opacity: 0.6 }}></div>
              </div>
            </div>

            {/* 3. Secure Journal (12 Col) */}
            <div className="feature-card bento-12 reveal" style={{ padding: '2.5rem', transitionDelay: '0.2s', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', textAlign: 'left' }}>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--glass-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>📓</div>
                <h3 style={{ marginBottom: '0.8rem', fontSize: '1.5rem', fontWeight: '800' }}>Reflective Journal</h3>
                <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>A private, structured space for your thoughts. Lumea provides gentle prompts to help navigate through complex emotions.</p>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', border: '1px solid var(--glass-border)' }}>Guided Prompts</span>
                  <span style={{ padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', border: '1px solid var(--glass-border)' }}>🔒 End-to-End Privacy</span>
                </div>
              </div>
              <div style={{ flex: '1 1 200px', height: '180px', background: 'var(--glass-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'grayscale(0.5) opacity(0.7)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ fontSize: '4rem' }}>📓</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. About Section */}
        <section id="about" style={{ width: '100%', maxWidth: '900px', padding: '6rem 2rem', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div className="reveal" style={{ flex: '1 1 400px' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.2rem', fontWeight: '800' }}>Our Mission</h2>
            <p style={{ color: 'var(--muted)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Lumea was built to combine cutting-edge language models with empathetic psychological frameworks to support your mental wellness journey.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              We aren&apos;t creating a doctor; we are creating a **friend**—available 24/7 to listen without logs, judgment, or rush to solve. We structure safe active frameworks specifically designed to validate your unique feelings correctly.
            </p>
          </div>
          <div className="reveal" style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '300px', background: 'radial-gradient(transparent, var(--primary-glow)), url("https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80")', backgroundSize: 'cover', borderRadius: '30px', boxShadow: 'var(--glass-shadow)', border: '1px solid var(--glass-border)' }}></div>
          </div>
        </section>

        {/* 3.5. Testimonials / User Stories Section */}
        <section id="stories" style={{ width: '100%', maxWidth: '1100px', padding: '5rem 2rem', textAlign: 'center' }}>
          <h2 className="reveal text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}>Voices of Calm</h2>
          <p className="reveal" style={{ color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', fontSize: '1.05rem' }}>
            Real stories from members of our mindfulness community finding balance with Lumea frameworks organically.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { quote: "Lumea completely helps me frame my chaotic anxiety every night before sleeping. Floating stars and calming chats are my ritual.", author: "Anonymous, 24", tag: "#AnxietySupport" },
              { quote: "The CBT tool analysis makes me realize how often I 'Fortune Tell' negative outcomes. Mind-blowing structured awareness.", author: "Sarah, 21", tag: "#CBT #Growth" },
              { quote: "An AI that doesn't judge. It listens 24/7 without pushing solutions. Pure therapeutic validation inside pockets beautifully.", author: "David, 28", tag: "#Mindfulness" }
            ].map((story, idx) => (
              <div key={idx} className="glass-card reveal" style={{ padding: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--glass-border)', transitionDelay: `${idx * 0.1}s` }}>
                <p style={{ fontStyle: 'italic', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--foreground)', fontSize: '1rem' }}>&quot;{story.quote}&quot;</p>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>{story.author}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{story.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Disclaimer Section */}
        <section className="reveal" style={{ width: 'calc(100% - 4rem)', maxWidth: '1000px', margin: '4rem 2rem', padding: '0' }}>
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--glass-bg)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚨</div>
            <h2 style={{ fontSize: '1.8rem', color: '#f87171', marginBottom: '1rem', fontWeight: '800' }}>Safety Disclaimer</h2>
            <p style={{ color: 'var(--foreground)', fontSize: '1.05rem', margin: '0 auto 2rem auto', maxWidth: '700px', lineHeight: '1.6' }}>
              **Lumea is an AI companion.** It does not provide medical advice, diagnosis, or treatment. It cannot replace a human therapist or medical professional.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              If you or someone you know is in immediate absolute distress, please seek support helplines immediately.
              <br />
              <strong style={{ color: 'var(--foreground)' }}>India: 104 (Health helpline) | AASRA or Vandrevala Foundation.</strong>
            </p>
          </div>
        </section>

        {/* 5. Contact / Footer */}
        <section id="contact" className="reveal" style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Contact Us</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>We’re here to improve and serve. Drop your thoughts or feedback anytime.</p>
          
          <button className="btn-primary" style={{ padding: '0.6rem 2rem', fontSize: '0.95rem', borderRadius: '12px' }}>
            Support Portal ✉️
          </button>

          <footer style={{ marginTop: '4rem', color: '#64748b', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} Lumea Wellness. All rights reserved safely securely.
          </footer>
        </section>

      </main>

      {/* Pop up Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  );
}
