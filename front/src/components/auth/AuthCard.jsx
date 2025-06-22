import BackButton from '../BackButton';

/**
 * Componente de tarjeta de autenticación con elementos decorativos adaptables
 *
 * @param {object} props0 - Propiedades del componente
 * @param {string} props0.title - Título de la tarjeta
 * @param {string} props0.description - Descripción de la tarjeta
 * @param {boolean} props0.showBackButton - Indica si se debe mostrar el botón de regresar
 * @param {Function} props0.onBack - Función que se ejecuta al hacer click en el botón de regresar
 * @param {React.ReactNode} props0.children - Componentes hijos de la tarjeta
 * @returns {React.ReactNode} El contenido de la tarjeta de autenticación
 */
export default function AuthCard({
  title = 'Título',
  description = 'Descripción',
  showBackButton = false,
  onBack = () => {},
  children,
}) {
  return (
    <div
      className='
        flex justify-center items-center w-full min-h-screen
        p-4 bg-[#f5f2eb] relative overflow-hidden
      '
    >
      <div
        className='
          grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl
          rounded-lg overflow-hidden shadow-lg relative z-10
        '
      >
        <div className='flex flex-col w-full h-full bg-gray-100 p-6 sm:p-8 md:p-10'>
          {showBackButton && (
            <div className='mb-4'>
              <BackButton onClick={onBack} className='cursor-pointer' />
            </div>
          )}
          <h1
            className='
              text-2xl sm:text-3xl font-semibold
              text-gray-800 mb-2 font-serif
            '
          >
            {title}
          </h1>
          <p className='mb-4 text-gray-600 text-sm sm:text-base'>{description}</p>
          {children}
        </div>
        <div className='bg-[#1f1d1b] relative hidden lg:block min-h-[500px]'>
          {/* Figuras decorativas optimizadas para PC */}
          <div
            className='
              absolute w-80 h-80 bg-accent
              rounded-full -top-40 -right-40
            '
          />
          <div
            className='
              absolute w-40 h-40 bg-accent
              bottom-0 left-0 rounded-tr-3xl
            '
          />
        </div>
      </div>

      {/* Figuras decorativas en el fondo general */}
      <div
        className='
          absolute z-0 top-0 left-0 w-96 h-96
          rounded-full bg-accent opacity-10
          -translate-x-1/3 -translate-y-1/3
        '
      />
      <div
        className='
          absolute z-0 bottom-0 right-0 w-96 h-96
          rounded-full bg-black opacity-5
          translate-x-1/4 translate-y-1/4
        '
      />
    </div>
  );
}