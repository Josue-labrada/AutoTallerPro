import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Calculator } from 'lucide-react';
import type { FuelErrors, FuelInputs } from '../../utils/fuelCalculator';
import styles from './FuelCalculatorForm.module.css';

interface FuelCalculatorFormProps {
  /** Recibe las entradas y devuelve los errores de validación (vacío si todo está bien). */
  onCalculate: (inputs: FuelInputs) => FuelErrors;
}

const EMPTY_INPUTS: FuelInputs = { distanceKm: '', efficiencyKmPerLiter: '', pricePerLiter: '' };

export function FuelCalculatorForm({ onCalculate }: FuelCalculatorFormProps) {
  const [inputs, setInputs] = useState<FuelInputs>(EMPTY_INPUTS);
  const [errors, setErrors] = useState<FuelErrors>({});

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(onCalculate(inputs));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field
        id="distanceKm"
        label="Distancia del viaje (km)"
        value={inputs.distanceKm}
        error={errors.distanceKm}
        onChange={handleChange}
      />
      <Field
        id="efficiencyKmPerLiter"
        label="Rendimiento (km por litro)"
        value={inputs.efficiencyKmPerLiter}
        error={errors.efficiencyKmPerLiter}
        onChange={handleChange}
      />
      <Field
        id="pricePerLiter"
        label="Precio del litro (MXN)"
        value={inputs.pricePerLiter}
        error={errors.pricePerLiter}
        onChange={handleChange}
      />
      <button type="submit" className={styles.submit}>
        <Calculator size={16} aria-hidden="true" />
        Calcular
      </button>
    </form>
  );
}

interface FieldProps {
  id: keyof FuelInputs;
  label: string;
  value: string;
  error: string | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Field({ id, label, value, error, onChange }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        inputMode="decimal"
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
