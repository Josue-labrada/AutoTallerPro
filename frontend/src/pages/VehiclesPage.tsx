import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DemoDataNotice } from '../components/ui/DemoDataNotice';
import { PageHeader } from '../components/ui/PageHeader';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { VehicleTable } from '../components/vehicles/VehicleTable';
import { createVehicle, listVehicles } from '../services/vehicleService';
import type { Vehicle, VehicleFormValues } from '../types/vehicle';

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listVehicles().then(setVehicles);
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
      <DemoDataNotice />
      <Card title="Nuevo vehículo">
        <VehicleForm onSubmit={handleCreate} />
      </Card>
      <Card title={`Vehículos registrados (${vehicles.length})`} className="stack-gap">
        <VehicleTable vehicles={vehicles} />
      </Card>
    </>
  );
}
