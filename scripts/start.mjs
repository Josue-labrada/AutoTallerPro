// Instala y arranca todo AutoTaller Pro (base de datos, backend y frontend).
// Funciona igual en macOS y Windows. Se ejecuta desde iniciar.command / iniciar.bat.
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
const FRONTEND_URL = 'http://localhost:5173';

const log = (message) => console.log(`\n▶ ${message}`);
const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Ejecuta un comando mostrando su salida. Devuelve true si terminó bien. */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: IS_WINDOWS, ...options });
  return result.status === 0;
}

/** Ejecuta un comando en silencio. Devuelve true si terminó bien. */
function runQuiet(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'ignore', shell: IS_WINDOWS, ...options });
  return result.status === 0;
}

function checkNode() {
  const [major = 0, minor = 0] = process.versions.node.split('.').map(Number);
  const supported = (major === 22 && minor >= 12) || major >= 24;
  if (!supported) {
    fail(`Se necesita Node.js 22.12 o superior (tienes ${process.versions.node}). Instálalo desde https://nodejs.org`);
  }
}

async function ensureDocker() {
  if (!runQuiet('docker', ['--version'])) {
    fail('No se encontró Docker. Instala Docker Desktop desde https://www.docker.com/products/docker-desktop y vuelve a ejecutar este archivo.');
  }
  if (runQuiet('docker', ['info'])) return;

  log('Docker está apagado. Intentando abrirlo (puede tardar un minuto)…');
  if (process.platform === 'darwin') {
    runQuiet('open', ['-a', 'Docker']);
  } else if (IS_WINDOWS) {
    const exe = path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe');
    if (existsSync(exe)) spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
  }
  for (let seconds = 0; seconds < 180; seconds += 3) {
    if (runQuiet('docker', ['info'])) return;
    await sleep(3000);
  }
  fail('Docker no respondió. Ábrelo manualmente, espera a que diga "running" y vuelve a ejecutar este archivo.');
}

function parseEnvFile(file) {
  const values = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
    if (match) values[match[1]] = match[2];
  }
  return values;
}

/**
 * Crea el .env con contraseñas aleatorias propias de esta computadora (nunca se sube a Git).
 * Si el .env ya existe, solo le agrega las variables nuevas que falten (sin tocar las que ya tiene).
 */
function ensureEnvFile() {
  const envPath = path.join(ROOT, '.env');
  const exampleLines = readFileSync(path.join(ROOT, '.env.example'), 'utf8').split(/\r?\n/);

  // Cada marcador (p. ej. cambia_esta_contrasena_db) recibe una contraseña distinta, repetida donde aparezca.
  const secrets = new Map();
  const fillSecrets = (line) =>
    line.replace(/cambia_esta_contrasena_[a-z]+/g, (placeholder) => {
      if (!secrets.has(placeholder)) secrets.set(placeholder, randomBytes(12).toString('hex'));
      return secrets.get(placeholder);
    });

  if (!existsSync(envPath)) {
    log('Creando archivo .env con contraseñas aleatorias…');
    writeFileSync(envPath, exampleLines.map(fillSecrets).join('\n'));
    return;
  }

  const current = parseEnvFile(envPath);
  const missing = exampleLines.filter((line) => {
    const match = /^([A-Z_]+)=/.exec(line);
    return match && !(match[1] in current);
  });
  if (missing.length > 0) {
    log('Agregando al .env las variables nuevas (almacenamiento de fotos)…');
    const content = readFileSync(envPath, 'utf8');
    writeFileSync(envPath, `${content.replace(/\s*$/, '')}\n${missing.map(fillSecrets).join('\n')}\n`);
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

async function ensurePortsFree() {
  for (const [port, name] of [[3000, 'el backend'], [5173, 'el frontend']]) {
    if (!(await isPortFree(port))) {
      fail(`El puerto ${port} (${name}) ya está en uso. Cierra el programa que lo usa (¿otra copia de AutoTaller Pro?) y vuelve a intentar.`);
    }
  }
}

async function waitForDatabase(user) {
  for (let seconds = 0; seconds < 90; seconds += 2) {
    if (runQuiet('docker', ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', user])) return;
    await sleep(2000);
  }
  fail('La base de datos no arrancó a tiempo. Revisa con: docker compose logs db');
}

async function waitForMinio() {
  for (let seconds = 0; seconds < 60; seconds += 2) {
    try {
      if ((await fetch('http://127.0.0.1:9000/minio/health/live')).ok) return;
    } catch {
      // Todavía arrancando.
    }
    await sleep(2000);
  }
  console.error('\n⚠ MinIO (fotos) no respondió; el resto funcionará, pero las fotos de daños no. Revisa: docker compose logs minio');
}

const children = [];

/** Arranca un servidor de desarrollo mostrando su salida con un prefijo. */
function startServer(label, cwd) {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(ROOT, cwd),
    shell: IS_WINDOWS,
    detached: !IS_WINDOWS, // en Mac/Linux, un grupo de procesos propio para poder cerrarlo completo
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const forward = (stream, out) => {
    let pending = '';
    stream.on('data', (chunk) => {
      const lines = (pending + chunk).split(/\r?\n/);
      pending = lines.pop() ?? '';
      for (const line of lines) if (line.trim()) out.write(`[${label}] ${line}\n`);
    });
  };
  forward(child.stdout, process.stdout);
  forward(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`\n✖ El ${label} se detuvo (código ${code}). Revisa los mensajes de arriba.`);
      shutdown(1);
    }
  });
  children.push(child);
}

let shuttingDown = false;
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nDeteniendo AutoTaller Pro… (la base de datos sigue encendida; para apagarla: docker compose stop)');
  for (const child of children) {
    if (!child.pid) continue;
    try {
      if (IS_WINDOWS) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      else process.kill(-child.pid, 'SIGTERM');
    } catch {
      // El proceso ya había terminado.
    }
  }
  setTimeout(() => process.exit(exitCode), 500);
}

