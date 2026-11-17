import React from 'react';
import { Link } from 'react-router-dom';

export default function LanguageCard({ language }) {
  const { id, name, version, file, color, icon, starter } = language;

  return (
    <div className="language-card">
      <div className="language-card-head">
        <div className="language-card-icon-wrap" style={{ background: `${color}18`, color }}>
          <span className="language-card-glyph" dangerouslySetInnerHTML={{ __html: icon }} />
        </div>
        <div className="language-card-title-wrap">
          <h3 className="language-card-title">{name}</h3>
          <div className="language-card-badges">
            <span className="language-card-badge">{version}</span>
            <span className="language-card-badge file-badge">{file}</span>
          </div>
        </div>
      </div>

      <p className="language-card-desc">
        {id === 'python' && 'High-level, expressive language with instant mathematical and algorithmic execution.'}
        {id === 'javascript' && 'Modern ES2024 runtime executed in an isolated secure Web Worker thread.'}
        {id === 'c' && 'Low-level procedural programming with standard I/O and algorithmic performance.'}
        {id === 'cpp' && 'Modern C++20 with Standard Template Library (STL) support for competitive programming.'}
        {id === 'java' && 'Enterprise-grade object-oriented language with class-based compilation and stdout/stdin.'}
      </p>

      <div className="language-card-preview">
        <div className="preview-top">
          <span className="preview-dots">
            <span className="p-dot" />
            <span className="p-dot" />
            <span className="p-dot" />
          </span>
          <span className="preview-filename">{file}</span>
        </div>
        <pre className="preview-code">
          <code>{starter.split('\n').slice(0, 5).join('\n')}...</code>
        </pre>
      </div>

      <div className="language-card-foot">
        <Link to={`/compiler/${id}`} className="btn-open-compiler">
          <span>Open in Compiler</span>
          <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
