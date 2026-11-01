import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import Card from './ui/Card.jsx';
import Alert from './ui/Alert.jsx';
import { useToast } from './ui/Toast.jsx';
import { createCategory } from '../services/api.js';

/** Las categorías solo clasifican gastos; todas comparten el 50% para gastos. */
export default function CategoryForm({ onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState();
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const notify = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError(null);
    if (!name.trim()) {
      setError('Ingresa un nombre.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), description: description.trim() };
      await createCategory(payload);
      notify(`“${payload.name}” ya está disponible para registrar gastos.`, {
        title: 'Categoría creada',
      });
      setName('');
      setDescription('');
      setError(undefined);
      onCreated?.();
    } catch (err) {
      console.error(err);
      setSubmitError(err?.serverMessage || err?.message || 'Error desconocido');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      {submitError && <Alert title='No se pudo crear la categoría'>{submitError}</Alert>}

      <Card
        title='Nueva categoría'
        subtitle='Sirve para clasificar tus gastos. Todas salen del mismo 50% para gastos.'
      >
        <div className='flex flex-col gap-4'>
          <CustomInput
            name='name'
            id='name'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            placeholder='Ej. Restaurantes'
            maxLength={50}
            error={error}
            required
          >
            Nombre
          </CustomInput>
          <CustomInput
            name='description'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Descripción opcional'
            maxLength={255}
          >
            Descripción (opcional)
          </CustomInput>
        </div>
      </Card>

      <div className='flex sm:justify-end'>
        <CustomButton
          type='submit'
          isPrimary
          size='lg'
          loading={submitting}
          className='w-full sm:w-auto sm:min-w-44'
        >
          {submitting ? 'Guardando…' : 'Crear categoría'}
        </CustomButton>
      </div>
    </form>
  );
}

CategoryForm.propTypes = { onCreated: PropTypes.func };
