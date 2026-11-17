import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <img
              src="/assets/brand/brand-mark-transparent.png"
              alt="CodeJunc Mark"
              width="28"
              height="20"
              style={{ objectFit: 'contain' }}
            />
            <span className="footer-brand-name">CodeJunc</span>
            <span className="footer-badge">v2.4</span>
          </div>
          <p className="footer-tagline">
            Code Without Distractions. A fast, modern developer playground.
          </p>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/languages">Languages</Link></li>
            <li><Link to="/compiler/python">Compiler</Link></li>
            <li><Link to="/documentation">Documentation</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Compilers</h4>
          <ul className="footer-nav">
            <li><Link to="/compiler/python">Python 3.11</Link></li>
            <li><Link to="/compiler/javascript">JavaScript (ES2024)</Link></li>
            <li><Link to="/compiler/c">C (GCC 13 / C17)</Link></li>
            <li><Link to="/compiler/cpp">C++ (GCC 13 / C++20)</Link></li>
            <li><Link to="/compiler/java">Java (OpenJDK 21)</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Environment</h4>
          <ul className="footer-nav">
            <li>Zero Setup Required</li>
            <li>Client-Side Sandbox</li>
            <li>Standard Input (stdin)</li>
            <li>Monaco Intelligence</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CodeJunc. Built for developers.</p>
        <div className="footer-bottom-meta">
          <span>Interpreted & Native Runtimes</span>
          <span className="footer-meta-dot">·</span>
          <span>Fast Execution</span>
        </div>
      </div>
    </footer>
  );
}
