import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content about-layout">
        <div className="about-hero">
          <div className="page-badge">THE <span className="brand-code">CODE</span><span className="brand-junc">JUNC</span> MISSION</div>
          <h1 className="about-title">Code Without Distractions.</h1>
          <p className="about-lead">
            <span className="brand-code">Code</span><span className="brand-junc">Junc</span> is an online compiler and development playground built from the ground up for speed, focus, and simplicity. No complex setup, no ads, no mandatory signups — just pure coding.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon">⚡</div>
            <h3 className="about-card-title">Zero Cold Starts</h3>
            <p className="about-card-desc">
              Unlike cloud-hosted container environments that take 10 to 30 seconds to boot up a virtual machine, CodeJunc compiles and executes code instantly in your browser with zero latency.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🛡️</div>
            <h3 className="about-card-title">Client-Side Privacy</h3>
            <p className="about-card-desc">
              Your code and data never leave your device. All evaluation runs inside isolated Web Workers and sandboxed browser threads, guaranteeing complete privacy and confidentiality.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">💻</div>
            <h3 className="about-card-title">Professional Editor</h3>
            <p className="about-card-desc">
              Powered by Microsoft's Monaco Editor (the core engine behind VS Code), featuring intelligent syntax coloring, bracket matching, line numbers, and keyboard shortcuts.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🎨</div>
            <h3 className="about-card-title">Engineered Themes</h3>
            <p className="about-card-desc">
              From our flagship Dark and Light themes to custom creations like Crimson Forge and United, every palette is calibrated for contrast, readability, and visual comfort.
            </p>
          </div>
        </div>

        <div className="about-stack-section">
          <h2 className="about-section-heading">Technology Architecture</h2>
          <div className="stack-badges">
            <span className="stack-badge">React 18</span>
            <span className="stack-badge">Vite 6</span>
            <span className="stack-badge">React Router DOM 6</span>
            <span className="stack-badge">Monaco Editor</span>
            <span className="stack-badge">Web Workers</span>
            <span className="stack-badge">CSS Custom Properties</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
