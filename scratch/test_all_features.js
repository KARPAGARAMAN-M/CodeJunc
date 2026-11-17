const fs = require('fs');

console.log('=== TEST 1: HTML Element Check ===');
const html = fs.readFileSync('index.html', 'utf8');

const requiredIds = [
  'welcome',
  'workspace',
  'btn-start',
  'welcome-preview-card',
  'welcome-theme-btn',
  'welcome-theme-icon',
  'welcome-theme-text',
  'brand-link',
  'theme-btn',
  'lang-btn',
  'btn-run',
  'editor',
  'output-card'
];

requiredIds.forEach(id => {
  const hasId = html.includes(`id="${id}"`);
  console.log(`Checking #${id}:`, hasId ? 'PASSED' : 'FAILED!');
});

const quickLangs = ['python', 'javascript', 'c', 'cpp', 'java'];
quickLangs.forEach(lang => {
  const hasLang = html.includes(`data-lang="${lang}"`);
  console.log(`Quick-launch button for ${lang}:`, hasLang ? 'PASSED' : 'FAILED!');
});

console.log('\n=== TEST 2: JS Functionality Check ===');
const appJs = fs.readFileSync('js/app.js', 'utf8');

const checks = [
  { name: 'parseRoute function', test: appJs.includes('function parseRoute') },
  { name: 'showWorkspace options with lang & immediate', test: appJs.includes('function showWorkspace') && appJs.includes('opts.immediate') },
  { name: 'showWelcome function', test: appJs.includes('function showWelcome') },
  { name: 'toggleTheme function', test: appJs.includes('function toggleTheme') },
  { name: 'Brand link click handler', test: appJs.includes('brandLink.addEventListener') },
  { name: 'Quick language button handler', test: appJs.includes('quick-lang-btn') },
  { name: 'Welcome preview card click handler', test: appJs.includes('welcomePreview') },
  { name: 'Welcome Enter/Space keyboard handler', test: appJs.includes("e.key === 'Enter'") },
  { name: 'Hashchange navigation listener', test: appJs.includes("hashchange") },
  { name: 'System preference default on first visit', test: appJs.includes('initialPref = systemDark ? \'dark\' : \'light\'') },
  { name: 'Welcome page theme button update in applyTheme', test: appJs.includes('welcomeThemeIcon') }
];

checks.forEach(c => {
  console.log(`Checking ${c.name}:`, c.test ? 'PASSED' : 'FAILED!');
});

console.log('\n=== TEST 3: CSS Rules Check ===');
const css = fs.readFileSync('css/styles.css', 'utf8');

const cssChecks = [
  { name: 'Route persistence class', test: css.includes('html.route-workspace') },
  { name: 'Technical grid background', test: css.includes('.welcome-grid-bg') },
  { name: 'Ambient glow', test: css.includes('.welcome-ambient-glow') },
  { name: 'Top utility bar', test: css.includes('.welcome-topbar') },
  { name: 'Brand mark frame', test: css.includes('.welcome-mark-frame') },
  { name: 'Start coding button & kbd badge', test: css.includes('.btn-welcome') && css.includes('.welcome-kbd') },
  { name: 'Quick launch buttons', test: css.includes('.quick-lang-btn') },
  { name: 'Miniature workspace preview card', test: css.includes('.welcome-preview-card') },
  { name: 'Footer metadata strip', test: css.includes('.welcome-footer-meta') },
  { name: 'Theme adaptive tweaks', test: css.includes("[data-theme='light'] .welcome-ambient-glow") }
];

cssChecks.forEach(c => {
  console.log(`Checking ${c.name}:`, c.test ? 'PASSED' : 'FAILED!');
});
