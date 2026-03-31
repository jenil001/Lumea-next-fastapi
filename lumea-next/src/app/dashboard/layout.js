'use client';

import Sidebar from '@/components/Sidebar';
import ProfileMenu from '@/components/ProfileMenu';
import ContactModal from '@/components/ContactModal';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        router.push('/');
        return;
      }
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // router.push('/');
        setAuthenticated(true);
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'transparent', color: '#94a3b8' }}>
        <p style={{ fontSize: '1.2rem', userSelect: 'none' }}>Loading Sanctuary...</p>
      </div>
    );
  }

  if (!authenticated) return null;
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Global Components handled by root layout (DynamicBackground) */}
      <ProfileMenu />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Sidebar Panel */}
      <Sidebar onOpenContact={() => setIsContactOpen(true)} />

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '2rem', 
        width: 'calc(100% - 260px)',
        minHeight: '100vh'
      }}>
        {children}
      </main>

    </div>
  );
}

