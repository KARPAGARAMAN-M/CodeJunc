/**
 * Monaco Theme Definitions for CodeJunc
 * Supports: 'dark' (GitHub Dark), 'light' (GitHub Light), 'crimson-forge', 'united'
 */

export const THEME_MONACO_MAP = {
  dark: 'codejunc-dark',
  light: 'codejunc-light',
  'crimson-forge': 'codejunc-crimson-forge',
  united: 'codejunc-united',
};

export function defineMonacoThemes(monaco) {
  if (!monaco) return;

  // 1. GitHub Dark
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

  // 2. GitHub Light
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

  // 3. Crimson Forge
  monaco.editor.defineTheme('codejunc-crimson-forge', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'type', foreground: '79C0FF' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'comment', foreground: '7D8590', fontStyle: 'italic' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'delimiter', foreground: 'F8FAFC' },
      { token: 'operator', foreground: 'E5B94D' },
    ],
    colors: {
      'editor.background': '#0B0F14',
      'editor.foreground': '#F8FAFC',
      'editorLineNumber.foreground': '#7D8590',
      'editorLineNumber.activeForeground': '#F8FAFC',
      'editorGutter.background': '#0B0F14',
      'editorCursor.foreground': '#E5B94D',
      'editor.selectionBackground': '#3A1625',
      'editor.inactiveSelectionBackground': '#2A121D',
      'editor.lineHighlightBackground': '#10182660',
      'editorIndentGuide.background': '#182232',
      'editorIndentGuide.activeBackground': '#242B36',
    },
  });

  // 4. United Theme
  monaco.editor.defineTheme('codejunc-united', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'DA291C' },
      { token: 'type', foreground: 'FBE122' },
      { token: 'function', foreground: 'FBE122' },
      { token: 'string', foreground: '4ADE80' },
      { token: 'number', foreground: 'FBE122' },
      { token: 'comment', foreground: '888888', fontStyle: 'italic' },
      { token: 'variable', foreground: 'FFFFFF' },
      { token: 'delimiter', foreground: 'FFFFFF' },
      { token: 'operator', foreground: 'DA291C' },
    ],
    colors: {
      'editor.background': '#141414',
      'editor.foreground': '#FFFFFF',
      'editorLineNumber.foreground': '#666666',
      'editorLineNumber.activeForeground': '#FFFFFF',
      'editorGutter.background': '#141414',
      'editorCursor.foreground': '#FBE122',
      'editor.selectionBackground': '#3A000A',
      'editor.inactiveSelectionBackground': '#260007',
      'editor.lineHighlightBackground': '#1A1A1A',
      'editorIndentGuide.background': '#222222',
      'editorIndentGuide.activeBackground': '#333333',
    },
  });
}
