import { Car } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatNumber } from '../../utils/formatters';
import { StatusMessage } from '../ui/StatusMessage';
import styles from './VehicleTable.module.css';

interface VehicleTableProps {
  vehicles: readonly Vehicle[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  if (vehicles.length === 0) {
    return (
      <StatusMessage icon={<Car size={22} />} title="Aún no hay vehículos">
        Registra el primero con el formulario.
      </StatusMessage>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Placa</th>
            <th scope="col">Vehículo</th>
            <th scope="col">Año</th>
            <th scope="col">Kilometraje</th>
            <th scope="col">Recepción</th>
            <th scope="col">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td className={styles.plate}>{vehicle.plate}</td>
              <td>
                {vehicle.brand} {vehicle.model}
              </td>
              <td>{vehicle.year}</td>
              <td>{formatNumber(vehicle.mileage)} km</td>
              <td>{vehicle.receptionDate}</td>
              <td className={styles.notes}>{vehicle.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