async function waitForFrontend() {
  for (let seconds = 0; seconds < 60; seconds++) {
    try {
      if ((await fetch(FRONTEND_URL)).ok) return true;
    } catch {
      // Todavía no está listo.
    }
    await sleep(1000);
  }
  return false;
}

function openBrowser() {
  if (process.env.NO_OPEN) return;
  if (process.platform === 'darwin') runQuiet('open', [FRONTEND_URL]);
  else if (IS_WINDOWS) runQuiet('cmd', ['/c', 'start', '', FRONTEND_URL]);
  else runQuiet('xdg-open', [FRONTEND_URL]);
}

async function main() {
  console.log('=== AutoTaller Pro: instalación y arranque ===');
  checkNode();
  await ensureDocker();
  ensureEnvFile();
  await ensurePortsFree();

  log('Encendiendo la base de datos y el almacenamiento de fotos (PostgreSQL y MinIO en Docker)…');
  if (!run('docker', ['compose', 'up', '-d'])) {
    fail('No se pudo iniciar Docker Compose. Si los puertos 5433, 9000 o 9001 están ocupados, cierra el programa que los usa.');
  }
  await waitForDatabase(parseEnvFile(path.join(ROOT, '.env')).POSTGRES_USER ?? 'autotaller');
  await waitForMinio();

  log('Instalando dependencias del backend…');
  if (!run('npm', ['install', '--no-audit', '--no-fund'], { cwd: path.join(ROOT, 'backend') })) fail('Falló npm install en backend.');
  log('Instalando dependencias del frontend…');
  if (!run('npm', ['install', '--no-audit', '--no-fund'], { cwd: path.join(ROOT, 'frontend') })) fail('Falló npm install en frontend.');

  log('Preparando la base de datos (tablas y datos de ejemplo)…');
  const backend = path.join(ROOT, 'backend');
  if (!run('npm', ['run', 'migrate'], { cwd: backend })) {
    fail('No se pudo preparar la base de datos. Si cambiaste la contraseña del .env después de crearla, ejecuta: docker compose down -v  y vuelve a intentar.');
  }
  run('npm', ['run', 'seed'], { cwd: backend });
  // Primer administrador (solo se crea si todavía no hay usuarios).
  if (!run('npm', ['run', 'create-admin'], { cwd: backend })) fail('No se pudo crear el administrador inicial.');

  log('Arrancando el backend y el frontend…');
  startServer('backend', 'backend');
  startServer('frontend', 'frontend');

  if (await waitForFrontend()) {
    const adminEnv = parseEnvFile(path.join(ROOT, '.env'));
    console.log(`\n✔ Todo listo. Abre ${FRONTEND_URL}`);
    console.log(`  Administrador:  ${adminEnv.ADMIN_EMAIL}   (contraseña en tu archivo .env, variable ADMIN_PASSWORD)`);
    console.log('  Para detener todo: presiona Ctrl+C en esta ventana.\n');
    openBrowser();
  } else {
    console.error('\n✖ El frontend no respondió a tiempo. Revisa los mensajes de arriba.');
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
main().catch((error) => fail(String(error)));
