import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeToggle from '../components/ThemeToggle';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import { LANGUAGES, getLanguage, DEFAULT_LANGUAGE } from '../utils/languages';
import { runCode } from '../utils/runner';

// Inactivity session expiration timeout (30 minutes)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_ACTIVITY_KEY = 'cj.session.lastActivity';

export default function Compiler() {
  const { language: langParam } = useParams();
  const navigate = useNavigate();

  // Validate or fallback language
  const activeLangKey = (langParam && LANGUAGES[langParam.toLowerCase()]) ? langParam.toLowerCase() : DEFAULT_LANGUAGE;
  const currentLanguage = getLanguage(activeLangKey);

  // Set workspace body class for layout styling
  useEffect(() => {
    document.body.className = 'is-workspace';
    return () => {
      document.body.className = '';
    };
  }, []);

  // Clean up any legacy saved code from older versions of CodeJunc
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cj.code.')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }, []);

  // Language Dropdown open state
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Editor instance reference directly bound to Monaco Editor
  const editorRef = useRef(null);

  // Code state per language (fresh default code; no persistence across sessions or languages)
  const [code, setCode] = useState(currentLanguage.starter);
  const codeRef = useRef(code);
  codeRef.current = code;

  // Stdin state
  const [stdin, setStdin] = useState('');
  const stdinRef = useRef(stdin);
  stdinRef.current = stdin;

  // Execution state
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error'
  const statusRef = useRef(status);
  statusRef.current = status;
  const [executionTime, setExecutionTime] = useState(null);

  // Active language ref for reliable access during execution
  const activeLangRef = useRef(activeLangKey);
  activeLangRef.current = activeLangKey;

  // Track timestamp to prevent duplicate execution triggers (e.g. Monaco command + window keydown)
  const lastRunTriggerRef = useRef(0);
  const handleRunRef = useRef(null);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg('');
    }, 2400);
  };

  // Activity tracking for 30-minute session expiration
  const lastActivityRef = useRef(Date.now());

  const recordActivity = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
    } catch (e) {}
  };

  // Reset workspace state to default Hello World starter
  const resetToDefaultCode = (reason) => {
    if (editorRef.current) {
      editorRef.current.setValue(currentLanguage.starter);
    }
    setCode(currentLanguage.starter);
    setOutput('');
    setError('');
    setNotes([]);
    setStatus('idle');
    setExecutionTime(null);
    if (reason) {
      showToast(reason);
    }
  };

  // Check if session has expired due to 30 minutes of inactivity
  const checkSessionExpiration = () => {
    const now = Date.now();
    let lastTime = lastActivityRef.current;
    try {
      const stored = sessionStorage.getItem(SESSION_ACTIVITY_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) {
          lastTime = Math.max(lastTime, parsed);
        }
      }
    } catch (e) {}

    if (now - lastTime >= INACTIVITY_TIMEOUT_MS) {
      resetToDefaultCode('Session expired due to 30 minutes of inactivity. Default code restored.');
      recordActivity();
      return true;
    }
    return false;
  };

  // Periodic inactivity check (every 10s) and check on tab resume / focus
  useEffect(() => {
    checkSessionExpiration();

    const intervalId = setInterval(() => {
      checkSessionExpiration();
    }, 10000);

    const handleResume = () => {
      checkSessionExpiration();
    };

    window.addEventListener('focus', handleResume);
    document.addEventListener('visibilitychange', handleResume);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, [currentLanguage]);

  // Global user activity listeners (throttled)
  useEffect(() => {
    let lastRecorded = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastRecorded > 1500) {
        lastRecorded = now;
        recordActivity();
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, handleUserInteraction, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserInteraction));
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  // Update URL if param was missing or invalid
  useEffect(() => {
    if (!langParam || !LANGUAGES[langParam.toLowerCase()]) {
      navigate(`/compiler/${activeLangKey}`, { replace: true });
    } else {
      localStorage.setItem('cj.lang', activeLangKey);
    }
  }, [langParam, activeLangKey, navigate]);

  // Switch language code when active language changes -> always load fresh Hello World default code
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(currentLanguage.starter);
    }
    setCode(currentLanguage.starter);
    setOutput('');
    setError('');
    setNotes([]);
    setStatus('idle');
    setExecutionTime(null);
    recordActivity();
  }, [activeLangKey, currentLanguage]);

  // Code editor change handler (in-memory only; no localStorage persistence)
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    recordActivity();
  };

  // Reset starter code
  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.setValue(currentLanguage.starter);
    }
    resetToDefaultCode('Starter code restored');
    recordActivity();
  };

  // Clear code
  const handleClearCode = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
    setCode('');
    recordActivity();
    showToast('Editor cleared');
  };

  // Stdin change handler
  const handleStdinChange = (newStdin) => {
    setStdin(newStdin);
    recordActivity();
  };

  // Copy output
  const handleCopyOutput = () => {
    const textToCopy = error ? `${output ? output + '\n' : ''}${error}` : output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Output copied to clipboard');
    }).catch(() => {
      showToast('Failed to copy');
    });
  };

  // Clear output
  const handleClearOutput = () => {
    setOutput('');
    setError('');
    setNotes([]);
    setStatus('idle');
    setExecutionTime(null);
    recordActivity();
  };

  // Unified code execution handler: used identically by Run button and Ctrl+Enter
  const handleRun = async () => {
    recordActivity();

    // Prevent duplicate triggers within 250ms (e.g. Monaco editor command + window keydown)
    const now = Date.now();
    if (now - lastRunTriggerRef.current < 250) {
      return;
    }
    lastRunTriggerRef.current = now;

    if (statusRef.current === 'running') return;

    // Retrieve latest code directly from Monaco Editor instance at execution time
    let currentCode = codeRef.current;
    if (editorRef.current) {
      const editorVal = editorRef.current.getValue();
      if (typeof editorVal === 'string') {
        currentCode = editorVal;
      }
    }

    const currentLang = activeLangRef.current || activeLangKey;
    const currentStdin = stdinRef.current != null ? stdinRef.current : stdin;

    // Keep React code state synchronized
    if (currentCode !== code) {
      setCode(currentCode);
    }

    setStatus('running');
    setOutput('');
    setError('');
    setNotes([]);
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const res = await runCode({
        language: currentLang,
        code: currentCode,
        stdin: currentStdin,
        onOutput: (chunk) => {
          setOutput((prev) => prev + chunk);
        },
      });

      const elapsed = res && res.executionTimeMs != null ? res.executionTimeMs : Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);

      if (res.error) {
        setError(res.error);
        setStatus('error');
        if (res.output) {
          setOutput(res.output);
        }
      } else {
        setOutput(res.output || '');
        if (res.notes) setNotes(res.notes);
        setStatus('success');
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setError(err && err.message ? err.message : String(err));
      setStatus('error');
    }
  };

  // Keep handleRun ref up-to-date for shortcuts and callbacks
  handleRunRef.current = handleRun;

  // Global keyboard shortcut: Ctrl+Enter / Cmd+Enter (registered once, always calls latest handler)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (handleRunRef.current) {
          handleRunRef.current();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resizer logic
  const [outputHeight, setOutputHeight] = useState(240);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(0);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHRef.current = outputHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - moveEvent.clientY;
      const newHeight = Math.max(120, Math.min(window.innerHeight - 200, startHRef.current + deltaY));
      setOutputHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="workspace is-visible" id="workspace">
      {/* Tier 1 Header: CodeJunc Logo (left) | ▶ Run (right) */}
      <Navbar isWorkspace={true} activeLanguage={activeLangKey}>
        <button
          className="btn-run"
          id="btn-run"
          type="button"
          title="Run code (Ctrl + Enter)"
          onClick={handleRun}
          disabled={status === 'running'}
        >
          <span className="run-icon-wrap" aria-hidden="true">
            {status === 'running' ? (
              <span className="run-spinner" />
            ) : (
              <svg className="ico-play" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8a1 1 0 0 0 0-1.8L9.6 4.3A1 1 0 0 0 8 5.2Z" />
              </svg>
            )}
          </span>
          <span className="run-label">{status === 'running' ? 'Running' : 'Run'}</span>
          <kbd className="run-kbd" aria-hidden="true">Ctrl ↵</kbd>
        </button>
      </Navbar>

      {/* Main Workspace */}
      <main className="app">
        {/* Tier 2 Sub-toolbar: Theme ▼ (left) | Language ▼ (right) */}
        <div className="workspace-subbar">
          <div className="subbar-left">
            <ThemeToggle variant="dropdown" />
          </div>

          <div className="subbar-right">
            {/* Language Selector Dropdown */}
            <div className={`picker lang-picker ${isLangOpen ? 'open is-open' : ''}`} ref={langDropdownRef}>
              <button
                className="picker-btn"
                id="lang-btn"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                aria-label="Select language"
                onClick={() => setIsLangOpen((prev) => !prev)}
              >
                <span
                  className="picker-ico"
                  style={{ color: currentLanguage.color }}
                  dangerouslySetInnerHTML={{ __html: currentLanguage.icon }}
                />
                <span className="picker-label">{currentLanguage.name}</span>
                <svg
                  className="chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9.5 6 6 6-6" />
                </svg>
              </button>

              {isLangOpen && (
                <div className="picker-menu lang-menu" role="listbox" aria-label="Language selection">
                  {Object.values(LANGUAGES).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      className={`picker-opt ${lang.id === activeLangKey ? 'is-selected' : ''}`}
                      role="option"
                      aria-selected={lang.id === activeLangKey}
                      onClick={() => {
                        setIsLangOpen(false);
                        navigate(`/compiler/${lang.id}`);
                      }}
                    >
                      <span
                        className="opt-ico"
                        style={{ color: lang.color }}
                        dangerouslySetInnerHTML={{ __html: lang.icon }}
                      />
                      <span className="opt-name">{lang.name}</span>
                      <span className="opt-ver">{lang.version}</span>
                      {lang.id === activeLangKey && (
                        <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m4.5 12.5 5 5 10-11" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tier 3: Monaco Code Editor */}
        <CodeEditor
          editorRef={editorRef}
          language={currentLanguage}
          code={code}
          onChange={handleCodeChange}
          onReset={handleReset}
          onClear={handleClearCode}
          onRun={handleRun}
          onToast={showToast}
        />

        {/* Tier 4: Drag Resizer Handle */}
        <div
          className="resizer"
          id="resizer"
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize panels"
          tabIndex={0}
          onMouseDown={handleMouseDown}
        >
          <div className="resizer-line" />
          <div className="resizer-thumb" />
        </div>

        {/* Tier 5: Output Panel */}
        <OutputPanel
          height={outputHeight}
          output={output}
          error={error}
          notes={notes}
          status={status}
          executionTime={executionTime}
          stdin={stdin}
          setStdin={handleStdinChange}
          onClear={handleClearOutput}
          onCopy={handleCopyOutput}
          activeLanguage={currentLanguage}
        />
      </main>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="toast is-visible" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
