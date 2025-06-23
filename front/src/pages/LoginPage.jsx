import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard.jsx';
import CustomInput from '../components/CustomInput.jsx';
import CustomButton from '../components/CustomButton.jsx';
import AuthCardError from '../components/auth/AuthCardError.jsx';
import { FaUser, FaLock } from 'react-icons/fa';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!credentials.username || !credentials.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(credentials.username, credentials.password, remember);
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <AuthCard title='Iniciar sesión' description='Bienvenido a Australiapp.'>
      {error && <AuthCardError>{error}</AuthCardError>}
      <form onSubmit={handleSubmit} noValidate>
        <CustomInput
          name='username'
          id='username'
          value={credentials.username}
          onChange={handleChange}
          placeholder='Nombre de usuario'
          icon={<FaUser />}
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
          placeholder='******'
          icon={<FaLock />}
          required
        >
          Contraseña
        </CustomInput>
        <label className='flex items-center gap-2 mb-4'>
          <md-checkbox
            checked={remember}
            onChange={handleRememberChange}
          ></md-checkbox>
          <span>Recuérdame</span>
        </label>
        <p className='text-sm text-gray-600 mb-4'>
          ¿No tienes cuenta?{' '}
          <button
            type='button'
            onClick={onSwitch}
            className='text-[#2196f3] hover:underline bg-transparent border-none cursor-pointer'
          >
            Regístrate
          </button>
        </p>
        <CustomButton type='submit' isPrimary>
          Iniciar sesión
        </CustomButton>
      </form>
    </AuthCard>
  );
}