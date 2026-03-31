'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardPage() {
  const { currentTheme } = useTheme();
  const [greeting, setGreeting] = useState('Good evening');
  const [name, setName] = useState('Friend');
  const [moodEntries, setMoodEntries] = useState([]);
  const [recentJournal, setRecentJournal] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);
  const router = useRouter();

  const moodOptions = [
    { value: 1, label: 'Calm',    color: '#bac3ff', glow: 'rgba(186,195,255,0.5)' },
    { value: 2, label: 'Joyful',  color: '#f1e7ff', glow: 'rgba(241,231,255,0.5)' },
    { value: 3, label: 'Anxious', color: '#818cf8', glow: 'rgba(129,140,248,0.5)' },
    { value: 4, label: 'Sad',     color: '#7dd3fc', glow: 'rgba(125,211,252,0.5)' },
  ];

  // Deterministic positions for up to 10 stars (now particles)
  const posPresets = [
    { x: '20%', y: '25%' }, { x: '70%', y: '18%' }, { x: '45%', y: '75%' },
    { x: '80%', y: '60%' }, { x: '15%', y: '65%' }, { x: '55%', y: '35%' },
    { x: '35%', y: '50%' }, { x: '88%', y: '30%' }, { x: '10%', y: '45%' }, { x: '65%', y: '80%' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
        setName(displayName);

        // Fetch last 7 mood entries
        const { data: moods } = await supabase
          .from('mood_entries').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(7);
        const entries = moods || [];
        setMoodEntries(entries);

        // Fetch latest journal entry
        const { data: journals } = await supabase
          .from('journal_entries').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(1);
        setRecentJournal(journals?.[0] || null);

        // Fetch AI insight
        if (entries.length > 0) {
          try {
            const res = await fetch('http://localhost:8000/api/mood-insight', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entries, themeId: currentTheme.id })
            });
            const json = await res.json();
            setAiInsight(json.insight || '');
          } catch { 
            setAiInsight(currentTheme.id === 'night-sky' ? 'Your stars are aligning beautifully.' : 'Your emotional journey is unfolding beautifully.'); 
          }
        } else {
          setAiInsight(currentTheme.copy.moodSubtitle);
        }
        setInsightLoading(false);
      }
    };
    fetchData();
  }, [currentTheme.copy.moodSubtitle]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      {/* 1. Personalized Greeting Section */}
      <section style={{ marginBottom: '3rem', animation: 'fadeIn 0.8s ease-out' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          letterSpacing: '-0.025em', 
          marginBottom: '0.8rem', 
          color: 'var(--foreground)',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {currentTheme.id === 'night-sky' ? `${greeting}, ${name}` : 'Dashboard'}
        </h1>
        <p style={{ 
          color: 'var(--muted)', 
          fontSize: '1.2rem', 
          maxWidth: '600px', 
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          {currentTheme.id === 'night-sky' 
            ? `${currentTheme.copy.dashboardGreetingSuffix}. Your inner sky is clear today.`
            : "Welcome back to your sanctuary. Here's an overview of your progress."}
        </p>
      </section>

      {/* 2. Quick Actions */}
      <section className="bento-grid" style={{ marginBottom: '4rem' }}>
        {/* Connect / Start Chat */}
        <button className="bento-3" onClick={() => router.push('/dashboard/chat')} style={{ 
          background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`, 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: 'none', 
          cursor: 'pointer', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s',
          textAlign: 'left',
          width: '100%'
        }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', fontWeight: '700' }}>Connect</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Start Chat</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#fff' }}>forum</span>
        </button>

        {/* Log / Record Mood */}
        <button className="bento-3" onClick={() => router.push('/dashboard/mood')} style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: `1px solid var(--glass-border)`, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'left',
          width: '100%',
          boxShadow: 'var(--glass-shadow)'
        }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: '700' }}>Log</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>Record Mood</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>wb_twilight</span>
        </button>

        {/* Write / New Journal */}
        <button className="bento-3" onClick={() => router.push('/dashboard/journal')} style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: `1px solid var(--glass-border)`, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'left',
          width: '100%',
          boxShadow: 'var(--glass-shadow)'
        }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: '700' }}>Write</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>New Journal</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>auto_stories</span>
        </button>
      </section>

      {/* 3. Bento Grid for Summaries */}
      <section className="bento-grid" style={{ marginBottom: '4rem' }}>
        {/* Mood Summary / Galaxy Mini */}
        <div className="bento-7">
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--foreground)', marginBottom: '0.25rem' }}>{currentTheme.copy.moodTitle}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
                  {insightLoading ? 'Analyzing...' : aiInsight}
                </p>
              </div>
              <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{currentTheme.icon}</span>
            </div>

            {/* Live Mini Particle Gallery */}
            <div style={{ height: '200px', position: 'relative', borderRadius: '16px', background: 'var(--canvas-bg)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              {/* Ambient glow */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary-glow)', filter: 'blur(60px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

              {moodEntries.length === 0 ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: '600' }}>Record a mood to reveal your map</p>
                </div>
              ) : (
                moodEntries.map((entry, idx) => {
                  const opt = moodOptions.find(o => o.value === entry.mood) || moodOptions[0];
                  const pos = posPresets[idx % posPresets.length];
                  const size = 10 + (5 - entry.mood) * 2;
                  return (
                    <div key={idx} style={{
                      position: 'absolute', left: pos.x, top: pos.y,
                      transform: 'translate(-50%,-50%)',
                      width: `${size}px`, height: `${size}px`,
                      borderRadius: '50%',
                      background: opt.color,
                      boxShadow: `0 0 ${size * 2}px ${size}px ${opt.glow}`,
                      opacity: 0.85
                    }} />
                  );
                })
              )}

              {/* Connect nearby particles */}
              {moodEntries.length > 1 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }}>
                  {moodEntries.slice(0, 5).map((_, i) => {
                    if (i === 0) return null;
                    const a = posPresets[i - 1]; const b = posPresets[i];
                    return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--primary)" strokeWidth="0.8" />;
                  })}
                </svg>
              )}
            </div>

            {/* Real mood tags from entries */}
            {moodEntries.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {[...new Set(moodEntries.map(e => moodOptions.find(o => o.value === e.mood)?.label).filter(Boolean))].map(label => (
                  <span key={label} style={{ padding: '0.3rem 0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', fontSize: '0.7rem', color: 'var(--muted)' }}>{label}</span>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recent Journal Reflection */}
        <div className="bento-5">
          <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>menu_book</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)' }}>Recent Reflection</h3>
              </div>
              {recentJournal ? (
                <>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {new Date(recentJournal.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {recentJournal.title && (
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--foreground)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{recentJournal.title}</h4>
                  )}
                  <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6', color: 'var(--foreground)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{recentJournal.content}"
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--muted)', lineHeight: '1.6' }}>{currentTheme.copy.noJournalText}</p>
              )}
            </div>
            <button onClick={() => router.push('/dashboard/journal')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'flex-start', marginTop: '1.5rem' }}>
              {recentJournal ? 'Continue Writing' : 'Start Writing'} <span>➔</span>
            </button>
          </GlassCard>
        </div>
      </section>

      {/* 4. Theme-aware Guidance / Quote */}
      <section style={{ 
        position: 'relative', 
        padding: '4rem 2rem', 
        borderRadius: theme.borderRadius.xl, 
        overflow: 'hidden', 
        textAlign: 'center',
        background: 'var(--glass-bg)',
        border: `1px solid var(--glass-border)`,
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
          <img alt="Atmospheric background" src={currentTheme.id === 'desert' ? "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1000&q=80" : currentTheme.id === 'ocean' ? "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80" : "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--background), transparent, var(--background))' }}></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem', color: 'var(--primary)', opacity: 0.4 }}>“</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.4', color: 'var(--foreground)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {currentTheme.copy.quote}
          </p>
          <div style={{ width: '40px', height: '1px', background: 'var(--primary)' }}></div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)' }}>{currentTheme.copy.quoteSource}</span>
        </div>
      </section>

    </div>
  );
}

