import type { Ref } from 'react';
import { useLocation } from 'react-router';
import { CalendarDays, FlaskConical, Menu, UserRound } from 'lucide-react';
import { findNavItem, getSectionLabel } from '../../app/navigation';
import { formatLongDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { SIDEBAR_ID } from './Sidebar';
import styles from './Header.module.css';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  menuButtonRef?: Ref<HTMLButtonElement>;
}

export function Header({ isSidebarOpen, onToggleSidebar, menuButtonRef }: HeaderProps) {
  const { pathname } = useLocation();
  const currentItem = findNavItem(pathname);

  return (
    <header className={styles.header}>
      <button
        ref={menuButtonRef}
        type="button"
        className={styles.menuButton}
        onClick={onToggleSidebar}
        aria-controls={SIDEBAR_ID}
        aria-expanded={isSidebarOpen}
        aria-label="Abrir menú de navegación"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
        {currentItem ? (
          <ol>
            <li className={styles.crumbSection}>{getSectionLabel(currentItem.section)}</li>
            <li aria-current="page" className={styles.crumbCurrent}>
              {currentItem.label}
            </li>
          </ol>
        ) : (
          <ol>
            <li aria-current="page" className={styles.crumbCurrent}>
              Página no encontrada
            </li>
          </ol>
        )}
      </nav>

      <div className={styles.end}>
        <span className={styles.date}>
          <CalendarDays size={16} aria-hidden="true" />
          {formatLongDate(new Date())}
        </span>
        <Badge tone="warning" icon={<FlaskConical size={12} />}>
          Modo demostración
        </Badge>
        <span className={styles.user} title="Sesión simulada: aún no hay autenticación">
          <span className={styles.avatar} aria-hidden="true">
            <UserRound size={16} />
          </span>
          <span className={styles.userText}>
            <span className={styles.userName}>Usuario demo</span>
            <span className={styles.userRole}>Sin sesión real</span>
          </span>
        </span>
      </div>
    </header>
  );
}
