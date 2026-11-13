import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { Wrench, X } from 'lucide-react';
import { NAV_ITEMS, NAV_SECTIONS, canAccess } from '../../app/navigation';
import { useAuth } from '../../app/useAuth';
import styles from './Sidebar.module.css';

export const SIDEBAR_ID = 'app-sidebar';

interface SidebarProps {
  /** Solo afecta a pantallas pequeñas; en escritorio el sidebar siempre es visible. */
  isOpen: boolean;
  /** Cierre explícito (botón cerrar). */
  onClose: () => void;
  /** Se invoca al elegir un enlace, para cerrar el menú móvil. */
  onNavigate: () => void;
}

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => canAccess(user, item));

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  return (
    <aside
      id={SIDEBAR_ID}
      className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
      aria-label="Barra lateral"
    >
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <Wrench size={18} strokeWidth={2.25} />
        </span>
        <span className={styles.brandText}>
          AutoTaller <span className={styles.brandAccent}>Pro</span>
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Cerrar menú de navegación"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Navegación principal">
        {NAV_SECTIONS.filter((section) =>
          visibleItems.some((item) => item.section === section.id),
        ).map((section) => (
          <div key={section.id} className={styles.section}>
            <p className={styles.sectionLabel} id={`nav-section-${section.id}`}>
              {section.label}
            </p>
            <ul aria-labelledby={`nav-section-${section.id}`}>
              {visibleItems.filter((item) => item.section === section.id).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                      }
                    >
                      <Icon size={18} aria-hidden="true" className={styles.linkIcon} />
                      <span className={styles.linkLabel}>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <p className={styles.footer}>Gestión de talleres mecánicos</p>
    </aside>
  );
}
