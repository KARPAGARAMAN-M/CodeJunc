import React, { useState, useEffect, useRef } from 'react';

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
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const consoleBodyRef = useRef(null);
  const stdinInputRef = useRef(null);

  const hasOutput = output && output.trim().length > 0;
  const hasError = error && error.trim().length > 0;
  const hasStdin = stdin && stdin.length > 0;
  const isRunning = status === 'running';

  // Automatically scroll terminal to bottom when new output or error arrives
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [output, error, status]);

  // If user inputs stdin, expand the stdin prompt section automatically if collapsed
  const handleToggleInput = () => {
    setIsInputExpanded((prev) => {
      const next = !prev;
      if (next && stdinInputRef.current) {
        setTimeout(() => stdinInputRef.current?.focus(), 50);
      }
      return next;
    });
  };

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
      return <span className="status-chip is-running" role="status">Executing...</span>;
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

  const handleClearAll = () => {
    onClear();
  };

  return (
    <section className="output-card terminal-card" style={height ? { height: `${height}px` } : undefined} aria-label="Terminal Console">
      {/* Terminal Titlebar */}
      <div className="output-head terminal-head">
        <div className="terminal-title-group">
          {/* Terminal window buttons */}
          <div className="terminal-dots" aria-hidden="true">
            <span className="dot dot-close" />
            <span className="dot dot-min" />
            <span className="dot dot-max" />
          </div>

          <div className="terminal-title">
            <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span className="terminal-name">Terminal Console</span>
          </div>

          {/* Stdin Indicator / Quick Toggle Button */}
          <button
            type="button"
            className={`terminal-input-btn ${isInputExpanded || hasStdin ? 'is-active' : ''}`}
            onClick={handleToggleInput}
            title={isInputExpanded ? 'Collapse stdin input' : 'Configure program input (stdin)'}
            aria-expanded={isInputExpanded}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <span>Stdin {hasStdin ? `(${stdin.split('\n').filter(Boolean).length || 1})` : ''}</span>
          </button>
        </div>

        <div className="output-tools">
          {getStatusChip()}

          <button
            className="icon-btn"
            type="button"
            title="Copy console output"
            aria-label="Copy console output"
            disabled={!hasOutput && !hasError}
            onClick={onCopy}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
              <path d="M15.5 5.5v-1c0-1-.8-1.8-1.8-1.8H6c-1 0-1.8.8-1.8 1.8v7.7c0 1 .8 1.8 1.8 1.8h1" />
            </svg>
          </button>

          <button
            className="icon-btn"
            type="button"
            title="Clear console output"
            aria-label="Clear console output"
            onClick={handleClearAll}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6.5h16" />
              <path d="M9.5 6.5V4.4c0-.8.6-1.4 1.4-1.4h2.2c.8 0 1.4.6 1.4 1.4v2.1" />
              <path d="m6.5 6.5.8 12.2c.1.9.8 1.6 1.7 1.6h6c.9 0 1.6-.7 1.7-1.6l.8-12.2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Main Body */}
      <div className="output-body terminal-body" ref={consoleBodyRef}>
        {/* Terminal Header Banner */}
        <div className="terminal-session-info">
          <span className="terminal-host">codejunc@sandbox</span>
          <span className="terminal-sep">:</span>
          <span className="terminal-path">~/{activeLanguage?.id || 'workspace'}</span>
          <span className="terminal-prompt">$</span>
          <span className="terminal-cmd">
            {isRunning
              ? `executing ${activeLanguage?.name || 'program'}...`
              : activeLanguage ? `ready (${activeLanguage.name} ${activeLanguage.version})` : 'ready'}
          </span>
        </div>

        {/* Unified Input Prompt Section */}
        <div className={`terminal-stdin-section ${isInputExpanded ? 'is-expanded' : ''} ${hasStdin ? 'has-content' : ''}`}>
          <div className="terminal-stdin-header" onClick={handleToggleInput}>
            <div className="terminal-stdin-label">
              <span className="terminal-stdin-arrow">▸</span>
              <strong>Program Standard Input (stdin)</strong>
              {hasStdin && <span className="stdin-badge">Prepared</span>}
            </div>
            <span className="terminal-stdin-hint">
              {isInputExpanded ? 'Click to collapse' : (hasStdin ? `${stdin.length} chars ready` : 'Click to add input values (Scanner, cin, scanf, input)')}
            </span>
          </div>

          {isInputExpanded && (
            <div className="terminal-stdin-box">
              <div className="terminal-stdin-guidance">
                <span>Values are passed to standard input before execution. Use newlines or spaces between inputs.</span>
                {hasStdin && (
                  <button
                    type="button"
                    className="stdin-clear-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStdin('');
                    }}
                  >
                    Clear stdin
                  </button>
                )}
              </div>
              <textarea
                ref={stdinInputRef}
                className="stdin-textarea terminal-stdin-textarea"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                spellCheck="false"
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Enter input for your program here...&#10;e.g.&#10;21&#10;Alice&#10;10 20 30"
                aria-label="Program standard input (stdin)"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Execution Output Stream */}
        <div className="terminal-output-stream">
          {isRunning && (
            <div className="output-running terminal-running">
              <span className="spinner" aria-hidden="true" />
              <span>Running program in sandbox environment...</span>
            </div>
          )}

          {!isRunning && !hasOutput && !hasError && (
            <div className="output-empty terminal-empty">
              <div className="terminal-cursor-line">
                <span className="terminal-cursor-prompt">&gt;</span>
                <span className="terminal-cursor-msg">Ready for execution. Press <strong>Run ▶</strong> or <kbd>Ctrl</kbd> + <kbd>↵</kbd></span>
                <span className="terminal-blink-cursor" />
              </div>
            </div>
          )}

          {hasOutput && (
            <div className="terminal-stdout-wrap">
              <div className="terminal-stream-label">stdout:</div>
              <pre className="output-text terminal-stdout">{output}</pre>
            </div>
          )}

          {hasError && (
            <div className="output-errors terminal-stderr-wrap">
              <div className="error-badge">
                {getErrorTypeBadge(error)}
              </div>
              <pre className="terminal-stderr">{error}</pre>
            </div>
          )}

          {notes && notes.length > 0 && (
            <div className="output-notes terminal-notes">
              {notes.map((note, idx) => (
                <div key={idx} className="output-note-item">ℹ️ {note}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer Info */}
      <div className="output-foot terminal-foot">
        <span className="terminal-foot-status">
          {status === 'running'
            ? '⚡ Executing code in isolated container...'
            : status === 'success'
            ? `✓ Process finished successfully in ${executionTime || 0}ms`
            : status === 'error'
            ? '✕ Process terminated with error'
            : '● Console ready'}
        </span>
        <span className="foot-hint">
          {activeLanguage ? `${activeLanguage.name} • Judge0 CE Sandbox` : 'Judge0 CE Sandbox'}
        </span>
      </div>
    </section>
  );
}
