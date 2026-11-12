import { cloneElement, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';
import { Plus } from 'lucide-react';
import type { VehicleFormErrors, VehicleFormValues } from '../../types/vehicle';
import { EMPTY_VEHICLE_FORM, todayIsoDate, validateVehicleForm } from '../../utils/vehicleValidation';
import styles from './VehicleForm.module.css';

interface VehicleFormProps {
  /** Debe lanzar un Error con mensaje legible si el registro falla. */
  onSubmit: (values: VehicleFormValues) => Promise<void>;
}

export function VehicleForm({ onSubmit }: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>(EMPTY_VEHICLE_FORM);
  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');

    const validationErrors = validateVehicleForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSubmit(values);
      setValues(EMPTY_VEHICLE_FORM);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo registrar el vehículo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field label="Placa" name="plate" error={errors.plate}>
        <input name="plate" value={values.plate} onChange={handleChange} maxLength={10} />
      </Field>
      <Field label="Marca" name="brand" error={errors.brand}>
        <input name="brand" value={values.brand} onChange={handleChange} maxLength={50} />
      </Field>
      <Field label="Modelo" name="model" error={errors.model}>
        <input name="model" value={values.model} onChange={handleChange} maxLength={50} />
      </Field>
      <Field label="Año" name="year" error={errors.year}>
        <input name="year" inputMode="numeric" value={values.year} onChange={handleChange} />
      </Field>
      <Field label="Kilometraje" name="mileage" error={errors.mileage}>
        <input name="mileage" inputMode="numeric" value={values.mileage} onChange={handleChange} />
      </Field>
      <Field label="Fecha de recepción" name="receptionDate" error={errors.receptionDate}>
        <input
          name="receptionDate"
          type="date"
          max={todayIsoDate()}
          value={values.receptionDate}
          onChange={handleChange}
        />
      </Field>
      <Field label="Observaciones (opcional)" name="notes" error={errors.notes} wide>
        <textarea name="notes" rows={3} value={values.notes} onChange={handleChange} maxLength={500} />
      </Field>

      {submitError && (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          <Plus size={16} aria-hidden="true" />
          {isSaving ? 'Guardando…' : 'Registrar vehículo'}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  error?: string | undefined;
  wide?: boolean;
  children: ReactElement<Record<string, unknown>>;
}

function Field({ label, name, error, wide, children }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className={wide ? `${styles.field} ${styles.wide}` : styles.field}>
      <label htmlFor={name}>{label}</label>
      {cloneElement(children, {
        id: name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
