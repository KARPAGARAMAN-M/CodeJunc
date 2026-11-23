import React, { useState, useEffect } from 'react';

export default function OutputPanel({
  height,
  output,
  error,
  notes,
  status,
  executionTime,
  stdin,
  setStdin,
  onClear,
  onCopy,
  activeLanguage,
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'input'

  // Automatically switch to Output tab when execution starts
  useEffect(() => {
    if (status === 'running') {
      setActiveTab('output');
    }
  }, [status]);

  const hasOutput = output && output.trim().length > 0;
  const hasError = error && error.trim().length > 0;
  const isRunning = status === 'running';

  const getErrorTypeBadge = (errText) => {
    if (!errText) return 'ERROR';
    if (/time limit/i.test(errText)) return 'TIME LIMIT EXCEEDED';
    if (/memory limit/i.test(errText)) return 'MEMORY LIMIT EXCEEDED';
    if (/timeout/i.test(errText)) return 'REQUEST TIMEOUT';
    if (/service error|connect|network error|execution service/i.test(errText)) return 'SERVICE ERROR';
    if (/compile|syntaxerror|javac|gcc|g\+\+|declaration not found|undefined reference/i.test(errText)) return 'COMPILATION ERROR';
    return 'RUNTIME ERROR';
  };

  const getStatusChip = () => {
    if (isRunning) {
      return <span className="status-chip is-running" role="status">Running</span>;
    }
    if (status === 'success') {
      return (
        <span className="status-chip is-success" role="status">
          Success {executionTime !== null && `(${executionTime}ms)`}
        </span>
      );
    }
    if (status === 'error' || hasError) {
      return (
        <span className="status-chip is-error" role="status">
          Error {executionTime !== null && `(${executionTime}ms)`}
        </span>
      );
    }
    return <span className="status-chip is-idle" role="status">Ready</span>;
  };

  return (
    <section className="output-card" style={height ? { height: `${height}px` } : undefined} aria-label="Program output">
      <div className="output-head">
        <div className="output-tabs" role="tablist" aria-label="Output and input">
          <button
            className={`tab ${activeTab === 'output' ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'output'}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
          <button
            className={`tab ${activeTab === 'input' ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'input'}
            onClick={() => setActiveTab('input')}
          >
            Input
          </button>
        </div>

        <div className="output-tools">
          {getStatusChip()}

          <button
            className="icon-btn output-only"
            type="button"
            title="Copy output"
            aria-label="Copy output"
            disabled={!hasOutput && !hasError}
            onClick={onCopy}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
              <path d="M15.5 5.5v-1c0-1-.8-1.8-1.8-1.8H6c-1 0-1.8.8-1.8 1.8v7.7c0 1 .8 1.8 1.8 1.8h1" />
            </svg>
          </button>

          <button
            className="icon-btn output-only"
            type="button"
            title="Clear output"
            aria-label="Clear output"
            onClick={onClear}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6.5h16" />
              <path d="M9.5 6.5V4.4c0-.8.6-1.4 1.4-1.4h2.2c.8 0 1.4.6 1.4 1.4v2.1" />
              <path d="m6.5 6.5.8 12.2c.1.9.8 1.6 1.7 1.6h6c.9 0 1.6-.7 1.7-1.6l.8-12.2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="output-body">
        {activeTab === 'output' ? (
          <div role="tabpanel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isRunning && (
              <div className="output-running">
                <span className="spinner" aria-hidden="true" />
                <span>Running...</span>
              </div>
            )}

            {!isRunning && !hasOutput && !hasError && (
              <div className="output-empty">
                <div className="empty-brand-wrap" aria-hidden="true">
                  <img className="empty-mark" src="/assets/brand/brand-mark-transparent.png" alt="" />
                </div>
                <p>Ready to run</p>
                <small>
                  Press <kbd>Ctrl</kbd> + <kbd>↵</kbd> or click <strong>Run ▶</strong>
                </small>
              </div>
            )}

            {hasOutput && (
              <pre className="output-text">{output}</pre>
            )}

            {hasError && (
              <div className="output-errors">
                <div className="error-badge">
                  {getErrorTypeBadge(error)}
                </div>
                <pre>{error}</pre>
              </div>
            )}

            {notes && notes.length > 0 && (
              <div className="output-notes">
                {notes.map((note, idx) => (
                  <div key={idx} className="output-note-item">ℹ️ {note}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div role="tabpanel" style={{ height: '100%' }}>
            <textarea
              className="stdin-textarea"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              placeholder="Program input (stdin)&#10;One value per line, or space-separated.&#10;&#10;e.g.&#10;5&#10;12"
              aria-label="Program input (stdin)"
            />
          </div>
        )}
      </div>

      <div className="output-foot">
        <span>
          {status === 'running'
            ? 'Executing code...'
            : status === 'success'
            ? `Finished in ${executionTime || 0}ms`
            : status === 'error'
            ? 'Execution failed'
            : 'Ready'}
        </span>
        <span className="foot-hint">
          {activeLanguage ? `${activeLanguage.name} ${activeLanguage.version} Environment` : 'Execution Environment'}
        </span>
      </div>
    </section>
  );
}
