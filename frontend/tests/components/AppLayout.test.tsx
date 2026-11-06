import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '../../src/app/navigation';
import { renderAppAt } from '../renderWithRouter';

describe('AppLayout y navegación', () => {
  it('muestra un enlace por cada módulo en la navegación principal', () => {
    renderAppAt('/');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    for (const item of NAV_ITEMS) {
      expect(within(nav).getByRole('link', { name: new RegExp(item.label) })).toBeInTheDocument();
    }
  });

  it('marca como activa la ruta actual', () => {
    renderAppAt('/');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(within(nav).getByRole('link', { name: /Panel principal/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('incluye un enlace para saltar al contenido principal', () => {
    renderAppAt('/');
    expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveAttribute(
      'href',
      '#contenido-principal',
    );
  });

  it('navega a un módulo futuro y muestra "Próximamente"', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    await user.click(screen.getByRole('link', { name: /Tablero de órdenes/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'Tablero de órdenes' })).toBeInTheDocument();
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
  });

  it('abre y cierra el menú lateral con el botón y la tecla Escape', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    const menuButton = screen.getByRole('button', { name: 'Abrir menú de navegación' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Cerrar menú de navegación' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
  });

  it('muestra una página 404 para rutas desconocidas', () => {
    renderAppAt('/ruta-inexistente');
    expect(screen.getByText('No encontramos esta página')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al panel principal/ })).toHaveAttribute('href', '/');
  });
});
