const fs = require('fs');

console.log('=== Checking HTML assets ===');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /(?:src|href)=["']([^"']+)["']/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const url = match[1];
  if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('./') && url !== './') {
    const exists = fs.existsSync(url);
    console.log(url, ':', exists ? 'EXISTS (' + fs.statSync(url).size + 'B)' : 'MISSING!');
  }
}

console.log('\n=== Checking CSS for blend modes or drop shadow ===');
const css = fs.readFileSync('css/styles.css', 'utf8');
['mix-blend-mode', 'drop-shadow'].forEach(prop => {
  const count = (css.match(new RegExp(prop, 'g')) || []).length;
  console.log(`${prop} occurrences in styles.css: ${count}`);
});

console.log('\n=== Checking Run button colors in CSS ===');
['dark', 'light', 'crimson-forge', 'united'].forEach(theme => {
  const themeRegex = new RegExp(`:root\\[data-theme=['"]${theme}['"]\\][\\s\\S]*?\\n\\}`, 'g');
  const m = themeRegex.exec(css);
  if (m) {
    const runBg = m[0].match(/--run-bg:\s*([^;]+);/);
    console.log(`Theme '${theme}' --run-bg:`, runBg ? runBg[1].trim() : 'NOT FOUND');
  }
});
