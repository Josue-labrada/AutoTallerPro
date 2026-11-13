import { env } from '../config/env.js';
import { ensureBucket } from '../config/storage.js';
import { app } from './app.js';

app.listen(env.port, '127.0.0.1', () => {
  console.log(`API de AutoTaller Pro escuchando en http://localhost:${env.port}`);
});

// El bucket de fotos se prepara en segundo plano: la API arranca aunque MinIO tarde un poco.
ensureBucket().catch((error: unknown) => {
  console.error('No se pudo preparar el almacenamiento de fotos (MinIO). Revisa que Docker esté encendido:', error);
});
