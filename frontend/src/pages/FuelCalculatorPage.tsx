import { useState, type ReactNode } from 'react';
import { Fuel, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { FuelCalculatorForm } from '../components/fuel/FuelCalculatorForm';
import {
  calculateFuel,
  validateFuelInputs,
  type FuelErrors,
  type FuelEstimate,
  type FuelInputs,
} from '../utils/fuelCalculator';
import { formatNumber } from '../utils/formatters';
import styles from './FuelCalculatorPage.module.css';

const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function FuelCalculatorPage() {
  const [estimate, setEstimate] = useState<FuelEstimate | null>(null);

  function handleCalculate(inputs: FuelInputs): FuelErrors {
    const errors = validateFuelInputs(inputs);
    if (Object.keys(errors).length > 0) {
      setEstimate(null);
      return errors;
    }
    setEstimate(calculateFuel(inputs));
    return {};
  }

  return (
    <>
      <PageHeader
        title="Calculadora de combustible"
        description="Estima cuántos litros y cuánto dinero necesitas para un viaje."
      />
      <div className={styles.columns}>
        <Card title="Datos del viaje">
          <FuelCalculatorForm onCalculate={handleCalculate} />
        </Card>
        <Card title="Resultado" description="Es una estimación, el consumo real puede variar.">
          {estimate ? (
            <div className={styles.results} aria-live="polite">
              <ResultRow
                icon={<Fuel size={20} aria-hidden="true" />}
                label="Combustible estimado"
                value={`${formatNumber(Math.round(estimate.liters * 100) / 100)} L`}
              />
              <ResultRow
                icon={<Wallet size={20} aria-hidden="true" />}
                label="Costo estimado"
                value={currencyFormatter.format(estimate.totalCost)}
              />
            </div>
          ) : (
            <p className={styles.hint}>Completa los datos y presiona Calcular.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function ResultRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon}>{icon}</span>
      <div>
        <p className={styles.rowLabel}>{label}</p>
        <p className={styles.rowValue}>{value}</p>
      </div>
    </div>
  );
}
