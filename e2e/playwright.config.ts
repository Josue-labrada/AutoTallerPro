import { defineConfig, devices } from '@playwright/test';

// Carga el .env de la raíz (ADMIN_EMAIL y ADMIN_PASSWORD) sin escribir credenciales en el código.
try {
  process.loadEnvFile('../.env');
} catch {
  // Si no existe, las variables deben venir de la terminal.
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on', // una captura por prueba: sirve como evidencia
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: '.auth/admin.json' },
    },
  ],
});
