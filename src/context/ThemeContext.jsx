import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'cj.theme';

const THEME_COLORS = {
  dark: '#0D1117',
  light: '#FFFFFF',
  'crimson-forge': '#0B0F14',
  united: '#0A0E17',
};

export function ThemeProvider({ children }) {
  const [isWelcome, setIsWelcome] = useState(() => {
    return typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
  });

  const [themePreference, setThemePreference] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (saved === 'system') {
        return 'system';
      }
      // If a custom theme was saved previously (e.g. crimson-forge, united), purge it
      // so it never automatically applies when opening workspace or refreshing
      if (saved === 'crimson-forge' || saved === 'united') {
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch (e) {}
    // First time visitor / initial visit: automatically default to system preference (Light or Dark)
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

  // Listen for browser navigation changes (popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      const atWelcome = window.location.pathname === '/' || window.location.pathname === '';
      setIsWelcome(atWelcome);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Compute resolved active theme:
  // On the Welcome page, theme strictly follows the operating system's theme
  const activeTheme = isWelcome
    ? systemDark
      ? 'dark'
      : 'light'
    : themePreference === 'system'
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
    if (!['dark', 'light', 'crimson-forge', 'united', 'system'].includes(pref)) return;
    setThemePreference(pref);
    try {
      if (pref === 'dark' || pref === 'light' || pref === 'system') {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } else {
        // Do not persist custom themes to prevent them appearing automatically on next visit / restart
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch (e) {}

    // Apply synchronously to DOM immediately for zero-delay instant switch
    const resolved = isWelcome
      ? (systemDark ? 'dark' : 'light')
      : (pref === 'system' ? (systemDark ? 'dark' : 'light') : pref);
    document.documentElement.setAttribute('data-theme', resolved);
    const meta = document.getElementById('theme-color') || document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[resolved] || '#0D1117');
    }
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
        preference: themePreference,
        themePreference,
        setTheme,
        setThemePreference: setTheme,
        toggleTheme,
        isDark,
        systemTheme: systemDark ? 'dark' : 'light',
        isWelcome,
        setIsWelcome,
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
