'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME_ID, THEME_ORDER } from '@/lib/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
  const [mounted, setMounted] = useState(false);

  // On mount, read saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lumea_theme');
    if (saved && THEMES[saved]) {
      setThemeId(saved);
    }
    setMounted(true);
  }, []);

  // Apply CSS vars to <html> whenever theme changes
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const themeConfig = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];

    // Set data-theme attribute (drives CSS selector blocks in globals.css)
    root.setAttribute('data-theme', themeId);

    // Also apply individual CSS vars programmatically for dynamic overrides
    Object.entries(themeConfig.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem('lumea_theme', themeId);
  }, [themeId, mounted]);

  const setTheme = (id) => {
    if (THEMES[id]) setThemeId(id);
  };

  const currentTheme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];

  return (
    <ThemeContext.Provider value={{ themeId, currentTheme, setTheme, THEME_ORDER }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback — return night-sky defaults so SSR/non-wrapped pages don't crash
    return {
      themeId: DEFAULT_THEME_ID,
      currentTheme: THEMES[DEFAULT_THEME_ID],
      setTheme: () => {},
      THEME_ORDER,
    };
  }
  return ctx;
}
