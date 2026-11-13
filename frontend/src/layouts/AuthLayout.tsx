import { Link, Outlet } from 'react-router';
import { Wrench } from 'lucide-react';
import styles from './AuthLayout.module.css';

/** Estructura sencilla de las pantallas de inicio de sesión y registro (sin menú lateral). */
export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.box}>
        <p className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            <Wrench size={18} strokeWidth={2.25} />
          </span>
          AutoTaller <span className={styles.accent}>Pro</span>
        </p>
        <Outlet />
        <p className={styles.public}>
          Sin cuenta puedes <Link to="/portal/seguimiento">consultar tu orden con el código</Link> o usar la{' '}
          <Link to="/portal/combustible">calculadora de combustible</Link>.
        </p>
      </main>
    </div>
  );
}
