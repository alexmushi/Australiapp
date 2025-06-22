import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { addReviewer } from '../services/api.js';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';

export default function ReviewerForm() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!username) {
      setError('Ingresa un nombre de usuario');
      return;
    }
    try {
      await addReviewer({ user_id: user.id, reviewer_username: username });
      setMessage('Revisor agregado');
      setUsername('');
    } catch (err) {
      console.error(err);
      setError('No se pudo agregar revisor');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className='text-red-500 mb-2'>{error}</p>}
      {message && <p className='text-green-500 mb-2'>{message}</p>}
      <CustomInput
        name='reviewer'
        id='reviewer'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder='Usuario revisor'
        required
      >
        Revisor
      </CustomInput>
      <CustomButton type='submit' isPrimary>
        Agregar revisor
      </CustomButton>
    </form>
  );
}