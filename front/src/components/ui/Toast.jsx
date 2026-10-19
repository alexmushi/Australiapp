import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuCircleAlert, LuCircleCheck, LuX } from 'react-icons/lu';

const ToastContext = createContext(() => {});

let nextId = 1;

export function ToastProvider({ children, duration = 4000 }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message, { tone = 'success', title } = {}) => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-2), { id, message, tone, title }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss, duration]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live='polite'
        className='pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6'
      >
        {toasts.map((t) => {
          const Icon = t.tone === 'error' ? LuCircleAlert : LuCircleCheck;
          return (
            <div
              key={t.id}
              role='status'
              className='animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg'
            >
              <Icon
                aria-hidden
                className={`mt-0.5 shrink-0 text-base ${t.tone === 'error' ? 'text-bad' : 'text-good'}`}
              />
              <div className='min-w-0 flex-1'>
                {t.title && <p className='font-semibold text-ink'>{t.title}</p>}
                <p className='text-ink-2'>{t.message}</p>
              </div>
              <button
                type='button'
                onClick={() => dismiss(t.id)}
                aria-label='Cerrar notificación'
                className='-m-1 rounded p-1 text-muted hover:text-ink'
              >
                <LuX aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = { children: PropTypes.node, duration: PropTypes.number };

export function useToast() {
  return useContext(ToastContext);
}
