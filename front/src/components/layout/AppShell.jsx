import PropTypes from 'prop-types';
import Logo from '../ui/Logo.jsx';

/**
 * Estructura de la app: barra lateral en escritorio y barra inferior en móvil.
 */
export default function AppShell({ items, current, onNavigate, title, subtitle, userMenu, children }) {
  return (
    <div className='min-h-dvh bg-bg md:pl-64'>
      <aside className='fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex'>
        <div className='flex h-16 items-center px-5'>
          <Logo />
        </div>
        <nav aria-label='Principal' className='flex flex-1 flex-col gap-1 px-3 py-2'>
          {items.map(({ key, label, icon: Icon }) => {
            const active = key === current;
            return (
              <button
                key={key}
                type='button'
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  active ? 'bg-primary-soft text-primary' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon aria-hidden className='text-lg' />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      <header className='sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70'>
        <div className='mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6'>
          <div className='md:hidden'>
            <Logo compact />
          </div>
          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-lg font-semibold tracking-tight text-ink'>{title}</h1>
            {subtitle && <p className='hidden truncate text-xs text-muted sm:block'>{subtitle}</p>}
          </div>
          {userMenu}
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-8 md:pb-12'>
        {children}
      </main>

      <nav
        aria-label='Principal móvil'
        className='fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden'
      >
        <div className='grid' style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ key, shortLabel, label, icon: Icon }) => {
            const active = key === current;
            return (
              <button
                key={key}
                type='button'
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  active ? 'text-primary' : 'text-muted'
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-primary-soft' : ''
                  }`}
                >
                  <Icon aria-hidden className='text-lg' />
                </span>
                {shortLabel ?? label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

AppShell.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      shortLabel: PropTypes.string,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  current: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  userMenu: PropTypes.node,
  children: PropTypes.node,
};
