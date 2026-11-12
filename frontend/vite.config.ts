import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Solo escucha en localhost por defecto; usar `--host` de forma explícita para exponerlo en la red local.
    host: 'localhost',
    port: 5173,
  },
  build: {
    sourcemap: false,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
