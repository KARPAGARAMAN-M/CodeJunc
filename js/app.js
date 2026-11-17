/* ============================================================
   CodeJunc — app.js
   A premium, minimal, single-purpose online coding platform.
   ============================================================ */
window.CJ = window.CJ || {};

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const STORE = {
    theme: 'cj.theme',
    lang: 'cj.lang.v2',
    drafts: 'cj.drafts.v2',
    stdin: 'cj.stdin.v2',
    outputHeight: 'cj.output.height',
  };

  const state = {
    theme: 'dark',
    themePreference: 'dark', // 'dark' | 'light' | 'system'
    lang: null,
    editor: null,
    running: false,
    runToken: 0,
    lastResult: null,
    lastCopy: '',
    saveTimer: null,
    toastTimer: null,
    activeTab: 'output',
    workspaceReady: false,
  };

  let el = {};

  /* ---------------- storage helpers ---------------- */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  /* ---------------- theme handling ---------------- */
  const THEME_ICONS = {
    united: '<svg viewBox="0 0 24 24" fill="none" stroke="#DA291C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'crimson-forge': '<svg viewBox="0 0 24 24" fill="none" stroke="#DA3633" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  };

  function applyTheme(preference) {
    const isSystem = preference === 'system';
    const isUnited = preference === 'united';
    const isCrimson = preference === 'crimson-forge';
    state.themePreference = isSystem ? 'system' : (isUnited ? 'united' : (isCrimson ? 'crimson-forge' : (preference === 'light' ? 'light' : 'dark')));

    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const active = isSystem ? (systemDark ? 'dark' : 'light') : state.themePreference;

    state.theme = active;
    document.documentElement.setAttribute('data-theme', active);

    const meta = document.getElementById('theme-color');
    if (meta) {
      meta.setAttribute(
        'content',
        active === 'united' ? '#1A1A1A' : (active === 'crimson-forge' ? '#0B0F14' : (active === 'dark' ? '#0D1117' : '#FFFFFF'))
      );
    }

    // Update Theme dropdown trigger
    if (el.themeBtnLabel) {
      if (isSystem) {
        el.themeBtnLabel.textContent = `System (${active === 'dark' ? 'Dark' : 'Light'})`;
      } else if (active === 'united') {
        el.themeBtnLabel.textContent = 'United';
      } else if (active === 'crimson-forge') {
        el.themeBtnLabel.textContent = 'Crimson Forge';
      } else {
        el.themeBtnLabel.textContent = active === 'dark' ? 'Dark' : 'Light';
      }
    }
    if (el.themeBtnIco) {
      el.themeBtnIco.innerHTML = THEME_ICONS[isSystem ? 'system' : active] || THEME_ICONS.dark;
    }

    // Update checkmark in dropdown options
    if (el.themeMenu) {
      $$('.picker-opt', el.themeMenu).forEach((opt) => {
        const val = opt.dataset.themeVal;
        opt.setAttribute('aria-selected', String(val === state.themePreference));
      });
    }

    // Update Welcome page theme toggle button
    const welcomeThemeIcon = document.getElementById('welcome-theme-icon');
    const welcomeThemeText = document.getElementById('welcome-theme-text');
    const welcomeThemeBtn = document.getElementById('welcome-theme-btn');
    if (welcomeThemeIcon && welcomeThemeText) {
      if (active === 'light') {
        welcomeThemeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
        welcomeThemeText.textContent = 'Dark';
        if (welcomeThemeBtn) welcomeThemeBtn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        welcomeThemeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
        welcomeThemeText.textContent = 'Light';
        if (welcomeThemeBtn) welcomeThemeBtn.setAttribute('title', 'Switch to Light Mode');
      }
    }

    // Synchronize Monaco Editor theme
    if (window.monaco) {
      try {
        if (CJ.defineThemes) CJ.defineThemes();
        const monacoTheme = active === 'united' ? 'united' : (active === 'crimson-forge' ? 'crimson-forge' : (active === 'dark' ? 'github-dark' : 'github-light'));
        monaco.editor.setTheme(monacoTheme);
      } catch (e) {}
    }
  }

  function setTheme(preference) {
    applyTheme(preference);
    try {
      localStorage.setItem(STORE.theme, preference);
    } catch (e) {}
    closeAllPickers();
  }

  function toggleTheme() {
    const next = state.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  /* ---------------- language picker ---------------- */
  function buildLangMenu() {
    if (!el.langMenu) return;
    el.langMenu.innerHTML = CJ.languages
      .map(
        (l) => `
        <button type="button" class="picker-opt" role="option" data-lang="${l.id}" aria-selected="false" tabindex="-1">
          <span class="picker-ico" aria-hidden="true">${l.icon}</span>
          <span class="opt-name">${l.name}</span>
          <span class="opt-meta">${l.familyLabel}</span>
          <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>
        </button>`
      )
      .join('');

    $$('.picker-opt', el.langMenu).forEach((opt) => {
      opt.addEventListener('click', () => selectLanguage(opt.dataset.lang));
    });
  }

  function updateLangUI() {
    const l = state.lang;
    if (!l) return;
    if (el.langBtnIcon) el.langBtnIcon.innerHTML = l.icon;
    if (el.langBtnLabel) el.langBtnLabel.textContent = l.name;
    if (el.langBtn) el.langBtn.setAttribute('aria-label', 'Language: ' + l.name);

    if (el.langMenu) {
      $$('.picker-opt', el.langMenu).forEach((o) => {
        o.setAttribute('aria-selected', String(o.dataset.lang === l.id));
      });
    }

    if (el.fileName) el.fileName.textContent = l.file;
    if (el.fileLang) el.fileLang.textContent = l.name;
    if (el.editorNote) {
      el.editorNote.innerHTML = `<i class="lang-dot" style="background:${l.accent}"></i>${l.name} · ${l.familyLabel}`;
    }
    if (el.stdin) {
      el.stdin.placeholder =
        'Program input (stdin)\n' +
        l.inputHint +
        '\n\nOnly needed if your program reads input.';
    }
  }

  function selectLanguage(id, options) {
    const opts = options || {};
    const next = CJ.langById(id);
    if (state.lang && state.lang.id === next.id && !opts.initial) {
      closeAllPickers();
      return;
    }

    saveDraft();
    saveStdin();

    state.lang = next;
    try {
      localStorage.setItem(STORE.lang, next.id);
      if (document.body.classList.contains('is-workspace')) {
        const targetHash = '#/workspace/' + next.id;
        if (history.replaceState) {
          history.replaceState(null, '', targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    } catch (e) {}

    const drafts = readJSON(STORE.drafts, {});
    const code = typeof drafts[next.id] === 'string' ? drafts[next.id] : next.starter;
    const stdins = readJSON(STORE.stdin, {});

    if (state.editor) {
      state.editor.setLanguage(next.id);
      state.editor.setValue(code);
    }
    if (el.stdin) {
      el.stdin.value = typeof stdins[next.id] === 'string' ? stdins[next.id] : '';
    }
    if (el.caretInfo) el.caretInfo.textContent = 'Ln 1, Col 1';

    updateLangUI();
    updateDirty();
    updateWatermark();
    resetOutput();
    closeAllPickers();
  }

  /* ---------------- dropdown pickers ---------------- */
  function closeAllPickers() {
    if (el.themePicker) {
      el.themePicker.classList.remove('open');
      if (el.themeBtn) el.themeBtn.setAttribute('aria-expanded', 'false');
      if (el.themeMenu) el.themeMenu.inert = true;
    }
    if (el.langPicker) {
      el.langPicker.classList.remove('open');
      if (el.langBtn) el.langBtn.setAttribute('aria-expanded', 'false');
      if (el.langMenu) el.langMenu.inert = true;
    }
  }

  function togglePicker(picker, btn, menu) {
    const wasOpen = picker.classList.contains('open');
    closeAllPickers();
    if (!wasOpen) {
      picker.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      menu.inert = false;
    }
  }

  /* ---------------- drafts & persistence ---------------- */
  function saveDraft() {
    if (!state.lang || !state.editor) return;
    const drafts = readJSON(STORE.drafts, {});
    drafts[state.lang.id] = state.editor.getValue();
    writeJSON(STORE.drafts, drafts);
  }

  function saveStdin() {
    if (!state.lang || !el.stdin) return;
    const all = readJSON(STORE.stdin, {});
    all[state.lang.id] = el.stdin.value;
    writeJSON(STORE.stdin, all);
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveDraft, 300);
  }

  function updateDirty() {
    if (!state.editor || !state.lang || !el.dirtyDot) return;
    const dirty = state.editor.getValue() !== state.lang.starter;
    el.dirtyDot.hidden = !dirty;
    el.dirtyDot.title = dirty ? 'Edited — reset to restore starter code' : '';
  }

  function updateWatermark() {
    if (!state.editor || !el.editorWatermark) return;
    const empty = state.editor.getValue().trim().length === 0;
    el.editorWatermark.classList.toggle('is-visible', empty);
  }

  function onEditorChange() {
    updateDirty();
    updateWatermark();
    scheduleSave();
  }

  /* ---------------- output & runner ---------------- */
  function setChip(kind, label, title) {
    if (!el.chip) return;
    el.chip.className = 'status-chip ' + kind;
    el.chip.textContent = label;
    el.chip.title = title || label;
  }

  function formatDuration(ms) {
    if (typeof ms !== 'number' || !isFinite(ms)) return '';
    if (ms < 1000) return Math.max(1, Math.round(ms)) + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }

  const EMPTY_HINT = 'Press <kbd>Ctrl</kbd> + <kbd>↵</kbd> or click <strong>Run ▶</strong>';

  function resetOutput() {
    state.lastResult = null;
    state.lastCopy = '';
    if (el.outputText) {
      el.outputText.hidden = true;
      el.outputText.textContent = '';
    }
    if (el.outputErrors) {
      el.outputErrors.hidden = true;
      el.outputErrors.textContent = '';
    }
    if (el.outputNotes) {
      el.outputNotes.hidden = true;
      el.outputNotes.textContent = '';
    }
    if (el.outputRunning) el.outputRunning.hidden = true;
    if (el.outputEmpty) {
      el.outputEmpty.hidden = false;
      if (el.emptyTitle) el.emptyTitle.textContent = 'Ready to run';
      if (el.emptyHint) el.emptyHint.innerHTML = EMPTY_HINT;
    }
    setChip('is-idle', 'Ready');
    if (el.outputMeta) el.outputMeta.textContent = 'Ready';
    if (el.copyBtn) el.copyBtn.disabled = true;
    if (el.outputBody) el.outputBody.scrollTop = 0;
  }

  function showRunning(phase) {
    if (el.outputEmpty) el.outputEmpty.hidden = true;
    if (el.outputText) el.outputText.hidden = true;
    if (el.outputErrors) el.outputErrors.hidden = true;
    if (el.outputNotes) el.outputNotes.hidden = true;
    if (el.outputRunning) el.outputRunning.hidden = false;
    if (el.runningLabel) el.runningLabel.textContent = (phase || 'Running') + '…';
    setChip('is-running', 'Running', phase || 'Running');
    if (el.outputMeta) el.outputMeta.textContent = 'Executing…';
    if (el.copyBtn) el.copyBtn.disabled = true;
    if (el.outputBody) el.outputBody.scrollTop = 0;
  }

  function makeErrorBlock(title, icon, errors) {
    const block = document.createElement('div');
    block.className = 'err-block';

    const head = document.createElement('div');
    head.className = 'err-title';
    head.innerHTML = icon;
    head.appendChild(document.createTextNode(' ' + title));
    block.appendChild(head);

    errors.forEach((err) => {
      const row = document.createElement('div');
      row.className = 'err-row';
      if (err.line) {
        const badge = document.createElement('span');
        badge.className = 'err-line-badge';
        badge.textContent = 'Line ' + err.line;
        row.appendChild(badge);
      }
      const msg = document.createElement('span');
      msg.className = 'err-msg';
      msg.textContent = (err.line ? ': ' : '') + err.message;
      row.appendChild(msg);
      block.appendChild(row);
    });

    return block;
  }

  async function runCode() {
    if (state.running || !state.editor || !state.lang) return;
    state.running = true;
    const token = ++state.runToken;
    if (el.btnRun) {
      el.btnRun.classList.add('is-running');
      el.btnRun.disabled = true;
    }

    switchTab('output', false);
    showRunning(state.lang.family === 'compiled' ? 'Compiling' : 'Running');

    const code = state.editor.getValue();
    const stdin = (el.stdin && el.stdin.value) || '';

    const start = performance.now();
    let res = null;

    try {
      res = await CJ.runner.run(state.lang.id, code, stdin, {
        onProgress: (p) => {
          if (token !== state.runToken) return;
          showRunning(p.stage || 'Executing');
        },
      });
    } catch (err) {
      res = {
        success: false,
        compileErrors: [],
        runtimeErrors: [{ line: null, message: err.message || 'Execution failed.' }],
        stdout: '',
        durationMs: performance.now() - start,
        notes: [],
      };
    }

    if (token !== state.runToken) return;

    state.running = false;
    if (el.btnRun) {
      el.btnRun.classList.remove('is-running');
      el.btnRun.disabled = false;
    }

    renderResult(res);
  }

  function renderResult(res) {
    state.lastResult = res;
    if (el.outputRunning) el.outputRunning.hidden = true;

    const hasCompile = res.compileErrors && res.compileErrors.length > 0;
    const hasRuntime = res.runtimeErrors && res.runtimeErrors.length > 0;
    const hasErrors = hasCompile || hasRuntime;
    const hasStdout = typeof res.stdout === 'string' && res.stdout.length > 0;

    let copyChunks = [];

    if (hasErrors) {
      setChip('is-error', hasCompile ? 'Compilation Error' : 'Runtime Error');
      if (el.outputMeta) {
        el.outputMeta.textContent =
          (hasCompile ? 'Build failed' : 'Execution stopped') +
          (res.durationMs ? ' · ' + formatDuration(res.durationMs) : '');
      }
    } else {
      setChip('is-success', 'Success', 'Program finished successfully');
      if (el.outputMeta) {
        el.outputMeta.textContent =
          'Finished in ' + formatDuration(res.durationMs || 0) + ' · Exit 0';
      }
    }

    if (hasStdout && el.outputText) {
      el.outputText.textContent = res.stdout;
      el.outputText.hidden = false;
      copyChunks.push(res.stdout);
    } else if (el.outputText) {
      el.outputText.hidden = true;
      el.outputText.textContent = '';
    }

    if (hasErrors && el.outputErrors) {
      el.outputErrors.innerHTML = '';
      if (hasCompile) {
        el.outputErrors.appendChild(
          makeErrorBlock('Compilation Error', CJ.icons.alert || '', res.compileErrors)
        );
        copyChunks.push(
          '[Compilation Error]\n' +
            res.compileErrors.map((e) => (e.line ? `Line ${e.line}: ` : '') + e.message).join('\n')
        );
      }
      if (hasRuntime) {
        el.outputErrors.appendChild(
          makeErrorBlock('Runtime Error', CJ.icons.alert || '', res.runtimeErrors)
        );
        copyChunks.push(
          '[Runtime Error]\n' +
            res.runtimeErrors.map((e) => (e.line ? `Line ${e.line}: ` : '') + e.message).join('\n')
        );
      }
      el.outputErrors.hidden = false;
    } else if (el.outputErrors) {
      el.outputErrors.hidden = true;
      el.outputErrors.textContent = '';
    }

    if (!hasStdout && !hasErrors) {
      if (el.outputEmpty) {
        el.outputEmpty.hidden = false;
        if (el.emptyTitle) el.emptyTitle.textContent = 'Process completed with no output.';
        if (el.emptyHint) el.emptyHint.innerHTML = 'Add a print or console statement and run again.';
      }
    } else if (el.outputEmpty) {
      el.outputEmpty.hidden = true;
    }

    state.lastCopy = copyChunks.join('\n\n').trim();
    if (el.copyBtn) el.copyBtn.disabled = !state.lastCopy;
  }

  /* ---------------- tabs ---------------- */
  function switchTab(name, focusTab) {
    state.activeTab = name;
    const isOut = name === 'output';
    if (el.tabOutput) el.tabOutput.setAttribute('aria-selected', String(isOut));
    if (el.tabInput) el.tabInput.setAttribute('aria-selected', String(!isOut));
    if (el.panelOutput) el.panelOutput.hidden = !isOut;
    if (el.panelInput) el.panelInput.hidden = isOut;

    $$('.output-only', el.outputCard).forEach((tool) => {
      tool.style.display = isOut ? '' : 'none';
    });

    if (!isOut && el.stdin && focusTab) {
      setTimeout(() => el.stdin.focus(), 20);
    }
  }

  /* ---------------- editor tools ---------------- */
  function resetStarter() {
    if (!state.lang || !state.editor) return;
    state.editor.setValue(state.lang.starter);
    saveDraft();
    updateDirty();
    updateWatermark();
    showToast('Starter code restored');
  }

  function downloadCode() {
    if (!state.lang || !state.editor) return;
    const code = state.editor.getValue();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.lang.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('File downloaded');
  }

  function clearCode() {
    if (!state.editor) return;
    state.editor.setValue('');
    saveDraft();
    updateDirty();
    updateWatermark();
    showToast('Editor cleared');
  }

  function copyOutput() {
    if (!state.lastCopy) return;
    navigator.clipboard
      .writeText(state.lastCopy)
      .then(() => showToast('Output copied to clipboard'))
      .catch(() => showToast('Could not copy output'));
  }

  function showToast(text) {
    if (!el.toast || !el.toastText) return;
    clearTimeout(state.toastTimer);
    el.toastText.textContent = text;
    el.toast.classList.add('is-visible');
    state.toastTimer = setTimeout(() => {
      el.toast.classList.remove('is-visible');
    }, 2200);
  }

  /* ---------------- resizer (VS Code / Codespaces style) ---------------- */
  function initResizer() {
    if (!el.resizer || !el.outputCard || !el.editorCard) return;

    let dragging = false;
    let startY = 0;
    let startHeight = 0;

    // Restore saved height
    const savedH = parseInt(localStorage.getItem(STORE.outputHeight), 10);
    if (savedH && savedH >= 100 && savedH <= window.innerHeight * 0.7) {
      el.outputCard.style.height = savedH + 'px';
    }

    const onPointerDown = (e) => {
      dragging = true;
      startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      startHeight = el.outputCard.getBoundingClientRect().height;
      el.resizer.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY) || startY;
      const delta = startY - currentY;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.7, startHeight + delta));
      el.outputCard.style.height = newHeight + 'px';
      if (state.editor) {
        state.editor.layout();
      }
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      el.resizer.classList.remove('is-dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      try {
        localStorage.setItem(STORE.outputHeight, el.outputCard.getBoundingClientRect().height);
      } catch (err) {}
      if (state.editor) {
        state.editor.layout();
      }
    };

    el.resizer.addEventListener('mousedown', onPointerDown);
    el.resizer.addEventListener('touchstart', onPointerDown, { passive: true });
  }

  /* ---------------- workspace transition ---------------- */
  function initWorkspace() {
    if (state.workspaceReady) return;
    state.workspaceReady = true;

    // Cache elements
    el.welcome = document.getElementById('welcome');
    el.workspace = document.getElementById('workspace');
    el.themePicker = document.getElementById('theme-picker');
    el.themeBtn = document.getElementById('theme-btn');
    el.themeBtnLabel = document.getElementById('theme-btn-label');
    el.themeBtnIco = document.getElementById('theme-btn-ico');
    el.themeMenu = document.getElementById('theme-menu');

    el.langPicker = document.getElementById('lang-picker');
    el.langBtn = document.getElementById('lang-btn');
    el.langBtnLabel = document.getElementById('lang-btn-label');
    el.langBtnIcon = document.getElementById('lang-btn-icon');
    el.langMenu = document.getElementById('lang-menu');

    el.btnRun = document.getElementById('btn-run');
    el.editorCard = document.getElementById('editor-card');
    el.editorHost = document.getElementById('editor');
    el.editorWatermark = document.getElementById('editor-watermark');
    el.fileName = document.getElementById('file-name');
    el.fileLang = document.getElementById('file-lang');
    el.dirtyDot = document.getElementById('dirty-dot');
    el.caretInfo = document.getElementById('caret-info');
    el.editorNote = document.getElementById('editor-note');

    el.resizer = document.getElementById('resizer');
    el.outputCard = document.getElementById('output-card');
    el.tabOutput = document.getElementById('tab-output');
    el.tabInput = document.getElementById('tab-input');
    el.panelOutput = document.getElementById('panel-output');
    el.panelInput = document.getElementById('panel-input');
    el.outputEmpty = document.getElementById('output-empty');
    el.emptyTitle = document.getElementById('empty-title');
    el.emptyHint = document.getElementById('empty-hint');
    el.outputRunning = document.getElementById('output-running');
    el.runningLabel = document.getElementById('running-label');
    el.outputText = document.getElementById('output-text');
    el.outputErrors = document.getElementById('output-errors');
    el.outputNotes = document.getElementById('output-notes');
    el.outputMeta = document.getElementById('output-meta');
    el.chip = document.getElementById('status-chip');
    el.copyBtn = document.getElementById('btn-copy');
    el.clearOutputBtn = document.getElementById('btn-clear-output');
    el.stdin = document.getElementById('stdin');

    el.btnReset = document.getElementById('btn-reset');
    el.btnDownload = document.getElementById('btn-download');
    el.btnClearCode = document.getElementById('btn-clear-code');
    el.toast = document.getElementById('toast');
    el.toastText = document.getElementById('toast-text');

    // Setup Theme Picker
    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePicker(el.themePicker, el.themeBtn, el.themeMenu);
      });
    }
    if (el.themeMenu) {
      $$('.picker-opt', el.themeMenu).forEach((opt) => {
        opt.addEventListener('click', () => setTheme(opt.dataset.themeVal));
      });
    }

    // Setup Language Picker
    buildLangMenu();
    if (el.langBtn) {
      el.langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePicker(el.langPicker, el.langBtn, el.langMenu);
      });
    }

    // Close pickers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.picker')) {
        closeAllPickers();
      }
    });

    // Escape key closes pickers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllPickers();
    });

    // Setup Monaco Editor
    const initialLang = localStorage.getItem(STORE.lang) || 'python';
    state.lang = CJ.langById(initialLang);

    const drafts = readJSON(STORE.drafts, {});
    const initialCode = typeof drafts[state.lang.id] === 'string' ? drafts[state.lang.id] : state.lang.starter;

    state.editor = CJ.createEditor(el.editorHost, {
      language: state.lang.id,
      code: initialCode,
      onChange: onEditorChange,
    });

    // Caret listener
    if (state.editor && typeof state.editor.onCursorPositionChange === 'function') {
      state.editor.onCursorPositionChange((pos) => {
        if (el.caretInfo) el.caretInfo.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
      });
    }

    // Setup Split Resizer
    initResizer();

    // Editor Header Actions
    if (el.btnReset) el.btnReset.addEventListener('click', resetStarter);
    if (el.btnDownload) el.btnDownload.addEventListener('click', downloadCode);
    if (el.btnClearCode) el.btnClearCode.addEventListener('click', clearCode);

    // Run Button
    if (el.btnRun) el.btnRun.addEventListener('click', runCode);

    // Output Tabs
    if (el.tabOutput) el.tabOutput.addEventListener('click', () => switchTab('output', true));
    if (el.tabInput) el.tabInput.addEventListener('click', () => switchTab('input', true));

    // Output Actions
    if (el.copyBtn) el.copyBtn.addEventListener('click', copyOutput);
    if (el.clearOutputBtn) el.clearOutputBtn.addEventListener('click', resetOutput);

    // Stdin live draft save
    if (el.stdin) {
      el.stdin.addEventListener('input', () => {
        scheduleSave();
      });
    }

    // Keyboard Shortcuts: Ctrl+Enter / Cmd+Enter runs code
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.defaultPrevented) {
        e.preventDefault();
        runCode();
      }
    });

    // Save on tab switch / window blur
    window.addEventListener('beforeunload', () => {
      saveDraft();
      saveStdin();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveDraft();
        saveStdin();
      }
    });

    // Brand Logo Link (Return to Welcome)
    const brandLink = document.getElementById('brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        showWelcome();
      });
    }

    // Window resize layout
    window.addEventListener('resize', () => {
      if (state.editor) state.editor.layout();
    });

    // Initial state setup
    updateLangUI();
    updateDirty();
    updateWatermark();
    resetOutput();
    switchTab('output', false);

    // Apply current theme
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(STORE.theme);
    } catch (e) {}
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(state.themePreference || savedTheme || (systemDark ? 'dark' : 'light'));
  }

  /* ---------------- routing & navigation ---------------- */
  function parseRoute() {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const sessionRoute = sessionStorage.getItem('cj.route');

    const isWorkspace =
      hash.indexOf('workspace') !== -1 ||
      search.indexOf('workspace') !== -1 ||
      sessionRoute === 'workspace';

    let langId = null;
    const match = hash.match(/workspace\/([a-zA-Z0-9_\-+]+)/i) || search.match(/[?&]lang=([a-zA-Z0-9_\-+]+)/i);
    if (match && match[1]) {
      const raw = match[1].toLowerCase();
      if (CJ.langById(raw)) {
        langId = raw;
      }
    }

    if (!langId) {
      try {
        langId = localStorage.getItem(STORE.lang);
      } catch (e) {}
    }

    return {
      isWorkspace,
      langId: langId || 'python',
    };
  }

  function showWorkspace(options) {
    const opts = Object.assign({ immediate: false, lang: null }, options);
    const welcome = document.getElementById('welcome');
    const workspace = document.getElementById('workspace');
    if (!welcome || !workspace) return;

    if (opts.lang) {
      const target = CJ.langById(opts.lang);
      if (target) {
        state.lang = target;
        try {
          localStorage.setItem(STORE.lang, target.id);
        } catch (e) {}
      }
    }

    initWorkspace();

    if (opts.lang && state.editor && typeof selectLanguage === 'function') {
      selectLanguage(opts.lang);
    }

    // Persist route into URL hash and sessionStorage
    try {
      sessionStorage.setItem('cj.route', 'workspace');
      const curLang = state.lang ? state.lang.id : 'python';
      const targetHash = '#/workspace/' + curLang;
      if (window.location.hash !== targetHash) {
        if (history.replaceState) {
          history.replaceState(null, '', targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    } catch (e) {}

    document.documentElement.classList.add('route-workspace');
    document.body.classList.remove('is-welcome');
    document.body.classList.add('is-workspace');

    if (opts.immediate) {
      welcome.style.display = 'none';
      welcome.classList.add('is-hidden');
      workspace.classList.add('is-visible');
      welcome.setAttribute('aria-hidden', 'true');
      workspace.setAttribute('aria-hidden', 'false');
      if (state.editor && typeof state.editor.layout === 'function') {
        state.editor.layout();
      }
    } else {
      welcome.classList.add('is-hidden');
      workspace.classList.add('is-visible');
      welcome.setAttribute('aria-hidden', 'true');
      workspace.setAttribute('aria-hidden', 'false');

      window.setTimeout(() => {
        welcome.style.display = 'none';
        if (state.editor && typeof state.editor.layout === 'function') {
          try {
            state.editor.layout();
          } catch (e) {}
        }
        if (state.editor && typeof state.editor.focus === 'function') {
          try {
            state.editor.focus();
          } catch (e) {}
        }
      }, 350);
    }
  }

  function showWelcome() {
    const welcome = document.getElementById('welcome');
    const workspace = document.getElementById('workspace');
    if (!welcome || !workspace) return;

    try {
      sessionStorage.removeItem('cj.route');
      if (window.location.hash) {
        if (history.replaceState) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          window.location.hash = '';
        }
      }
    } catch (e) {}

    document.documentElement.classList.remove('route-workspace');
    document.body.classList.remove('is-workspace');
    document.body.classList.add('is-welcome');

    welcome.style.display = '';
    void welcome.offsetWidth; // Force reflow
    welcome.classList.remove('is-hidden');
    workspace.classList.remove('is-visible');
    welcome.setAttribute('aria-hidden', 'false');
    workspace.setAttribute('aria-hidden', 'true');
  }

  function loadMonaco() {
    return new Promise((resolve) => {
      if (window.monaco) {
        resolve();
        return;
      }
      if (!window.require) {
        resolve();
        return;
      }
      try {
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
        require(
          ['vs/editor/editor.main'],
          function () {
            resolve();
          },
          function (err) {
            console.error('Monaco load error:', err);
            resolve();
          }
        );
      } catch (e) {
        console.error('Monaco load error:', e);
        resolve();
      }
    });
  }

  async function init() {
    // 1. Initial Theme Detection:
    // If user has saved a theme preference in localStorage, respect it.
    // If first-time user, default to OS preference (prefers-color-scheme: dark ? 'dark' : 'light').
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(STORE.theme);
    } catch (e) {}

    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let initialPref;
    if (savedTheme) {
      initialPref = savedTheme;
    } else {
      // First-time user: automatically follow operating system's preference
      initialPref = systemDark ? 'dark' : 'light';
    }

    applyTheme(initialPref);

    // Dynamic OS theme change listener
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onSchemeChange = () => {
        let pref = null;
        try {
          pref = localStorage.getItem(STORE.theme);
        } catch (e) {}
        if (!pref || pref === 'system') {
          applyTheme(mq.matches ? 'dark' : 'light');
        }
      };
      if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
      else if (mq.addListener) mq.addListener(onSchemeChange);
    }

    // 2. Welcome page event listeners:
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', () => showWorkspace());

    const welcomePreview = document.getElementById('welcome-preview-card');
    if (welcomePreview) welcomePreview.addEventListener('click', () => showWorkspace());

    $$('.quick-lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.dataset.lang;
        showWorkspace({ lang });
      });
    });

    const welcomeThemeBtn = document.getElementById('welcome-theme-btn');
    if (welcomeThemeBtn) {
      welcomeThemeBtn.addEventListener('click', toggleTheme);
    }

    // Keyboard shortcut on Welcome screen: Enter or Space starts coding
    window.addEventListener('keydown', (e) => {
      if (document.body.classList.contains('is-welcome')) {
        if (e.key === 'Enter' || (e.key === ' ' && !e.target.closest('button, input, textarea'))) {
          e.preventDefault();
          showWorkspace();
        }
      }
    });

    // 3. Routing & Navigation Persistence:
    const route = parseRoute();

    // Preload Monaco
    await loadMonaco();
    if (CJ.defineThemes) CJ.defineThemes();
    if (window.monaco) {
      try {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const monacoTheme = activeTheme === 'united' ? 'united' : (activeTheme === 'crimson-forge' ? 'crimson-forge' : (activeTheme === 'dark' ? 'github-dark' : 'github-light'));
        monaco.editor.setTheme(monacoTheme);
      } catch (e) {}
    }

    // 4. If direct URL access or refresh while inside workspace, stay in workspace
    if (route.isWorkspace) {
      showWorkspace({ immediate: true, lang: route.langId });
    }

    // 5. Browser history back/forward hashchange listener
    window.addEventListener('hashchange', () => {
      const cur = parseRoute();
      if (cur.isWorkspace) {
        if (!document.body.classList.contains('is-workspace')) {
          showWorkspace({ immediate: false, lang: cur.langId });
        } else if (state.lang && state.lang.id !== cur.langId) {
          selectLanguage(cur.langId);
        }
      } else {
        if (document.body.classList.contains('is-workspace')) {
          showWelcome();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
