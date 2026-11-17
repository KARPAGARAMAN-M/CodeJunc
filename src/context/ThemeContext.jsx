import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'cj.theme';

const THEME_COLORS = {
  dark: '#0D1117',
  light: '#FFFFFF',
  'crimson-forge': '#0B0F14',
  united: '#1A1A1A',
};

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['dark', 'light', 'crimson-forge', 'united', 'system'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    // First time visitor: automatically default to system preference
    return 'system';
  });

  const [systemDark, setSystemDark] = useState(() => {
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;
  });

  // Listen for OS theme changes
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, []);

  // Compute resolved active theme
  const activeTheme =
    themePreference === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : themePreference;

  // Apply to document DOM & meta
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    const meta = document.getElementById('theme-color') || document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[activeTheme] || '#0D1117');
    }
  }, [activeTheme]);

  const setTheme = (pref) => {
    setThemePreference(pref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const next = activeTheme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const isDark = activeTheme !== 'light';

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themePreference,
        setTheme,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
