import type { Ref } from 'react';
import { Link, useLocation } from 'react-router';
import { CalendarDays, LogOut, Menu, UserRound } from 'lucide-react';
import { findNavItem, getSectionLabel } from '../../app/navigation';
import { useAuth } from '../../app/useAuth';
import { ROLE_LABELS } from '../../types/auth';
import { formatLongDate } from '../../utils/formatters';
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
  const { user, logout } = useAuth();

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
        {user ? (
          <>
            <span className={styles.user}>
              <span className={styles.avatar} aria-hidden="true">
                <UserRound size={16} />
              </span>
              <span className={styles.userText}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>{ROLE_LABELS[user.role]}</span>
              </span>
            </span>
            <button type="button" className={styles.action} onClick={() => void logout()}>
              <LogOut size={16} aria-hidden="true" />
              Cerrar sesión
            </button>
          </>
        ) : (
          <span className={styles.guest}>
            <Link to="/iniciar-sesion" className={styles.action}>
              Iniciar sesión
            </Link>
            <Link to="/registro" className={styles.action}>
              Crear cuenta
            </Link>
          </span>
        )}
      </div>
    </header>
  );
}
