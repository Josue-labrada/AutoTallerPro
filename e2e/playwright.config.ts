import { defineConfig, devices } from '@playwright/test';

// Las credenciales del administrador se leen del .env de la raiz (no se escriben en el codigo).
try {
  process.loadEnvFile('../.env');
} catch {
  // Si no existe el archivo, se usan las variables ya definidas en la terminal.
}

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  // Un solo trabajador: las pruebas comparten la base de datos y el limite de 10 intentos por minuto.
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on', // una captura por prueba: sirve como evidencia
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      // Sesion del administrador, iniciada una sola vez en global-setup.ts.
      use: { ...devices['Desktop Chrome'], storageState: '.auth/admin.json' },
    },
  ],
});
