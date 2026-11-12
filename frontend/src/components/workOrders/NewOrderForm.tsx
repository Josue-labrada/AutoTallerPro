import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import styles from './NewOrderForm.module.css';

interface NewOrderFormProps {
  vehicles: readonly Vehicle[];
  /** Debe lanzar un Error con mensaje legible si falla. */
  onSubmit: (vehicle: Vehicle, description: string) => Promise<void>;
}

export function NewOrderForm({ vehicles, onSubmit }: NewOrderFormProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      setError('Selecciona un vehículo.');
      return;
    }

    try {
      await onSubmit(vehicle, description);
      setVehicleId('');
      setDescription('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la orden.');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="order-vehicle">Vehículo</label>
        <select id="order-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Selecciona un vehículo…</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate} · {vehicle.brand} {vehicle.model}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="order-description">Trabajo a realizar</label>
        <input
          id="order-description"
          value={description}
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submit}>
        <Plus size={16} aria-hidden="true" />
        Crear orden
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
