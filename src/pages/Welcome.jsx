import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { setIsWelcome } = useTheme();

  // Ensure Welcome page strictly adheres to system theme while mounted
  useEffect(() => {
    setIsWelcome(true);
    return () => {
      setIsWelcome(false);
    };
  }, [setIsWelcome]);

  // Set welcome body class for layout styling
  useEffect(() => {
    document.body.className = 'is-welcome';
    return () => {
      document.body.className = '';
    };
  }, []);

  // Listen for Enter key to trigger Start Coding -> navigates to Language Selection
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
      {/* Background Architectural Canvas & Subtle Ambient Lighting */}
      <div className="welcome-bg-canvas" aria-hidden="true" />
      <div className="welcome-ambient-glow" aria-hidden="true" />

      {/* Main Minimal Full-Screen Welcome Experience */}
      <main className="welcome-container">
        <div className="welcome-content">
          {/* 1. CJ Brand Mark */}
          <div className="welcome-brand-mark-wrap">
            <img
              className="welcome-brand-mark"
              src="/assets/brand/brand-mark-transparent.png"
              alt="CodeJunc"
              width="96"
              height="68"
              draggable="false"
            />
          </div>

          {/* 2. CodeJunc Wordmark & 3. Tagline */}
          <div className="welcome-typography">
            <h1 className="welcome-wordmark">CodeJunc</h1>
            <p className="welcome-tagline">Code Without Distractions.</p>
          </div>

          {/* 4. Single CTA: Start Coding → (Navigates to Language Selection) */}
          <div className="welcome-action-wrap">
            <button
              className="welcome-cta-btn btn-welcome"
              type="button"
              title="Start coding (or press Enter)"
              onClick={() => navigate('/languages')}
              aria-label="Start Coding"
            >
              <span className="welcome-cta-label btn-welcome-text">Start Coding</span>
              <svg
                className="welcome-cta-arrow arrow-glyph"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3.33334 8H12.6667M12.6667 8L8.66668 4M12.6667 8L8.66668 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

