import React from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ children, activeLanguage = 'python' }) {
  const params = useParams();
  const currentLang = params.language || activeLanguage || 'python';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" className="brand" aria-label="CodeJunc Home">
            <img
              src="/assets/brand/logo-dark-transparent.png"
              alt="CodeJunc"
              className="brand-logo-img brand-logo-dark"
            />
            <img
              src="/assets/brand/logo-light-transparent.png"
              alt="CodeJunc"
              className="brand-logo-img brand-logo-light"
            />
          </Link>

          <nav className="topbar-nav" aria-label="Main Navigation">
            <NavLink
              to="/languages"
              className={({ isActive }) => `topbar-nav-link ${isActive ? 'active' : ''}`}
            >
              Languages
            </NavLink>
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
        </div>

        <div className="topbar-actions">
          {children}
          <ThemeToggle variant="dropdown" />
        </div>
      </div>
    </header>
  );
}
