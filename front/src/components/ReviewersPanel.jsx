import { useRef, useState } from 'react';
import { LuEye, LuLock, LuTrash2, LuUser } from 'react-icons/lu';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import Card from './ui/Card.jsx';
import Alert from './ui/Alert.jsx';
import EmptyState from './ui/EmptyState.jsx';
import { useToast } from './ui/Toast.jsx';
import useApi from '../hooks/useApi.js';
import { addReviewer, fetchReviewers, removeReviewer } from '../services/api.js';

const EMPTY = [];
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,50}$/;
const MIN_PASSWORD = 8;

/** Cuentas de solo lectura para que otra persona vea tus finanzas. */
export default function ReviewersPanel() {
  const { data, error: loadError, loading, reload } = useApi(fetchReviewers, [], { initialData: EMPTY });
  const reviewers = data ?? EMPTY;
  const notify = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const submittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError(null);
    const found = {};
    if (!USERNAME_RE.test(username.trim())) found.username = 'De 3 a 50 letras, números, puntos o guiones.';
    if (password.length < MIN_PASSWORD) found.password = `Al menos ${MIN_PASSWORD} caracteres.`;
    setErrors(found);
    if (Object.keys(found).length) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const created = await addReviewer({ username: username.trim(), password });
      notify(`${created.username} ya puede entrar en modo lectura.`, { title: 'Revisor agregado' });
      setUsername('');
      setPassword('');
      reload();
    } catch (err) {
      console.error(err);
      setSubmitError(err?.serverMessage || err?.message || 'Error desconocido');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleDelete = async (r) => {
    try {
      await removeReviewer(r.id);
      notify(`${r.username} ya no tiene acceso.`, { title: 'Revisor eliminado' });
      setConfirmDelete(null);
      reload();
    } catch (err) {
      console.error(err);
      notify(err?.serverMessage || 'No se pudo eliminar el revisor.', { tone: 'error' });
    }
  };

  return (
    <div className='mx-auto flex max-w-2xl flex-col gap-5'>
      {loadError && <Alert title='No se pudieron cargar los revisores'>Revisa tu conexión y recarga la página.</Alert>}
      {submitError && <Alert title='No se pudo agregar el revisor'>{submitError}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Card
          title='Agregar revisor'
          subtitle='Un revisor puede ver tu resumen, gastos e ingresos, pero no puede cambiar nada.'
        >
          <div className='flex flex-col gap-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <CustomInput
                id='reviewer-username'
                name='reviewer-username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Ej. mama'
                autoComplete='off'
                maxLength={50}
                icon={<LuUser />}
                error={errors.username}
              >
                Usuario
              </CustomInput>
              <CustomInput
                id='reviewer-password'
                name='reviewer-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
                icon={<LuLock />}
                error={errors.password}
                hint={`Mínimo ${MIN_PASSWORD} caracteres. Compártela en persona.`}
              >
                Contraseña
              </CustomInput>
            </div>
            <div className='flex sm:justify-end'>
              <CustomButton type='submit' isPrimary loading={submitting} className='w-full sm:w-auto'>
                {submitting ? 'Creando…' : 'Crear revisor'}
              </CustomButton>
            </div>
          </div>
        </Card>
      </form>

      <Card title='Revisores' bodyClassName='px-2 pb-2 pt-1 sm:px-3 sm:pb-3'>
        {reviewers.length === 0 ? (
          <EmptyState icon={LuEye} title='Sin revisores'>
            {loading ? 'Cargando…' : 'Nadie más tiene acceso a tus finanzas.'}
          </EmptyState>
        ) : (
          <ul className='divide-y divide-line'>
            {reviewers.map((r) => (
              <li key={r.id} className='flex items-center justify-between gap-3 px-2 py-3 sm:px-3'>
                <span className='flex min-w-0 items-center gap-3'>
                  <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2'>
                    {r.username.charAt(0).toUpperCase()}
                  </span>
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium text-ink'>{r.username}</span>
                    <span className='block text-xs text-muted'>Solo lectura</span>
                  </span>
                </span>
                {confirmDelete === r.id ? (
                  <span className='flex items-center gap-1'>
                    <CustomButton variant='danger' size='sm' onClick={() => handleDelete(r)}>
                      Quitar acceso
                    </CustomButton>
                    <CustomButton variant='ghost' size='sm' onClick={() => setConfirmDelete(null)}>
                      Cancelar
                    </CustomButton>
                  </span>
                ) : (
                  <button
                    type='button'
                    onClick={() => setConfirmDelete(r.id)}
                    aria-label={`Quitar a ${r.username}`}
                    className='flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad'
                  >
                    <LuTrash2 aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
