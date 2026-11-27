import React from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ children, activeLanguage = 'python', isWorkspace = false }) {
  const params = useParams();
  const currentLang = params.language || activeLanguage || 'python';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" aria-label="CodeJunc home" title="CodeJunc">
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

        {!isWorkspace && (
          <nav className="topbar-nav" aria-label="Main Navigation">
            <NavLink
              to={`/compiler/${currentLang}`}
              className={({ isActive }) => `topbar-nav-link ${isActive ? 'active' : ''}`}
            >
              Compiler
            </NavLink>
            <NavLink
              to="/documentation"
              className={({ isActive }) => `topbar-nav-link ${isActive ? 'active' : ''}`}
            >
              Docs
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `topbar-nav-link ${isActive ? 'active' : ''}`}
            >
              About
            </NavLink>
          </nav>
        )}

        <div className="topbar-actions">
          {children}
          {!isWorkspace && <ThemeToggle variant="dropdown" />}
        </div>
      </div>
    </header>
  );
}
