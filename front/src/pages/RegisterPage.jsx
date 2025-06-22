import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard.jsx';
import CustomInput from '../components/CustomInput.jsx';
import CustomButton from '../components/CustomButton.jsx';
import AuthCardError from '../components/auth/AuthCardError.jsx';
import { FaUser, FaLock, FaMoneyBill } from 'react-icons/fa';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const { register } = useAuth();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password || !currency) {
      setError('Completa todos los campos.');
      return;
    }
    try {
      await register({ username, password, default_currency_code: currency });
    } catch (err) {
      console.error(err);
      setError('Registration failed');
    }
  };

  return (
    <AuthCard title='Registro' description='Crea tu cuenta para comenzar'>
      {error && <AuthCardError>{error}</AuthCardError>}
      <form onSubmit={handleSubmit} noValidate>
        <CustomInput
          name='username'
          id='reg-username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Nombre de usuario'
          icon={<FaUser />}
          required
        >
          Usuario
        </CustomInput>
        <CustomInput
          name='password'
          id='reg-password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='******'
          icon={<FaLock />}
          required
        >
          Contraseña
        </CustomInput>
        <CustomInput
          name='currency'
          id='reg-currency'
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder='USD'
          icon={<FaMoneyBill />}
          required
        >
          Moneda
        </CustomInput>
        <p className='text-sm text-gray-600 mb-4'>
          ¿Ya tienes cuenta?{' '}
          <Link to='/login' className='text-[#2196f3] hover:underline'>
            Inicia sesión
          </Link>
        </p>
        <CustomButton type='submit' isPrimary>
          Registrarse
        </CustomButton>
      </form>
    </AuthCard>
  );
}
