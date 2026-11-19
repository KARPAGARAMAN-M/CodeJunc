import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { defineMonacoThemes, THEME_MONACO_MAP } from '../utils/monacoThemes';

export default function CodeEditor({
  language,
  code,
  onChange,
  onReset,
  onClear,
  onRun,
  onToast,
}) {
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const [isDirty, setIsDirty] = useState(false);

  // Check dirty state against starter
  useEffect(() => {
    if (language) {
      setIsDirty(code !== language.starter);
    }
  }, [code, language]);

  // Handle monaco setup before mount
  function handleEditorWillMount(monaco) {
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);
  }

  // Handle monaco mount
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Add Ctrl+Enter / Cmd+Enter keybinding to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Focus editor
    editor.focus();
  }

  // Update theme when global theme changes
  useEffect(() => {
    if (monacoRef.current) {
      const monacoThemeName = THEME_MONACO_MAP[theme] || 'codejunc-dark';
      monacoRef.current.editor.setTheme(monacoThemeName);
    }
  }, [theme]);

  // Handle copy code
  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      if (onToast) onToast('Code copied to clipboard');
    }).catch(() => {});
  };

  // Handle download
  const handleDownload = () => {
    const filename = language ? language.file : 'code.txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onToast) onToast(`Downloaded ${filename}`);
  };

  const monacoTheme = THEME_MONACO_MAP[theme] || 'codejunc-dark';
  const monacoLang = language ? language.monaco : 'c';

  return (
    <section className="editor-card" aria-label="Code editor">
      <div className="editor-head">
        <div className="editor-file">
          {isDirty && (
            <span className="file-dot" title="Unsaved modifications" aria-label="Unsaved changes" />
          )}
          <span className="file-name">{language ? language.file : 'main.c'}</span>
          <span className="file-lang">{language ? language.name : 'C'}</span>
        </div>
        <div className="editor-actions">
          {/* Copy code */}
          <button
            className="icon-btn"
            type="button"
            title="Copy code"
            aria-label="Copy code"
            onClick={handleCopyCode}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
              <path d="M15.5 5.5v-1c0-1-.8-1.8-1.8-1.8H6c-1 0-1.8.8-1.8 1.8v7.7c0 1 .8 1.8 1.8 1.8h1" />
            </svg>
          </button>

          {/* Download code */}
          <button
            className="icon-btn"
            type="button"
            title="Download file"
            aria-label="Download file"
            onClick={handleDownload}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3.5v11" />
              <path d="M7.5 10.5 12 15l4.5-4.5" />
              <path d="M4.5 16.5v3c0 1 .8 1.8 1.8 1.8h11.4c1 0 1.8-.8 1.8-1.8v-3" />
            </svg>
          </button>

          {/* Reset starter code */}
          <button
            className="icon-btn"
            type="button"
            title="Reset starter code"
            aria-label="Reset starter code"
            onClick={onReset}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3.8 8.6A8.5 8.5 0 1 1 3.2 13" />
              <path d="M3.8 3.6v5h5" />
            </svg>
          </button>

          {/* Clear editor */}
          <button
            className="icon-btn"
            type="button"
            title="Clear editor"
            aria-label="Clear editor"
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

      <div className="editor-host" style={{ position: 'relative' }}>
        {(!code || code.trim().length === 0) && (
          <div className="editor-watermark" aria-hidden="true">
            <img className="wm-img" src="/assets/brand/brand-mark-transparent.png" alt="" />
          </div>
        )}
        <Editor
          height="100%"
          language={monacoLang}
          theme={monacoTheme}
          value={code}
          onChange={(val) => onChange(val || '')}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: language && language.id === 'javascript' ? 2 : 4,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      <div className="editor-foot">
        <div className="editor-foot-left">
          <span>
            <i className="lang-dot" style={{ background: language ? language.color : 'var(--accent)' }} />
            {language ? language.name : ''}
          </span>
        </div>
        <div className="editor-foot-right">
          <span>Spaces: {language && language.id === 'javascript' ? '2' : '4'}</span>
          <span>UTF-8</span>
          <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
        </div>
      </div>
    </section>
  );
}
