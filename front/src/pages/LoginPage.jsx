import { useState } from 'react';
import { LuUser, LuLock } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard.jsx';
import CustomInput from '../components/CustomInput.jsx';
import CustomButton from '../components/CustomButton.jsx';
import AuthCardError from '../components/auth/AuthCardError.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!credentials.username || !credentials.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      await login(credentials.username, credentials.password, remember);
    } catch (err) {
      console.error(err);
      setError(
        err?.status === 0
          ? 'No se pudo conectar con el servidor. Intenta de nuevo.'
          : 'Usuario o contraseña incorrectos.'
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title='Iniciar sesión' description='Bienvenido a Australiapp.'>
      {error && <AuthCardError>{error}</AuthCardError>}
      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
        <CustomInput
          name='username'
          id='username'
          value={credentials.username}
          onChange={handleChange}
          placeholder='Nombre de usuario'
          autoComplete='username'
          icon={<LuUser />}
          required
        >
          Usuario
        </CustomInput>
        <CustomInput
          name='password'
          id='password'
          type='password'
          value={credentials.password}
          onChange={handleChange}
          placeholder='••••••••'
          autoComplete='current-password'
          icon={<LuLock />}
          required
        >
          Contraseña
        </CustomInput>
        <label className='flex cursor-pointer items-center gap-2.5 text-sm text-ink-2'>
          <input
            type='checkbox'
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className='h-4 w-4 cursor-pointer rounded accent-[var(--app-primary)]'
          />
          Recuérdame en este dispositivo
        </label>
        <CustomButton type='submit' isPrimary size='lg' fullWidth loading={submitting} className='mt-2'>
          {submitting ? 'Entrando…' : 'Iniciar sesión'}
        </CustomButton>
      </form>
    </AuthCard>
  );
}
