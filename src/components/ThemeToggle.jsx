import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'dropdown' }) {
  const { theme, preference, setThemePreference, systemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Welcome page variant: direct toggle button
  if (variant === 'simple') {
    const isDark = theme === 'dark' || theme === 'crimson-forge' || theme === 'united';
    return (
      <button
        type="button"
        className="welcome-theme-toggle"
        onClick={() => {
          if (theme === 'dark') setThemePreference('light');
          else if (theme === 'light') setThemePreference('crimson-forge');
          else if (theme === 'crimson-forge') setThemePreference('united');
          else setThemePreference('dark');
        }}
        aria-label="Toggle theme"
        title={`Current: ${theme.toUpperCase()} (Click to cycle)`}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </span>
        <span className="theme-toggle-text">
          {theme === 'crimson-forge' ? 'Crimson' : theme === 'united' ? 'United' : theme === 'light' ? 'Light' : 'Dark'}
        </span>
      </button>
    );
  }

  // Dropdown variant (Workspace / Navbar)
  const getThemeLabel = () => {
    if (preference === 'system') return 'System';
    if (theme === 'crimson-forge') return 'Crimson';
    if (theme === 'united') return 'United';
    if (theme === 'light') return 'Light';
    return 'Dark';
  };

  const getThemeIcon = () => {
    if (theme === 'united') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#DA291C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    }
    if (theme === 'crimson-forge') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#DA3633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    }
    if (theme === 'light') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    );
  };

  return (
    <div className={`picker theme-picker ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      <button
        className="picker-btn"
        id="theme-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select theme"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="picker-ico" aria-hidden="true">
          {getThemeIcon()}
        </span>
        <span className="picker-label">{getThemeLabel()}</span>
        <svg
          className="chev"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="picker-menu theme-menu" role="listbox" aria-label="Theme selection">
          {/* United Theme */}
          <button
            type="button"
            className={`picker-opt ${preference === 'united' ? 'is-selected' : ''}`}
            role="option"
            aria-selected={preference === 'united'}
            onClick={() => {
              setThemePreference('united');
              setIsOpen(false);
            }}
          >
            <svg className="opt-ico" viewBox="0 0 24 24" fill="none" stroke="#DA291C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="opt-name">🔴 United</span>
            {preference === 'united' && (
              <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            )}
          </button>

          {/* Crimson Forge Theme */}
          <button
            type="button"
            className={`picker-opt ${preference === 'crimson-forge' ? 'is-selected' : ''}`}
            role="option"
            aria-selected={preference === 'crimson-forge'}
            onClick={() => {
              setThemePreference('crimson-forge');
              setIsOpen(false);
            }}
          >
            <svg className="opt-ico" viewBox="0 0 24 24" fill="none" stroke="#DA3633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span className="opt-name">🔥 Crimson Forge</span>
            {preference === 'crimson-forge' && (
              <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            )}
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            className={`picker-opt ${preference === 'dark' ? 'is-selected' : ''}`}
            role="option"
            aria-selected={preference === 'dark'}
            onClick={() => {
              setThemePreference('dark');
              setIsOpen(false);
            }}
          >
            <svg className="opt-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <span className="opt-name">Dark</span>
            {preference === 'dark' && (
              <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            )}
          </button>

          {/* Light Theme */}
          <button
            type="button"
            className={`picker-opt ${preference === 'light' ? 'is-selected' : ''}`}
            role="option"
            aria-selected={preference === 'light'}
            onClick={() => {
              setThemePreference('light');
              setIsOpen(false);
            }}
          >
            <svg className="opt-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <span className="opt-name">Light</span>
            {preference === 'light' && (
              <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            )}
          </button>

          {/* System Default */}
          <button
            type="button"
            className={`picker-opt ${preference === 'system' ? 'is-selected' : ''}`}
            role="option"
            aria-selected={preference === 'system'}
            onClick={() => {
              setThemePreference('system');
              setIsOpen(false);
            }}
          >
            <svg className="opt-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span className="opt-name">System Default ({systemTheme})</span>
            {preference === 'system' && (
              <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
