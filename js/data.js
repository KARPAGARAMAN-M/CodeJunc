/* ============================================================
   CodeJunc — data.js
   Language definitions, starter programs and UI icons.
   ============================================================ */
window.CJ = window.CJ || {};

CJ.data = (function () {
  const svgOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">';
  const svgClose = '</svg>';

  const ICONS = {
    c:
      svgOpen +
      '<defs><linearGradient id="cgrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#6fa8dc"/><stop offset="1" stop-color="#3a6ea5"/></linearGradient></defs>' +
      '<path d="M12 1.6 21.2 6.4v11.2L12 22.4 2.8 17.6V6.4Z" fill="url(#cgrad)"/>' +
      '<text x="12" y="16.6" text-anchor="middle" font-family="Arial, sans-serif" ' +
      'font-size="12" font-weight="800" fill="#ffffff">C</text>' +
      svgClose,
    cpp:
      svgOpen +
      '<defs><linearGradient id="cppgrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#5d9bd3"/><stop offset="1" stop-color="#0f4c81"/></linearGradient></defs>' +
      '<path d="M12 1.6 21.2 6.4v11.2L12 22.4 2.8 17.6V6.4Z" fill="url(#cppgrad)"/>' +
      '<text x="12" y="16.2" text-anchor="middle" font-family="Arial, sans-serif" ' +
      'font-size="8.6" font-weight="800" fill="#ffffff">C++</text>' +
      svgClose,
    java:
      svgOpen +
      '<path d="M5.4 9.6h10.4v5.1a5.2 5.2 0 0 1-5.2 5.2h0a5.2 5.2 0 0 1-5.2-5.2V9.6Z" fill="#e76f00"/>' +
      '<path d="M16.2 10.8h1.5a2.7 2.7 0 0 1 0 5.4h-1.5" fill="none" ' +
      'stroke="#e76f00" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M4.2 21.4h12.4" stroke="#5382a1" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M8.7 6.7c0-1.4 1.4-1.8 1.4-3.1M12.2 6.4c0-1.4 1.4-1.8 1.4-3.1" fill="none" ' +
      'stroke="#5382a1" stroke-width="1.5" stroke-linecap="round"/>' +
      svgClose,
    python:
      '<svg viewBox="0 0 110 110" aria-hidden="true" focusable="false">' +
      '<path d="M54.9 0C29.4 0 31 11.1 31 11.1v11.5h24.4v3.4H20.6S0 24.3 0 49.9c0 25.6 18 24.7 18 24.7h10.7V62s-.6-18 17.7-18h24.4s17.1.3 17.1-16.5V12.1S91.4 0 54.9 0ZM40.4 7.5a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Z" fill="#3776ab"/>' +
      '<path d="M55.1 110c25.5 0 23.9-11.1 23.9-11.1V87.4H54.6v-3.4h34.8S110 85.7 110 60.1c0-25.6-18-24.7-18-24.7H81.3V48s.6 18-17.7 18H39.2s-17.1-.3-17.1 16.5v12.4S18.6 110 55.1 110Zm14.5-7.5a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8Z" fill="#ffd43b"/>' +
      '</svg>',
    javascript:
      svgOpen +
      '<rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#f7df1e"/>' +
      '<text x="12" y="16.4" text-anchor="middle" font-family="Arial, sans-serif" ' +
      'font-size="9.5" font-weight="800" fill="#1a1a1a">JS</text>' +
      svgClose,
  };

  const languages = [
    {
      id: 'c',
      name: 'C',
      short: 'C',
      family: 'compiled',
      familyLabel: 'compiled',
      file: 'main.c',
      icon: ICONS.c,
      accent: '#5aa2e0',
      starter:
        '#include <stdio.h>\n\n' +
        'int main(void) {\n' +
        '    printf("Hello, World!\\n");\n' +
        '    return 0;\n' +
        '}\n',
      inputHint: 'Space-separated values, e.g.\n5 12',
    },
    {
      id: 'cpp',
      name: 'C++',
      short: 'C++',
      family: 'compiled',
      familyLabel: 'compiled',
      file: 'main.cpp',
      icon: ICONS.cpp,
      accent: '#5d9bd3',
      starter:
        '#include <iostream>\n' +
        'using namespace std;\n\n' +
        'int main() {\n' +
        '    cout << "Hello, World!" << endl;\n' +
        '    return 0;\n' +
        '}\n',
      inputHint: 'Space-separated values, e.g.\n5 12',
    },
    {
      id: 'java',
      name: 'Java',
      short: 'Java',
      family: 'compiled',
      familyLabel: 'compiled',
      file: 'Main.java',
      icon: ICONS.java,
      accent: '#e76f00',
      starter:
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        System.out.println("Hello, World!");\n' +
        '    }\n' +
        '}\n',
      inputHint: 'One value per line, e.g.\n5\n12',
    },
    {
      id: 'python',
      name: 'Python',
      short: 'Python',
      family: 'interpreted',
      familyLabel: 'interpreted',
      file: 'main.py',
      icon: ICONS.python,
      accent: '#3776ab',
      starter: 'print("Hello, World!")\n',
      inputHint: 'One value per line, e.g.\n5\n12',
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      short: 'JS',
      family: 'web',
      familyLabel: 'browser',
      file: 'main.js',
      icon: ICONS.javascript,
      accent: '#e8c500',
      starter: 'console.log("Hello, World!");\n',
      inputHint: 'One value per line, e.g.\n5\n12',
    },
  ];

  const ic = (paths, extra) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra || ''}>${paths}</svg>`;

  CJ.icons = {
    contrast:
      ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none"/>'),
    check: ic('<path d="m4.5 12.5 5 5 10-11"/>'),
    alert: ic('<path d="M12 3.5 2.8 19.5h18.4L12 3.5Z"/><path d="M12 9.5v4.5M12 17.2h.01"/>'),
    clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>'),
    info: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>'),
    terminal: ic('<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="m6.5 9 3 3-3 3M12.5 15H17"/>'),
    spinner: '<span class="spinner"></span>',
  };

  CJ.languages = languages;
  CJ.langById = (id) => languages.find((l) => l.id === id) || languages[0];

  return { languages, icons: CJ.icons };
})();
