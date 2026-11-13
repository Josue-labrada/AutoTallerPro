import { pool } from './db.js';
import { readSqlFiles, SEEDS_DIR } from './sqlFiles.js';

/** Carga datos FICTICIOS de desarrollo (se puede repetir sin duplicar). Uso: npm run seed */
async function seed(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('No se cargan datos de ejemplo en producción.');
  }
  for (const { name, sql } of await readSqlFiles(SEEDS_DIR)) {
    await pool.query(sql);
    console.log(`Datos de ejemplo cargados: ${name}`);
  }
}

seed()
  .catch((error: unknown) => {
    console.error('Error al cargar datos de ejemplo:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
