import pg from 'pg';
import { env } from './env.js';

// Las columnas DATE se devuelven como texto "AAAA-MM-DD" (evita problemas de zona horaria).
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

export const pool = new pg.Pool({ connectionString: env.databaseUrl });
