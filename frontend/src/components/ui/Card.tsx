import { useId, type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Contenedor de superficie elevada. Si tiene título, se expone como región accesible. */
export function Card({ title, description, actions, children, className }: CardProps) {
  const titleId = useId();
  const classes = [styles.card, className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-labelledby={title ? titleId : undefined}>
      {title && (
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
