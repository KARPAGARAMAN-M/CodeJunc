import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Welcome() {
  const navigate = useNavigate();

  // Listen for Enter key to trigger Start Coding
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        navigate('/languages');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="welcome" aria-hidden="false">
      {/* Background Technical Grid & Ambient Lighting */}
      <div className="welcome-grid-bg" aria-hidden="true" />
      <div className="welcome-ambient-glow" aria-hidden="true" />

      {/* Welcome Top Utility Bar */}
      <header className="welcome-topbar">
        <div className="welcome-topbar-left">
          <span className="welcome-badge-pill">
            <span className="badge-live-pulse" aria-hidden="true" />
            <span className="badge-text">CodeJunc v2.4</span>
            <span className="badge-divider" aria-hidden="true">/</span>
            <span className="badge-sub">Online Compiler</span>
          </span>
        </div>
        <div className="welcome-topbar-right">
          <ThemeToggle variant="simple" />
        </div>
      </header>

      {/* Main Welcome Content */}
      <div className="welcome-scroll-wrap">
        <div className="welcome-inner">
          {/* Refined Brand Mark Showcase */}
          <div className="welcome-brand-showcase">
            <div className="welcome-mark-frame">
              <img
                className="welcome-mark"
                src="/assets/brand/brand-mark-transparent.png"
                alt="CodeJunc Brand Mark"
                width="116"
                height="84"
              />
            </div>
          </div>

          {/* Headline & Tagline */}
          <div className="welcome-headings">
            <h1 className="welcome-title">CodeJunc</h1>
            <p className="welcome-tagline">Code Without Distractions.</p>
            <p className="welcome-desc">
              High-performance, zero-setup online coding platform with instant compilation, intelligent syntax themes, and keyboard-first workflow.
            </p>
          </div>

          {/* Start Coding CTA + Keyboard Hint */}
          <div className="welcome-actions">
            <button
              className="btn-welcome"
              type="button"
              title="Start coding (or press Enter)"
              onClick={() => navigate('/languages')}
            >
              <span className="btn-welcome-text">Start Coding</span>
              <span className="arrow-glyph" aria-hidden="true">→</span>
              <kbd className="welcome-kbd" aria-hidden="true">↵ Enter</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
