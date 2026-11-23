import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
  { id: 'dark', name: 'Dark', emoji: '🌙' },
  { id: 'light', name: 'Light', emoji: '☀️' },
  { id: 'crimson-forge', name: 'Crimson Forge', emoji: '🔥' },
  { id: 'united', name: 'United', emoji: '🇺🇸' },
  { id: 'system', name: 'System', emoji: '💻' },
];

export default function ThemeToggle({ variant = 'dropdown' }) {
  const { theme, preference, setTheme } = useTheme();
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

  // Simple cycle toggle
  if (variant === 'simple') {
    const isDark = theme !== 'light';
    return (
      <button
        type="button"
        className="welcome-theme-toggle"
        onClick={() => {
          if (preference === 'dark') setTheme('light');
          else if (preference === 'light') setTheme('crimson-forge');
          else if (preference === 'crimson-forge') setTheme('united');
          else if (preference === 'united') setTheme('system');
          else setTheme('dark');
        }}
        aria-label="Toggle theme"
        title="Toggle theme"
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
          {preference === 'crimson-forge' ? 'Crimson Forge' : preference === 'united' ? 'United' : preference === 'light' ? 'Light' : preference === 'system' ? 'System' : 'Dark'}
        </span>
      </button>
    );
  }

  // Dropdown variant
  const getThemeLabel = () => {
    switch (preference) {
      case 'dark':
        return 'Dark';
      case 'light':
        return 'Light';
      case 'crimson-forge':
        return 'Crimson Forge';
      case 'united':
        return 'United';
      case 'system':
      default:
        return 'System';
    }
  };

  const getThemeIcon = () => {
    if (preference === 'system') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    }
    if (preference === 'united') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    }
    if (preference === 'crimson-forge') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#DA3633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    }
    if (preference === 'light') {
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

  const handleSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div className={`picker theme-picker ${isOpen ? 'open is-open' : ''}`} ref={dropdownRef}>
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
          {THEME_OPTIONS.map((opt) => {
            const isSelected = preference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`picker-opt ${isSelected ? 'is-selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectTheme(opt.id)}
              >
                <span className="opt-name">
                  <span className="opt-emoji" aria-hidden="true" style={{ marginRight: '8px' }}>
                    {opt.emoji}
                  </span>
                  {opt.name}
                </span>
                <svg
                  className="check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4.5 12.5 5 5 10-11" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
