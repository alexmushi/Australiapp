import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuChevronDown, LuLogOut, LuUsers } from 'react-icons/lu';
import CustomSelect from '../CustomSelect.jsx';
import useCurrencies from '../../hooks/useCurrencies.js';
import { useToast } from '../ui/Toast.jsx';

export default function UserMenu({ username, currency, onCurrencyChange, onLogout, isReviewer = false, onManageReviewers }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { currencies } = useCurrencies();
  const notify = useToast();
  const ref = useRef(null);
  const menuId = useId();
  const initial = (username || '?').charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCurrency = async (e) => {
    const code = e.target.value;
    if (code === currency) return;
    setSaving(true);
    try {
      await onCurrencyChange(code);
      notify(`Los montos ahora se muestran en ${code}.`);
    } catch (err) {
      console.error(err);
      notify('No se pudo cambiar la divisa.', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const options = currencies.includes(currency) ? currencies : [currency, ...currencies];

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label='Menú de usuario'
        className='flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 text-sm hover:bg-surface-2'
      >
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary'>
          {initial}
        </span>
        <span className='font-medium text-ink'>{currency}</span>
        <LuChevronDown aria-hidden className='text-muted' />
      </button>
      {open && (
        <div
          id={menuId}
          className='absolute right-0 z-50 mt-2 w-72 rounded-xl border border-line bg-surface p-4 shadow-lg'
        >
          {username && (
            <div className='mb-4'>
              <p className='text-xs text-muted'>Sesión iniciada como</p>
              <p className='truncate font-semibold text-ink'>{username}</p>
              {isReviewer && (
                <span className='mt-1 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2'>
                  Revisor · solo lectura
                </span>
              )}
            </div>
          )}
          <CustomSelect
            id='display-currency'
            value={currency}
            onChange={handleCurrency}
            options={options}
            disabled={saving}
            hint='Los reportes se convierten a esta divisa.'
          >
            Divisa de visualización
          </CustomSelect>
          <div className='my-4 h-px bg-line' />
          {onManageReviewers && (
            <button
              type='button'
              onClick={() => {
                setOpen(false);
                onManageReviewers();
              }}
              className='mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
            >
              <LuUsers aria-hidden />
              Revisores
            </button>
          )}
          <button
            type='button'
            onClick={onLogout}
            className='flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-bad hover:bg-bad-soft'
          >
            <LuLogOut aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

UserMenu.propTypes = {
  username: PropTypes.string,
  currency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  isReviewer: PropTypes.bool,
  onManageReviewers: PropTypes.func,
};
