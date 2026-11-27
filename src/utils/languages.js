export const LANGUAGE_ICONS = {
  c: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs><linearGradient id="cgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fa8dc"/><stop offset="1" stop-color="#3a6ea5"/></linearGradient></defs>
    <path d="M12 1.6 21.2 6.4v11.2L12 22.4 2.8 17.6V6.4Z" fill="url(#cgrad)"/>
    <text x="12" y="16.6" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#ffffff">C</text>
  </svg>`,
  cpp: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs><linearGradient id="cppgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d9bd3"/><stop offset="1" stop-color="#0f4c81"/></linearGradient></defs>
    <path d="M12 1.6 21.2 6.4v11.2L12 22.4 2.8 17.6V6.4Z" fill="url(#cppgrad)"/>
    <text x="12" y="16.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.6" font-weight="800" fill="#ffffff">C++</text>
  </svg>`,
  java: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5.4 9.6h10.4v5.1a5.2 5.2 0 0 1-5.2 5.2h0a5.2 5.2 0 0 1-5.2-5.2V9.6Z" fill="#e76f00"/>
    <path d="M16.2 10.8h1.5a2.7 2.7 0 0 1 0 5.4h-1.5" fill="none" stroke="#e76f00" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M4.2 21.4h12.4" stroke="#5382a1" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M8.7 6.7c0-1.4 1.4-1.8 1.4-3.1M12.2 6.4c0-1.4 1.4-1.8 1.4-3.1" fill="none" stroke="#5382a1" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  python: `<svg viewBox="0 0 110 110" aria-hidden="true" focusable="false">
    <path d="M54.9 0C29.4 0 31 11.1 31 11.1v11.5h24.4v3.4H20.6S0 24.3 0 49.9c0 25.6 18 24.7 18 24.7h10.7V62s-.6-18 17.7-18h24.4s17.1.3 17.1-16.5V12.1S91.4 0 54.9 0ZM40.4 7.5a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Z" fill="#3776ab"/>
    <path d="M55.1 110c25.5 0 23.9-11.1 23.9-11.1V87.4H54.6v-3.4h34.8S110 85.7 110 60.1c0-25.6-18-24.7-18-24.7H81.3V48s.6 18-17.7 18H39.2s-17.1-.3-17.1 16.5v12.4S18.6 110 55.1 110Zm14.5-7.5a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8Z" fill="#ffd43b"/>
  </svg>`,
  javascript: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#f7df1e"/>
    <text x="12" y="16.4" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="800" fill="#1a1a1a">JS</text>
  </svg>`,
};

export const DEFAULT_LANGUAGE = 'python';

export const LANGUAGES = {
  c: {
    id: 'c',
    name: 'C',
    short: 'C',
    file: 'main.c',
    monaco: 'c',
    monacoLang: 'c',
    version: 'GCC 10',
    pistonLang: 'c',
    pistonVersion: '10.2.0',
    color: '#5aa2e0',
    icon: LANGUAGE_ICONS.c,
    starter:
      '#include <stdio.h>\n\n' +
      'int main() {\n' +
      '    printf("Hello World\\n");\n' +
      '    return 0;\n' +
      '}\n',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    short: 'C++',
    file: 'main.cpp',
    monaco: 'cpp',
    monacoLang: 'cpp',
    version: 'G++ 10',
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    color: '#5d9bd3',
    icon: LANGUAGE_ICONS.cpp,
    starter:
      '#include <iostream>\n\n' +
      'int main() {\n' +
      '    std::cout << "Hello World" << std::endl;\n' +
      '    return 0;\n' +
      '}\n',
  },
  java: {
    id: 'java',
    name: 'Java',
    short: 'Java',
    file: 'Main.java',
    monaco: 'java',
    monacoLang: 'java',
    version: 'OpenJDK 15',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    color: '#e76f00',
    icon: LANGUAGE_ICONS.java,
    starter:
      'public class Main {\n' +
      '    public static void main(String[] args) {\n' +
      '        System.out.println("Hello World");\n' +
      '    }\n' +
      '}\n',
  },
  python: {
    id: 'python',
    name: 'Python',
    short: 'Python',
    file: 'main.py',
    monaco: 'python',
    monacoLang: 'python',
    version: '3.10',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    color: '#3776ab',
    icon: LANGUAGE_ICONS.python,
    starter: 'print("Hello World")\n',
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    short: 'JS',
    file: 'main.js',
    monaco: 'javascript',
    monacoLang: 'javascript',
    version: 'Node 18',
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    color: '#e8c500',
    icon: LANGUAGE_ICONS.javascript,
    starter: 'console.log("Hello World");\n',
  },
};

export const LANGUAGE_LIST = [
  LANGUAGES.c,
  LANGUAGES.cpp,
  LANGUAGES.java,
  LANGUAGES.python,
  LANGUAGES.javascript,
];

export function getLanguage(id) {
  if (!id) return LANGUAGES[DEFAULT_LANGUAGE];
  const normalized = id.toLowerCase().trim();
  return LANGUAGES[normalized] || LANGUAGES[DEFAULT_LANGUAGE];
}

export function getLanguageById(id) {
  return getLanguage(id);
}
