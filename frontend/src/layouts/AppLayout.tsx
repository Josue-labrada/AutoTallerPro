import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import styles from './AppLayout.module.css';

const MAIN_CONTENT_ID = 'contenido-principal';
/** Debe coincidir con el punto de quiebre de Sidebar.module.css. */
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

/** Estructura común: enlace de salto, sidebar, encabezado y área de contenido. */
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const closeSidebarAndRestoreFocus = useCallback(() => {
    setIsSidebarOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Con el menú móvil abierto: cerrar con Escape o al pasar a vista de escritorio.
  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebarAndRestoreFocus();
    };
    const desktopQuery = window.matchMedia?.(DESKTOP_MEDIA_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeSidebar();
    };

    document.addEventListener('keydown', handleKeyDown);
    desktopQuery?.addEventListener('change', handleViewportChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      desktopQuery?.removeEventListener('change', handleViewportChange);
    };
  }, [isSidebarOpen, closeSidebar, closeSidebarAndRestoreFocus]);

  return (
    <div className={styles.layout}>
      <a href={`#${MAIN_CONTENT_ID}`} className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebarAndRestoreFocus}
        onNavigate={closeSidebar}
      />

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebarAndRestoreFocus} aria-hidden="true" />
      )}

      {/* Mientras el menú móvil está abierto, el resto de la página no es interactivo. */}
      <div className={styles.main} inert={isSidebarOpen}>
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          menuButtonRef={menuButtonRef}
        />
        <main id={MAIN_CONTENT_ID} className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
