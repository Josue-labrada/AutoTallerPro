/** Configuracion de Vitest */
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    env: loadEnv('', '..', ''),
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/modules/**', 'src/middleware/**', 'src/shared/**'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});