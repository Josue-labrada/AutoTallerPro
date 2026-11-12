import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import styles from './MaintenanceForm.module.css';

interface MaintenanceFormProps {
  vehicles: readonly Vehicle[];
  /** Debe lanzar un Error con mensaje legible si falla. */
  onSubmit: (vehicle: Vehicle, name: string, lastServiceKm: string, intervalKm: string) => Promise<void>;
}

export function MaintenanceForm({ vehicles, onSubmit }: MaintenanceFormProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [name, setName] = useState('');
  const [lastServiceKm, setLastServiceKm] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      setError('Selecciona un vehículo.');
      return;
    }
    try {
      await onSubmit(vehicle, name, lastServiceKm, intervalKm);
      setName('');
      setLastServiceKm('');
      setIntervalKm('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el mantenimiento.');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="mnt-vehicle">Vehículo</label>
        <select id="mnt-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Selecciona un vehículo…</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate} · {vehicle.brand} {vehicle.model}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="mnt-name">Mantenimiento</label>
        <input id="mnt-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="mnt-last">Km del último servicio</label>
        <input
          id="mnt-last"
          inputMode="numeric"
          value={lastServiceKm}
          onChange={(e) => setLastServiceKm(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="mnt-interval">Se repite cada (km)</label>
        <input
          id="mnt-interval"
          inputMode="numeric"
          value={intervalKm}
          onChange={(e) => setIntervalKm(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submit}>
        <Plus size={16} aria-hidden="true" />
        Agregar
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
