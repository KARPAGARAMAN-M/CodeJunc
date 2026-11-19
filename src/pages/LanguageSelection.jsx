import React from 'react';
import { Link } from 'react-router-dom';
import LanguageCard from '../components/LanguageCard';
import ThemeToggle from '../components/ThemeToggle';
import { LANGUAGE_LIST } from '../utils/languages';

export default function LanguageSelection() {
  return (
    <div className="language-selection-page">
      {/* Top minimal header */}
      <header className="selection-header">
        <Link to="/" className="brand" aria-label="CodeJunc home" title="Back to Welcome">
          <img
            src="/assets/brand/logo-dark-transparent.png"
            alt="CodeJunc"
            className="brand-logo-img brand-logo-dark"
            height="28"
          />
          <img
            src="/assets/brand/logo-light-transparent.png"
            alt="CodeJunc"
            className="brand-logo-img brand-logo-light"
            height="28"
          />
        </Link>

        <div className="selection-header-actions">
          <ThemeToggle variant="dropdown" />
          <Link to="/" className="btn-back-home" title="Return to Welcome">
            ← Back
          </Link>
        </div>
      </header>

      {/* Main selection container */}
      <main className="selection-container">
        <div className="selection-title-wrap">
          <h1 className="selection-title">Select Language</h1>
          <p className="selection-subtitle">Choose a language to start coding.</p>
        </div>

        <div className="selection-grid">
          {LANGUAGE_LIST.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </div>
      </main>
    </div>
  );
}
