import { describe, expect, it } from 'vitest';
import { loginAsAdmin } from './helpers.js';

describe('Integración: autenticación del administrador', () => {
  it('permite iniciar sesión y consultar /api/auth/me', async () => {
    const agent = await loginAsAdmin();

    const response = await agent.get('/api/auth/me');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      role: 'ADMIN',
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.email).toBeDefined();
  });
});
