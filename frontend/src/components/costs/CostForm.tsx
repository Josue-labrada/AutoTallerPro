import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { COST_KIND_LABELS, type CostKind } from '../../types/cost';
import styles from './CostForm.module.css';

interface CostFormProps {
  /** Debe lanzar un Error con mensaje legible si falla. */
  onSubmit: (kind: CostKind, description: string, quantity: string, price: string) => Promise<void>;
}

export function CostForm({ onSubmit }: CostFormProps) {
  const [kind, setKind] = useState<CostKind>('SERVICIO');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit(kind, description, quantity, price);
      setDescription('');
      setQuantity('1');
      setPrice('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el concepto.');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="cost-kind">Tipo</label>
        <select id="cost-kind" value={kind} onChange={(e) => setKind(e.target.value as CostKind)}>
          {(Object.keys(COST_KIND_LABELS) as CostKind[]).map((value) => (
            <option key={value} value={value}>
              {COST_KIND_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="cost-description">Descripción</label>
        <input
          id="cost-description"
          value={description}
          maxLength={100}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="cost-quantity">Cantidad</label>
        <input
          id="cost-quantity"
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="cost-price">Precio unitario (MXN)</label>
        <input
          id="cost-price"
          inputMode="decimal"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
