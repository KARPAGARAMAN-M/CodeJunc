import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LanguageCard from '../components/LanguageCard';
import { LANGUAGES } from '../utils/languages';

export default function LanguageSelection() {
  const languageList = Object.values(LANGUAGES);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="page-header">
          <div className="page-badge">SUPPORTED ENVIRONMENTS</div>
          <h1 className="page-title">Choose Your Language</h1>
          <p className="page-subtitle">
            Select a programming language to launch its high-performance compiler workspace with starter templates, full standard I/O, and keyboard shortcuts.
          </p>
        </div>

        <div className="languages-grid">
          {languageList.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
