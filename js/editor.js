/* ============================================================
   CodeJunc — editor.js
   Monaco Editor integration with Dark, Light, Crimson Forge, and United themes.
   ============================================================ */
window.CJ = window.CJ || {};

CJ.defineThemes = function () {
  if (CJ._monacoThemesDefined || !window.monaco) return;

  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'comment', foreground: '8B949E' },
      { token: 'type', foreground: '79C0FF' },
      { token: 'operator', foreground: 'E6EDF3' },
      { token: 'delimiter', foreground: 'E6EDF3' },
      { token: 'identifier', foreground: 'E6EDF3' },
    ],
    colors: {
      'editor.background': '#0D1117',
      'editor.foreground': '#E6EDF3',
      'editor.lineHighlightBackground': '#161B22',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#264F7880',
      'editorCursor.foreground': '#E6EDF3',
      'editorWhitespace.foreground': '#30363D',
      'editorIndentGuide.background': '#30363D',
      'editorIndentGuide.activeBackground': '#8B949E',
      'editorLineNumber.foreground': '#8B949E',
      'editorLineNumber.activeForeground': '#E6EDF3',
      'editorGutter.background': '#0D1117',
      'editorWidget.background': '#161B22',
      'editorWidget.border': '#30363D',
      'editorSuggestWidget.background': '#161B22',
      'editorSuggestWidget.border': '#30363D',
      'editorSuggestWidget.selectedBackground': '#21262d',
      'scrollbarSlider.background': '#30363D80',
      'scrollbarSlider.hoverBackground': '#30363D',
      'scrollbarSlider.activeBackground': '#8B949E',
      'editorBracketMatch.background': '#30363D',
      'editorBracketMatch.border': '#8B949E',
    },
  });

  monaco.editor.defineTheme('github-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'CF222E' },
      { token: 'string', foreground: '0A3069' },
      { token: 'function', foreground: '8250DF' },
      { token: 'number', foreground: '0550AE' },
      { token: 'variable', foreground: '953800' },
      { token: 'comment', foreground: '6E7781' },
      { token: 'type', foreground: '0550AE' },
      { token: 'operator', foreground: '1F2328' },
      { token: 'delimiter', foreground: '1F2328' },
      { token: 'identifier', foreground: '1F2328' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#1F2328',
      'editor.lineHighlightBackground': '#F6F8FA',
      'editor.selectionBackground': '#B6D7FF',
      'editor.inactiveSelectionBackground': '#B6D7FF80',
      'editorCursor.foreground': '#1F2328',
      'editorWhitespace.foreground': '#D1D9E0',
      'editorIndentGuide.background': '#D1D9E0',
      'editorIndentGuide.activeBackground': '#656D76',
      'editorLineNumber.foreground': '#656D76',
      'editorLineNumber.activeForeground': '#1F2328',
      'editorGutter.background': '#FFFFFF',
      'editorWidget.background': '#F6F8FA',
      'editorWidget.border': '#D1D9E0',
      'editorSuggestWidget.background': '#F6F8FA',
      'editorSuggestWidget.border': '#D1D9E0',
      'editorSuggestWidget.selectedBackground': '#eff2f5',
      'scrollbarSlider.background': '#D1D9E080',
      'scrollbarSlider.hoverBackground': '#D1D9E0',
      'scrollbarSlider.activeBackground': '#656D76',
      'editorBracketMatch.background': '#F6F8FA',
      'editorBracketMatch.border': '#656D76',
    },
  });

  monaco.editor.defineTheme('crimson-forge', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'comment', foreground: '7D8590' },
      { token: 'type', foreground: '79C0FF' },
      { token: 'operator', foreground: 'F8FAFC' },
      { token: 'delimiter', foreground: 'F8FAFC' },
      { token: 'identifier', foreground: 'F8FAFC' },
    ],
    colors: {
      'editor.background': '#0B0F14',
      'editor.foreground': '#F8FAFC',
      'editor.lineHighlightBackground': '#101826',
      'editor.selectionBackground': '#3A1625',
      'editor.inactiveSelectionBackground': '#3A162590',
      'editorCursor.foreground': '#E5B94D',
      'editorWhitespace.foreground': '#242B36',
      'editorIndentGuide.background': '#242B36',
      'editorIndentGuide.activeBackground': '#D89B1D',
      'editorLineNumber.foreground': '#7D8590',
      'editorLineNumber.activeForeground': '#E5B94D',
      'editorGutter.background': '#0B0F14',
      'editorWidget.background': '#101826',
      'editorWidget.border': '#242B36',
      'editorSuggestWidget.background': '#101826',
      'editorSuggestWidget.border': '#242B36',
      'editorSuggestWidget.selectedBackground': '#132238',
      'scrollbarSlider.background': '#242B3680',
      'scrollbarSlider.hoverBackground': '#242B36',
      'scrollbarSlider.activeBackground': '#7D8590',
      'editorBracketMatch.background': '#3A1625',
      'editorBracketMatch.border': '#D89B1D',
    },
  });

  monaco.editor.defineTheme('united', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'DA291C' },
      { token: 'string', foreground: 'FBE122' },
      { token: 'function', foreground: 'FFFFFF' },
      { token: 'number', foreground: 'FBE122' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'comment', foreground: '888888' },
      { token: 'type', foreground: 'DA291C' },
      { token: 'operator', foreground: 'FFFFFF' },
      { token: 'delimiter', foreground: 'FFFFFF' },
      { token: 'identifier', foreground: 'FFFFFF' },
    ],
    colors: {
      'editor.background': '#1A1A1A',
      'editor.foreground': '#FFFFFF',
      'editor.lineHighlightBackground': '#242424',
      'editor.selectionBackground': '#A5002160',
      'editor.inactiveSelectionBackground': '#A5002135',
      'editorCursor.foreground': '#FBE122',
      'editorWhitespace.foreground': '#333333',
      'editorIndentGuide.background': '#2A2A2A',
      'editorIndentGuide.activeBackground': '#DA291C',
      'editorLineNumber.foreground': '#777777',
      'editorLineNumber.activeForeground': '#FBE122',
      'editorGutter.background': '#1A1A1A',
      'editorWidget.background': '#1A1A1A',
      'editorWidget.border': '#333333',
      'editorSuggestWidget.background': '#1A1A1A',
      'editorSuggestWidget.border': '#DA291C',
      'editorSuggestWidget.selectedBackground': '#A5002150',
      'scrollbarSlider.background': '#33333380',
      'scrollbarSlider.hoverBackground': '#DA291C80',
      'scrollbarSlider.activeBackground': '#DA291C',
      'editorBracketMatch.background': '#A5002140',
      'editorBracketMatch.border': '#FBE122',
    },
  });

  CJ._monacoThemesDefined = true;
};

