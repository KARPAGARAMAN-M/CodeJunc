/**
 * Monaco Theme Definitions for CodeJunc
 * Supports: 'dark' (GitHub Dark), 'light' (GitHub Light), 'crimson-forge' (Crimson Forge), 'united' (United)
 */

export const THEME_MONACO_MAP = {
  dark: 'codejunc-dark',
  light: 'codejunc-light',
  'crimson-forge': 'codejunc-crimson-forge',
  united: 'codejunc-united',
};

export function defineMonacoThemes(monaco) {
  if (!monaco) return;

  // ============================================================
  // 1. GitHub Dark
  // ============================================================
  monaco.editor.defineTheme('codejunc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'type', foreground: '79C0FF' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'delimiter', foreground: 'E6EDF3' },
      { token: 'operator', foreground: 'FF7B72' },
    ],
    colors: {
      'editor.background': '#0D1117',
      'editor.foreground': '#E6EDF3',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#E6EDF3',
      'editorGutter.background': '#0D1117',
      'editorCursor.foreground': '#58a6ff',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#1f385c',
      'editor.lineHighlightBackground': '#161B2260',
      'editorIndentGuide.background': '#21262d',
      'editorIndentGuide.activeBackground': '#30363D',
    },
  });

  // ============================================================
  // 2. GitHub Light
  // ============================================================
  monaco.editor.defineTheme('codejunc-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'CF222E' },
      { token: 'type', foreground: '0550AE' },
      { token: 'function', foreground: '8250DF' },
      { token: 'string', foreground: '0A3069' },
      { token: 'number', foreground: '0550AE' },
      { token: 'comment', foreground: '6E7781', fontStyle: 'italic' },
      { token: 'variable', foreground: '953800' },
      { token: 'delimiter', foreground: '1F2328' },
      { token: 'operator', foreground: 'CF222E' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#1F2328',
      'editorLineNumber.foreground': '#8c959f',
      'editorLineNumber.activeForeground': '#1F2328',
      'editorGutter.background': '#FFFFFF',
      'editorCursor.foreground': '#0969da',
      'editor.selectionBackground': '#B4D5FE',
      'editor.inactiveSelectionBackground': '#DCE7F7',
      'editor.lineHighlightBackground': '#F6F8FA',
      'editorIndentGuide.background': '#eaeef2',
      'editorIndentGuide.activeBackground': '#D1D9E0',
    },
  });

  // ============================================================
  // 3. Crimson Forge — Midnight Black, Obsidian Navy, Crimson Garnet & Warm Gold
  // ============================================================
  monaco.editor.defineTheme('codejunc-crimson-forge', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'keyword.control', foreground: 'FF7B72' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'function.call', foreground: 'D2A8FF' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'string.escape', foreground: 'E5B94D' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'variable.parameter', foreground: 'FFA657' },
      { token: 'variable.predefined', foreground: 'E5B94D' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'number.hex', foreground: '79C0FF' },
      { token: 'number.float', foreground: '79C0FF' },
      { token: 'comment', foreground: '7D8590', fontStyle: 'italic' },
      { token: 'comment.doc', foreground: '7D8590', fontStyle: 'italic' },
      { token: 'type', foreground: '79C0FF' },
      { token: 'type.identifier', foreground: '79C0FF' },
      { token: 'constant', foreground: '79C0FF' },
      { token: 'operator', foreground: 'E5B94D' },
      { token: 'delimiter', foreground: 'F8FAFC' },
      { token: 'delimiter.bracket', foreground: 'F8FAFC' },
      { token: 'tag', foreground: 'FF7B72' },
      { token: 'attribute.name', foreground: 'D2A8FF' },
      { token: 'attribute.value', foreground: 'A5D6FF' },
    ],
    colors: {
      'editor.background': '#0B0F14',
      'editor.foreground': '#F8FAFC',
      'editorGutter.background': '#0B0F14',
      'editorLineNumber.foreground': '#7D8590',
      'editorLineNumber.activeForeground': '#E5B94D',
      'editorCursor.foreground': '#E5B94D',
      'editor.selectionBackground': '#3A1625D0',
      'editor.inactiveSelectionBackground': '#242B3690',
      'editor.selectionHighlightBackground': '#3A162570',
      'editor.lineHighlightBackground': '#101826',
      'editor.lineHighlightBorder': '#242B3600',
      'editorIndentGuide.background': '#132238',
      'editorIndentGuide.activeBackground': '#E5B94D60',
      'editorWhitespace.foreground': '#242B36',
      'editorBracketMatch.background': '#3A1625A0',
      'editorBracketMatch.border': '#E5B94D',
      'editorSuggestWidget.background': '#101826',
      'editorSuggestWidget.border': '#242B36',
      'editorSuggestWidget.foreground': '#F8FAFC',
      'editorSuggestWidget.selectedBackground': '#3A1625',
      'editorSuggestWidget.highlightForeground': '#E5B94D',
      'scrollbarSlider.background': '#242B3650',
      'scrollbarSlider.hoverBackground': '#3A162590',
      'scrollbarSlider.activeBackground': '#DA363380',
      'editorError.foreground': '#DA3633',
      'editorWarning.foreground': '#D89B1D',
      'editorInfo.foreground': '#79C0FF',
    },
  });

  // ============================================================
  // 4. United Theme — Deep Midnight Navy, Royal Blue & Mint
  // ============================================================
  monaco.editor.defineTheme('codejunc-united', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '38BDF8' },
      { token: 'keyword.control', foreground: '38BDF8' },
      { token: 'type', foreground: '60A5FA' },
      { token: 'function', foreground: '818CF8' },
      { token: 'function.call', foreground: '818CF8' },
      { token: 'string', foreground: '4ADE80' },
      { token: 'string.escape', foreground: 'F472B6' },
      { token: 'number', foreground: 'F472B6' },
      { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
      { token: 'variable', foreground: 'F8FAFC' },
      { token: 'delimiter', foreground: 'F8FAFC' },
      { token: 'operator', foreground: '38BDF8' },
    ],
    colors: {
      'editor.background': '#0A0E17',
      'editor.foreground': '#F8FAFC',
      'editorGutter.background': '#0A0E17',
      'editorLineNumber.foreground': '#64748B',
      'editorLineNumber.activeForeground': '#38BDF8',
      'editorCursor.foreground': '#38BDF8',
      'editor.selectionBackground': '#1E3A8A90',
      'editor.inactiveSelectionBackground': '#1E293B80',
      'editor.lineHighlightBackground': '#0F172A',
      'editorIndentGuide.background': '#1E293B',
      'editorIndentGuide.activeBackground': '#38BDF860',
      'editorSuggestWidget.background': '#0F172A',
      'editorSuggestWidget.border': '#1E293B',
      'editorSuggestWidget.foreground': '#F8FAFC',
      'editorSuggestWidget.selectedBackground': '#1E3A8A',
      'editorSuggestWidget.highlightForeground': '#38BDF8',
      'scrollbarSlider.background': '#1E293B50',
      'scrollbarSlider.hoverBackground': '#2563EB60',
      'scrollbarSlider.activeBackground': '#38BDF880',
    },
  });
}
