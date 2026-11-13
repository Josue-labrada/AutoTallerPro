import { useEffect, useState, type FormEvent } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../app/useAuth';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { createStaffUser, deleteUser, listUsers } from '../services/userService';
import { ROLE_LABELS, type Role, type UserSummary } from '../types/auth';
import styles from './UsersPage.module.css';

type StaffRole = Extract<Role, 'WORKER' | 'ADMIN'>;

export function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('WORKER');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.'),
      );
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await createStaffUser(name, email, password, role);
      setUsers((current) => [...current, created]);
      setName('');
      setEmail('');
      setPassword('');
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
    }
  }

  async function handleDelete(target: UserSummary) {
    if (!window.confirm(`¿Eliminar la cuenta de ${target.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteUser(target.id);
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
    }
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Da de alta al personal del taller. Los clientes se registran solos desde el portal."
      />

      <Card title="Nueva cuenta del personal">
        <form className={styles.form} onSubmit={handleCreate} noValidate>
          <div className={styles.field}>
            <label htmlFor="user-name">Nombre</label>
            <input id="user-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="user-email">Correo electrónico</label>
            <input
              id="user-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="user-password">Contraseña inicial</label>
            <input
              id="user-password"
              type="password"
              autoComplete="new-password"
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="user-role">Rol</label>
            <select id="user-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
              <option value="WORKER">{ROLE_LABELS.WORKER}</option>
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
            </select>
          </div>
          <button type="submit" className={styles.submit}>
            <UserPlus size={16} aria-hidden="true" />
            Crear
          </button>
          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
        </form>
      </Card>

      {error && (
        <p role="alert" className={`${styles.error} stack-gap`}>
          {error}
        </p>
      )}

      <Card title={`Cuentas (${users.length})`} className="stack-gap">
        <ul className={styles.list}>
          {users.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.info}>
                <p className={styles.name}>
                  {item.name}
                  {item.id === me?.id && <span className={styles.you}> (tú)</span>}
                </p>
                <p className={styles.email}>{item.email}</p>
              </div>
              <Badge tone={item.role === 'ADMIN' ? 'accent' : item.role === 'WORKER' ? 'info' : 'neutral'}>
                {ROLE_LABELS[item.role]}
              </Badge>
              {item.id !== me?.id && (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => void handleDelete(item)}
                  aria-label={`Eliminar la cuenta de ${item.name}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
