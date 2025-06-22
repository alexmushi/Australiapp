import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard.jsx';
import CustomInput from '../components/CustomInput.jsx';
import CustomButton from '../components/CustomButton.jsx';
import AuthCardError from '../components/auth/AuthCardError.jsx';
import { FaUser, FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!credentials.username || !credentials.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(credentials.username, credentials.password);
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
        <p className='text-sm text-gray-600 mb-4'>
          ¿No tienes cuenta?{' '}
          <Link to='/register' className='text-[#2196f3] hover:underline'>
            Regístrate
          </Link>
        </p>
        <CustomButton type='submit' isPrimary>
          Iniciar sesión
        </CustomButton>
      </form>
    </AuthCard>
  );
}
