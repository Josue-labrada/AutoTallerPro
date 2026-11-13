import { Client } from 'minio';
import type { Readable } from 'node:stream';
import { env } from './env.js';

/** Único punto de contacto con MinIO. El resto del sistema solo usa estas funciones. */
const client = new Client({
  endPoint: env.minio.endPoint,
  port: env.minio.port,
  useSSL: false,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey,
});

const bucket = env.minio.bucket;

/** Crea el bucket (privado por defecto) si no existe. Reintenta mientras MinIO termina de arrancar. */
export async function ensureBucket(attempts = 15): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      if (!(await client.bucketExists(bucket))) await client.makeBucket(bucket);
      return;
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export async function saveObject(key: string, data: Buffer, contentType: string): Promise<void> {
  await client.putObject(bucket, key, data, data.length, { 'Content-Type': contentType });
}

export function readObject(key: string): Promise<Readable> {
  return client.getObject(bucket, key);
}

export async function deleteObject(key: string): Promise<void> {
  await client.removeObject(bucket, key);
}
