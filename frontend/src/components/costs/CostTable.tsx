import { Trash2 } from 'lucide-react';
import { COST_KIND_LABELS, type CostItem } from '../../types/cost';
import { formatCents, lineSubtotalCents, sumCents } from '../../utils/money';
import styles from './CostTable.module.css';

interface CostTableProps {
  items: readonly CostItem[];
  onRemove: (id: string) => void;
}

export function CostTable({ items, onRemove }: CostTableProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>Esta orden aún no tiene servicios ni materiales.</p>;
  }

  const subtotals = items.map((item) => lineSubtotalCents(item.quantity, item.unitPriceCents));

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Tipo</th>
            <th scope="col">Descripción</th>
            <th scope="col" className={styles.number}>Cantidad</th>
            <th scope="col" className={styles.number}>Precio unitario</th>
            <th scope="col" className={styles.number}>Subtotal</th>
            <th scope="col"><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>{COST_KIND_LABELS[item.kind]}</td>
              <td className={styles.description}>{item.description}</td>
              <td className={styles.number}>{item.quantity}</td>
              <td className={styles.number}>{formatCents(item.unitPriceCents)}</td>
              <td className={styles.number}>{formatCents(subtotals[index] ?? 0)}</td>
              <td>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Quitar ${item.description}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={4} className={styles.number}>Total</th>
            <td className={`${styles.number} ${styles.total}`}>{formatCents(sumCents(subtotals))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
