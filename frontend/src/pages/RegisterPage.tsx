import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../app/useAuth';
import { Card } from '../components/ui/Card';
import { homePathFor } from '../types/auth';
import styles from './AuthForm.module.css';

/** Registro de clientes. El personal del taller lo da de alta un administrador. */
export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim() === '') return setError('Escribe tu nombre.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Escribe un correo electrónico válido.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');

    setError('');
    setIsSending(true);
    try {
      const created = await register(name, email, password);
      void navigate(homePathFor(created.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
      setIsSending(false);
    }
  }

  return (
    <Card title="Crear cuenta de cliente" description="Para ver las alertas de mantenimiento de tu vehículo.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="register-name">Nombre</label>
          <input
            id="register-name"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className={styles.hint}>Mínimo 8 caracteres.</span>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={isSending}>
          <UserPlus size={16} aria-hidden="true" />
          {isSending ? 'Creando…' : 'Crear cuenta'}
        </button>
        <p className={styles.switch}>
          ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link>
        </p>
      </form>
    </Card>
  );
}
