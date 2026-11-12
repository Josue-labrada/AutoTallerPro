/** Lee la configuración desde variables de entorno (archivo .env, que NO se sube a Git). */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env`);
  return value;
}

export const env = {
  port: Number(process.env['PORT'] ?? 3000),
  databaseUrl: required('DATABASE_URL'),
};
