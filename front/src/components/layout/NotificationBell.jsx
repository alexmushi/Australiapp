import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuBell, LuCircleAlert, LuInfo, LuTriangleAlert } from 'react-icons/lu';
import useNotifications from '../../hooks/useNotifications.js';

const TONE = {
  critical: { Icon: LuCircleAlert, cls: 'text-bad bg-bad-soft' },
  warning: { Icon: LuTriangleAlert, cls: 'text-warn bg-warn-soft' },
  info: { Icon: LuInfo, cls: 'text-primary bg-primary-soft' },
};

/** Campana de notificaciones del mes (ingreso faltante, 80%, excedido, etc.). */
export default function NotificationBell({ currency, onNavigate, refreshKey }) {
  const { notifications, unread, markAllRead, reload } = useNotifications(currency);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelId = useId();

  // Se recalculan al cambiar de pantalla (p. ej. tras registrar un gasto).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    reload();
  }, [refreshKey, reload]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unread) markAllRead();
  };

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
        className='relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 hover:bg-surface-2'
      >
        <LuBell aria-hidden className='text-lg' />
        {unread > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-bad px-1 text-[11px] font-semibold text-white'>
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          className='absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-2 shadow-lg'
        >
          <p className='px-2 pt-1 pb-2 text-sm font-semibold text-ink'>Notificaciones</p>
          {notifications.length === 0 ? (
            <p className='px-2 pb-3 text-sm text-muted'>Todo en orden. No hay avisos este mes.</p>
          ) : (
            <ul className='flex flex-col gap-1'>
              {notifications.map((n) => {
                const { Icon, cls } = TONE[n.severity] ?? TONE.info;
                return (
                  <li key={n.id}>
                    <button
                      type='button'
                      onClick={() => {
                        setOpen(false);
                        if (n.action) onNavigate(n.action);
                      }}
                      className='flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-surface-2'
                    >
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}>
                        <Icon aria-hidden />
                      </span>
                      <span className='min-w-0'>
                        <span className='block text-sm font-medium text-ink'>{n.title}</span>
                        <span className='block text-xs text-muted'>{n.message}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  currency: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  refreshKey: PropTypes.any,
};