CJ.createEditor = function (root, options) {
  const opts = Object.assign({ language: 'python', code: '', onChange: null }, options);

  const langMap = {
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
  };

  CJ.defineThemes();

  const currentThemeAttr = document.documentElement.getAttribute('data-theme');
  const currentTheme = currentThemeAttr === 'united' ? 'united' : (currentThemeAttr === 'crimson-forge' ? 'crimson-forge' : (currentThemeAttr === 'light' ? 'github-light' : 'github-dark'));

  if (!window.monaco) {
    // Fallback: show a plain textarea if Monaco failed to load
    root.innerHTML = '<textarea id="code-input" spellcheck="false" style="width:100%;height:100%;border:none;outline:none;resize:none;padding:16px 20px;font-family:var(--font-mono);font-size:13px;line-height:22px;background:var(--panel);color:var(--code);"></textarea>';
    const ta = root.querySelector('textarea');
    let runHandler = null;
    let onCaret = null;
    if (opts.onChange) ta.addEventListener('input', () => opts.onChange(ta.value));
    return {
      setLanguage() {},
      setValue(v) { ta.value = v; },
      getValue() { return ta.value; },
      focus() { ta.focus(); },
      layout() {},
      onCursorPositionChange(fn) {},
      render() {},
      highlight() {},
      onRun(fn) { runHandler = fn; },
      onCaret(fn) { onCaret = fn; },
      destroy() {},
    };
  }

  const editor = monaco.editor.create(root, {
    value: opts.code || '',
    language: langMap[opts.language] || 'plaintext',
    theme: currentTheme,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    tabSize: 2,
    insertSpaces: true,
  });

  let currentLang = opts.language;
  let runHandler = null;
  let onCaret = null;

  if (opts.onChange) {
    editor.onDidChangeModelContent(() => {
      opts.onChange(editor.getValue());
    });
  }

  editor.onDidChangeCursorPosition((e) => {
    if (onCaret) {
      onCaret({ line: e.position.lineNumber, col: e.position.column });
    }
  });

  return {
    setLanguage(lang) {
      currentLang = lang;
      const model = editor.getModel();
      if (model && window.monaco) {
        monaco.editor.setModelLanguage(model, langMap[lang] || 'plaintext');
      }
    },
    setValue(v) {
      editor.setValue(v);
    },
    getValue() {
      return editor.getValue();
    },
    focus() {
      editor.focus();
    },
    layout() {
      if (editor && typeof editor.layout === 'function') {
        editor.layout();
      }
    },
    onCursorPositionChange(fn) {
      if (editor && typeof editor.onDidChangeCursorPosition === 'function') {
        editor.onDidChangeCursorPosition((e) => {
          fn({ lineNumber: e.position.lineNumber, column: e.position.column });
        });
      }
    },
    render() {},
    highlight(code, lang) {},
    onRun(fn) {
      runHandler = fn;
    },
    onCaret(fn) {
      onCaret = fn;
      const pos = editor.getPosition();
      if (pos) fn({ line: pos.lineNumber, col: pos.column });
    },
    destroy() {
      editor.dispose();
    },
  };
};