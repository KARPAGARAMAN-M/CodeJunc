import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(rootDir, 'backend');

const isWindows = process.platform === 'win32';

// ANSI terminal colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function prefixLog(tag, color, data) {
  const text = data.toString();
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    console.log(`${color}${colors.bold}[${tag}]${colors.reset} ${line}`);
  }
}

console.log(`${colors.green}${colors.bold}====================================================${colors.reset}`);
console.log(`${colors.green}${colors.bold}  Starting CodeJunc Full-Stack Development Server  ${colors.reset}`);
console.log(`${colors.gray}  Backend : Spring Boot 3 on http://localhost:8080${colors.reset}`);
console.log(`${colors.gray}  Frontend: Vite + React on http://localhost:3000${colors.reset}`);
console.log(`${colors.green}${colors.bold}====================================================${colors.reset}\n`);

// 1. Determine backend startup command
const jarPath = path.resolve(backendDir, 'target', 'codejunc-backend-1.0.0.jar');
let backendCommand;
let backendArgs;

// Check if mvn command is accessible
let hasMvn = false;
try {
  execSync(isWindows ? 'where mvn' : 'which mvn', { stdio: 'ignore' });
  hasMvn = true;
} catch (e) {
  hasMvn = false;
}

if (hasMvn) {
  backendCommand = isWindows ? 'mvn.cmd' : 'mvn';
  backendArgs = ['spring-boot:run'];
} else if (fs.existsSync(jarPath)) {
  backendCommand = 'java';
  backendArgs = ['-jar', jarPath];
} else {
  backendCommand = isWindows ? 'mvn.cmd' : 'mvn';
  backendArgs = ['spring-boot:run'];
}

// 2. Spawn Backend (Spring Boot)
const backend = spawn(backendCommand, backendArgs, {
  cwd: backendDir,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

backend.stdout.on('data', (d) => prefixLog('backend', colors.cyan, d));
backend.stderr.on('data', (d) => prefixLog('backend', colors.yellow, d));

backend.on('error', (err) => {
  console.error(`${colors.red}[backend] Failed to start backend: ${err.message}${colors.reset}`);
});

backend.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`${colors.yellow}[backend] Backend process exited with code ${code}${colors.reset}`);
  }
});

// 3. Spawn Frontend (Vite)
const vitePath = path.resolve(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const frontend = spawn(process.execPath, [vitePath], {
  cwd: rootDir,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

frontend.stdout.on('data', (d) => prefixLog('frontend', colors.magenta, d));
frontend.stderr.on('data', (d) => prefixLog('frontend', colors.red, d));

frontend.on('error', (err) => {
  console.error(`${colors.red}[frontend] Failed to start frontend: ${err.message}${colors.reset}`);
});

frontend.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`${colors.yellow}[frontend] Frontend process exited with code ${code}${colors.reset}`);
  }
});

// 4. Graceful shutdown handler
let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${colors.yellow}[dev] Shutting down CodeJunc processes...${colors.reset}`);

  function killProcess(proc) {
    if (!proc || !proc.pid) return;
    if (isWindows) {
      try {
        spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch (e) {}
    } else {
      try {
        proc.kill('SIGINT');
      } catch (e) {}
    }
  }

  killProcess(backend);
  killProcess(frontend);

  setTimeout(() => process.exit(0), 800);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
