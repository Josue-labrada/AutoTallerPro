import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { useAuth } from '../app/useAuth';
import { Card } from '../components/ui/Card';
import { homePathFor } from '../types/auth';
import styles from './AuthForm.module.css';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Si ya hay sesión (por ejemplo, al volver atrás), no tiene caso ver el formulario.
  if (user) return <Navigate to={from ?? homePathFor(user.role)} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSending(true);
    try {
      const loggedIn = await login(email, password);
      void navigate(from ?? homePathFor(loggedIn.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      setIsSending(false);
    }
  }

  return (
    <Card title="Iniciar sesión" description="Personal del taller y clientes con cuenta.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={isSending}>
          <LogIn size={16} aria-hidden="true" />
          {isSending ? 'Entrando…' : 'Entrar'}
        </button>
        <p className={styles.switch}>
          ¿Dejaste tu coche en el taller? <Link to="/registro">Crea tu cuenta</Link>
        </p>
      </form>
    </Card>
  );
}
