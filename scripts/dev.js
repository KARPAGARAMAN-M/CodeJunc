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

// 1. Ensure port 8080 is clean before starting
if (isWindows) {
  try {
    const netstatOut = execSync('netstat -ano | findstr :8080 | findstr LISTENING', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const match = netstatOut.trim().split(/\s+/).pop();
    if (match && !isNaN(parseInt(match))) {
      console.log(`${colors.yellow}[dev] Freeing occupied port 8080 (PID ${match})...${colors.reset}`);
      execSync(`taskkill /pid ${match} /T /F`, { stdio: 'ignore' });
    }
  } catch (e) {}
}

// 2. Determine backend startup command
const jarPath = path.resolve(backendDir, 'target', 'codejunc-backend-1.0.0.jar');
let backendCommand;
let backendArgs;

if (fs.existsSync(jarPath)) {
  backendCommand = 'java';
  backendArgs = ['-jar', jarPath];
} else if (isWindows) {
  backendCommand = 'cmd.exe';
  backendArgs = ['/d', '/s', '/c', 'mvn spring-boot:run'];
} else {
  backendCommand = 'mvn';
  backendArgs = ['spring-boot:run'];
}

// 3. Spawn Backend (Spring Boot)
const backend = spawn(backendCommand, backendArgs, {
  cwd: backendDir,
  shell: false,
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
  shell: false,
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
