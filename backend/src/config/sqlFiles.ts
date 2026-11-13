import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export const MIGRATIONS_DIR = path.join(REPO_ROOT, 'database', 'migrations');
export const SEEDS_DIR = path.join(REPO_ROOT, 'database', 'seeds');

/** Archivos .sql de una carpeta, en orden alfabético (001_, 002_, …). */
export async function readSqlFiles(dir: string): Promise<{ name: string; sql: string }[]> {
  const names = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
  return Promise.all(names.map(async (name) => ({ name, sql: await readFile(path.join(dir, name), 'utf8') })));
}
