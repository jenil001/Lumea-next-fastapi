'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ name: 'Friend', joinDate: 'March 2026' });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const name = user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
        const date = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        setUserData({ name, joinDate: date });
      }
    };
    fetchUser();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      
      <PageHeader 
        title="Celestial"
        subtitle="Identity"
        description="Manage your sanctuary settings and personal details. Your journey is uniquely yours."
      />

      <div className="bento-grid" style={{ gap: '1.5rem' }}>
        <section className="bento-12 glass-card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(30,32,47,0.4)', borderRadius: theme.borderRadius.xl }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, ${theme.colors.primaryContainer} 0%, ${theme.colors.primary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            boxShadow: `0 0 30px ${theme.colors.primary}4D`
          }}>👤</div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: theme.colors.foreground, textTransform: 'capitalize', letterSpacing: '-0.025em' }}>{userData.name}</h2>
            <p style={{ color: theme.colors.onSurfaceVariant }}>Member since {userData.joinDate}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '20px', fontSize: '0.75rem', color: theme.colors.primary, border: `1px solid ${theme.colors.primary}33` }}>Celestial Core</span>
              <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(186, 195, 255, 0.1)', borderRadius: '20px', fontSize: '0.75rem', color: theme.colors.tertiary, border: `1px solid ${theme.colors.tertiary}33` }}>Stellar Mindset</span>
            </div>
          </div>
        </section>

        <section className="bento-6 glass-card" style={{ padding: '2rem', background: 'rgba(25,27,40,0.4)', borderRadius: theme.borderRadius.lg }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: theme.colors.foreground }}>Sanctuary Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.onSurfaceVariant, fontSize: '0.9rem' }}>
              <span>Night Mode</span>
              <span style={{ color: theme.colors.primary, fontWeight: '700' }}>Always On</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.onSurfaceVariant, fontSize: '0.9rem' }}>
              <span>Ambient Sounds</span>
              <span style={{ color: theme.colors.primary, fontWeight: '700' }}>Enabled</span>
            </div>
          </div>
        </section>

        <section className="bento-6 glass-card" style={{ padding: '2rem', background: 'rgba(25,27,40,0.4)', borderRadius: theme.borderRadius.lg }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: theme.colors.foreground }}>Account Security</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.colors.glassBorder}`, borderRadius: theme.borderRadius.md, color: theme.colors.foreground, cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Change Password</button>
            <button style={{ width: '100%', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: theme.borderRadius.md, color: '#f87171', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Delete Identity</button>
          </div>
        </section>
      </div>
    </div>
  );
}
