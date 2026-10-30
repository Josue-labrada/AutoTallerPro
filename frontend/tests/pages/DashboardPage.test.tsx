import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from '../../src/pages/DashboardPage';
import type { DashboardDataSource } from '../../src/services/dashboardService';
import { buildDemoDashboardData } from '../../src/services/mock/dashboard.mock';

function renderDashboard(dataSource: DashboardDataSource) {
  return render(
    <MemoryRouter>
      <DashboardPage dataSource={dataSource} />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('muestra el estado de carga y luego los indicadores', async () => {
    const source: DashboardDataSource = {
      getDashboardData: () => Promise.resolve(buildDemoDashboardData()),
    };
    renderDashboard(source);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando');

    const indicators = await screen.findByRole('region', { name: 'Indicadores principales' });
    expect(within(indicators).getByText('Vehículos registrados')).toBeInTheDocument();
    expect(within(indicators).getByText('128')).toBeInTheDocument();
    // 4 + 6 + 9 + 3 órdenes activas
    expect(within(indicators).getByText('22')).toBeInTheDocument();
  });

  it('muestra el aviso de datos de demostración', async () => {
    renderDashboard({ getDashboardData: () => Promise.resolve(buildDemoDashboardData()) });
    expect(await screen.findByRole('note', { name: 'Datos de demostración' })).toBeInTheDocument();
  });

  it('no muestra el aviso cuando los datos no son de demostración', async () => {
    const realLike = { ...buildDemoDashboardData(), isDemo: false };
    renderDashboard({ getDashboardData: () => Promise.resolve(realLike) });
    await screen.findByRole('region', { name: 'Indicadores principales' });
    expect(screen.queryByRole('note', { name: 'Datos de demostración' })).not.toBeInTheDocument();
  });

  it('muestra un mensaje genérico sin detalles internos si falla la carga', async () => {
    renderDashboard({
      getDashboardData: () => Promise.reject(new Error('detalle interno: conexión rechazada')),
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No fue posible cargar la información del panel.');
    expect(alert).not.toHaveTextContent('conexión rechazada');
  });

  it('muestra las cuatro etapas del flujo de órdenes', async () => {
    renderDashboard({ getDashboardData: () => Promise.resolve(buildDemoDashboardData()) });
    const flow = await screen.findByRole('region', { name: 'Flujo de órdenes' });
    for (const label of ['En Recepción', 'En Diagnóstico', 'En Reparación', 'Listo para Entrega']) {
      expect(within(flow).getByText(label)).toBeInTheDocument();
    }
  });
});
