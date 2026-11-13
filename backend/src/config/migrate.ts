import { pool } from './db.js';
import { MIGRATIONS_DIR, readSqlFiles } from './sqlFiles.js';

/**
 * Aplica las migraciones de database/migrations que aún no se han ejecutado.
 * Cada una corre en una transacción: o se aplica completa o no se aplica.
 * Uso: npm run migrate
 */
async function migrate(): Promise<void> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name       TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`,
  );
  const applied = new Set(
    (await pool.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((row) => row.name),
  );

  for (const { name, sql } of await readSqlFiles(MIGRATIONS_DIR)) {
    if (applied.has(name)) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`Migración aplicada: ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  console.log('Base de datos al día.');
}

migrate()
  .catch((error: unknown) => {
    console.error('Error al migrar la base de datos:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
