import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  // Set welcome body class for layout styling
  useEffect(() => {
    document.body.className = 'is-welcome';
    return () => {
      document.body.className = '';
    };
  }, []);

  // Listen for Enter key to trigger Start Coding
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        navigate('/compiler');
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

      {/* Main Minimal Full-Screen Welcome Experience */}
      <div className="welcome-scroll-wrap welcome-centered">
        <div className="welcome-inner">
          {/* 1. CJ Brand Mark (Primary visual element) */}
          <div className="welcome-brand-showcase">
            <div className="welcome-mark-frame">
              <img
                className="welcome-mark"
                src="/assets/brand/brand-mark-transparent.png"
                alt="CodeJunc Brand Mark"
                width="120"
                height="86"
              />
            </div>
          </div>

          {/* 2. CodeJunc Wordmark & 3. Tagline */}
          <div className="welcome-headings">
            <h1 className="welcome-title">CodeJunc</h1>
            <p className="welcome-tagline">Code Without Distractions.</p>
          </div>

          {/* 4. Single CTA: Start Coding → */}
          <div className="welcome-actions">
            <button
              className="btn-welcome"
              type="button"
              title="Start coding (or press Enter)"
              onClick={() => navigate('/compiler')}
            >
              <span className="btn-welcome-text">Start Coding</span>
              <span className="arrow-glyph" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
