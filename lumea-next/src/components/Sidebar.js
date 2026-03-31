'use client';

import { useState, useEffect } from 'react';
import { theme } from '@/lib/theme';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/contexts/ThemeContext';

export default function Sidebar({ onOpenContact }) {
  const pathname = usePathname();
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(0);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const checkLimit = () => {
      const storedData = localStorage.getItem('lumea_usage');
      const today = new Date().toLocaleDateString();
      
      if (storedData) {
        const { count, date } = JSON.parse(storedData);
        if (date === today) {
          setMessageCount(count);
        } else {
          localStorage.setItem('lumea_usage', JSON.stringify({ count: 0, date: today }));
          setMessageCount(0);
        }
      } else {
        localStorage.setItem('lumea_usage', JSON.stringify({ count: 0, date: today }));
      }
    };

    checkLimit();
    const interval = setInterval(checkLimit, 3000);
    return () => clearInterval(interval);
  }, []);

  const allPages = [
    { title: "Dashboard", href: "/dashboard", icon: "grid_view" },
    { title: "Chat Companion", href: "/dashboard/chat", icon: "forum" },
    { title: "Mood Tracker", href: "/dashboard/mood", icon: "wb_twilight" },
    { title: "Journal", href: "/dashboard/journal", icon: "auto_stories" },
    { title: "Breathing Exercise", href: "/dashboard/breathing", icon: "bedtime" },
    { title: "Mindset Reframe", href: "/dashboard/cbt", icon: "psychology" },
    { title: "Playground", href: "/dashboard/playground", icon: "auto_awesome" },
  ];

  // Playground is ONLY for Night Sky
  const pages = allPages.filter(page => {
    if (page.title === "Playground" && currentTheme.id !== 'night-sky') return false;
    return true;
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  return (
    <>
      <ThemeSwitcher isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      <aside className="glass-card" style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRadius: `0 ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0`,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        borderLeft: 'none',
        borderRight: `1px solid var(--glass-border)`
      }}>
        
        {/* Brand */}
        <div style={{ paddingBottom: '2rem', textAlign: 'center' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>Lumea</h2>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Navigation
        </p>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {pages.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: theme.borderRadius.md,
                  color: isActive ? 'var(--primary)' : 'var(--foreground)',
                  backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                  border: isActive ? `1px solid var(--primary)` : '1px solid transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '700' : '400',
                  transition: 'all 0.2s ease'
                }}
                className={!isActive ? 'nav-hover' : ''}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{link.icon}</span>
                <span>{link.title}</span>
              </Link>
            );
          })}

          {/* Daily Message Limit Indicator */}
          <div style={{
            padding: '1rem',
            marginBottom: '0.5rem',
            marginTop: 'auto',
            background: 'var(--glass-bg)',
            borderRadius: theme.borderRadius.lg,
            border: `1px solid var(--glass-border)`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
              <span>Daily Spirit</span>
              <span>{messageCount}/100</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--glass-bg)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (messageCount / 100) * 100)}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, var(--secondary), var(--primary))`,
                boxShadow: `0 0 10px var(--primary-glow)`,
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}></div>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center' }}>Daily limit: 100 messages</p>
          </div>

          {/* Theme Button */}
          <button 
            onClick={() => setIsThemeOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              color: 'var(--foreground)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
              outline: 'none'
            }}
            className="nav-hover"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>palette</span>
            <span>Theme</span>
            <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>{currentTheme.icon}</span>
          </button>

          {/* Contact Us Button */}
          <button 
            onClick={onOpenContact}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              color: 'var(--foreground)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
              outline: 'none'
            }}
            className="nav-hover"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>support_agent</span>
            <span>Contact Us</span>
          </button>
        </nav>

        <style>{`
          .nav-hover:hover {
            background: var(--glass-bg);
            border-color: var(--glass-border);
            transform: translateX(3px);
          }
        `}</style>

      </aside>
    </>
  );
}

