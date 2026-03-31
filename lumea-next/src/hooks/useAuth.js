'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Create auth context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wrap your app with this to provide auth state globally
 * 
 * @example
 * // In layout.js or _app.js
 * <AuthProvider>
 *   <YourApp />
 * </AuthProvider>
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session on mount
    const checkSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password, options = {}) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * @returns {Object} Auth context value with user, loading, signIn, signUp, signOut
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;