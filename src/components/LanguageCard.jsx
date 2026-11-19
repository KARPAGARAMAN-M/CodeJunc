import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LanguageCard({ language }) {
  const navigate = useNavigate();
  const { id, name, icon, color } = language;

  return (
    <div
      className="language-card language-card-compact"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/compiler/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/compiler/${id}`);
        }
      }}
      aria-label={`Select ${name}`}
    >
      <div className="language-card-icon-wrap" style={{ background: `${color}15`, color }}>
        <span className="language-card-glyph" dangerouslySetInnerHTML={{ __html: icon }} />
      </div>

      <div className="language-card-info">
        <h3 className="language-card-title">{name}</h3>
      </div>

      <div className="language-card-action">
        <span className="card-select-btn">Select →</span>
      </div>
    </div>
  );
}
