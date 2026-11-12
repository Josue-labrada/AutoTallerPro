import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { VehicleTable } from '../components/vehicles/VehicleTable';
import { createVehicle, listVehicles } from '../services/vehicleService';
import type { Vehicle, VehicleFormValues } from '../types/vehicle';

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    listVehicles()
      .then(setVehicles)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar los vehículos.'),
      );
  }, []);

  async function handleCreate(values: VehicleFormValues) {
    const vehicle = await createVehicle(values);
    setVehicles((current) => [vehicle, ...current]);
  }

  return (
    <>
      <PageHeader
        title="Registro de vehículos"
        description="Registra los vehículos que ingresan al taller."
      />
      {loadError && (
        <p role="alert" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          {loadError}
        </p>
      )}
      <Card title="Nuevo vehículo">
        <VehicleForm onSubmit={handleCreate} />
      </Card>
      <Card title={`Vehículos registrados (${vehicles.length})`} className="stack-gap">
        <VehicleTable vehicles={vehicles} />
      </Card>
    </>
  );
}
