import PropTypes from 'prop-types';
import BackButton from '../BackButton.jsx';
import Logo from '../ui/Logo.jsx';

/**
 * Tarjeta centrada para las pantallas de autenticación.
 */
export default function AuthCard({
  title = 'Título',
  description = 'Descripción',
  showBackButton = false,
  onBack = () => {},
  children,
}) {
  return (
    <main className='flex min-h-dvh w-full items-center justify-center bg-bg px-4 py-10'>
      <div className='w-full max-w-sm'>
        <div className='mb-8 flex justify-center'>
          <Logo />
        </div>
        <div className='rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8'>
          {showBackButton && (
            <div className='mb-4'>
              <BackButton onClick={onBack} />
            </div>
          )}
          <h1 className='text-xl font-semibold tracking-tight text-ink'>{title}</h1>
          <p className='mt-1 mb-6 text-sm text-muted'>{description}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

AuthCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  children: PropTypes.node,
};
