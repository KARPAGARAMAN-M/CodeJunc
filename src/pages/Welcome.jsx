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

  // Listen for Enter key to trigger Start Coding -> navigates directly to Python Compiler Workspace
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        navigate('/compiler/python');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="welcome welcome-reference-theme" aria-hidden="false">
      {/* Dynamic Fluid Background with Glowing Orange Ribbons & Watermark */}
      <div className="welcome-bg-canvas" aria-hidden="true">
        <svg
          className="welcome-fluid-bg"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Orange neon rim glow gradients */}
            <linearGradient id="orange-rim-tl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA133" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="orange-rim-br" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0" />
              <stop offset="40%" stopColor="#FF6B00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFA133" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing neon filter */}
            <filter id="rim-glow-tl" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="rim-glow-br" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Wave dark depth fills */}
            <radialGradient id="wave-dark-tl" cx="15%" cy="15%" r="75%">
              <stop offset="0%" stopColor="#1B1C22" />
              <stop offset="55%" stopColor="#121318" />
              <stop offset="100%" stopColor="#0B0C10" />
            </radialGradient>

            <radialGradient id="wave-dark-br" cx="85%" cy="85%" r="75%">
              <stop offset="0%" stopColor="#1B1C22" />
              <stop offset="55%" stopColor="#121318" />
              <stop offset="100%" stopColor="#0B0C10" />
            </radialGradient>
          </defs>

          {/* 1. Top-Left Fluid Shapes & Glowing Orange Rim */}
          <path
            d="M -120 -120 L 450 -120 C 350 130 180 240 -120 310 Z"
            fill="#0F1014"
            opacity="0.85"
          />
          <path
            d="M -120 -60 C 220 -30 280 130 190 260 C 100 390 -50 440 -120 460 Z"
            fill="url(#wave-dark-tl)"
          />
          <path
            d="M -60 0 C 210 20 270 150 190 260 C 120 350 20 410 -80 450"
            stroke="url(#orange-rim-tl)"
            strokeWidth="3"
            fill="none"
            filter="url(#rim-glow-tl)"
          />

          {/* Bottom-Right Fluid Shapes & Glowing Orange Rim */}
          <path
            d="M 1560 1020 L 970 1020 C 1110 770 1270 660 1560 580 Z"
            fill="#0F1014"
            opacity="0.85"
          />
          <path
            d="M 1560 960 C 1210 930 1130 750 1240 600 C 1330 480 1490 420 1560 400 Z"
            fill="url(#wave-dark-br)"
          />
          <path
            d="M 1520 910 C 1200 880 1140 730 1240 600 C 1320 490 1450 430 1540 400"
            stroke="url(#orange-rim-br)"
            strokeWidth="3"
            fill="none"
            filter="url(#rim-glow-br)"
          />
        </svg>
      </div>

      {/* Central Ambient Glow */}
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
              width="100"
              height="72"
              draggable="false"
            />
          </div>

          {/* 2. CodeJunc Wordmark: Code in WHITE, Junc in ORANGE */}
          <div className="welcome-typography">
            <h1 className="welcome-wordmark">
              <span className="welcome-wordmark-code">Code</span>
              <span className="welcome-wordmark-junc">Junc</span>
            </h1>
            <p className="welcome-tagline">Code Without Distractions.</p>
          </div>

          {/* 4. Single CTA: Start Coding → (Rounded Pill with Glowing Orange Fill) */}
          <div className="welcome-action-wrap">
            <button
              className="welcome-cta-btn btn-welcome"
              type="button"
              title="Start coding (or press Enter)"
              onClick={() => navigate('/compiler/python')}
              aria-label="Start Coding"
            >
              <span className="welcome-cta-label btn-welcome-text">Start Coding</span>
              <span className="welcome-cta-arrow arrow-glyph" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


