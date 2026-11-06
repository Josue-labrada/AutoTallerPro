import { ArrowLeft, CircleAlert } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '../components/ui/Card';
import { StatusMessage } from '../components/ui/StatusMessage';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <Card>
      <h1 className="visually-hidden">Página no encontrada</h1>
      <StatusMessage icon={<CircleAlert size={22} />} title="No encontramos esta página">
        <p>La dirección que buscas no existe o fue movida.</p>
        <Link to="/" className={styles.link}>
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al panel principal
        </Link>
      </StatusMessage>
    </Card>
  );
}
