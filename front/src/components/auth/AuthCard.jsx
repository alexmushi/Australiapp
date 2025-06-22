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
        p-4 bg-[#121212] relative overflow-hidden
      '
    >
      <div
        className='
          w-full max-w-lg
          rounded-lg overflow-hidden shadow-lg relative z-10 bg-[#1e1e1e]
        '
      >
        <div className='flex flex-col w-full h-full p-6 sm:p-8 md:p-10'>
          {showBackButton && (
            <div className='mb-4'>
              <BackButton onClick={onBack} className='cursor-pointer' />
            </div>
          )}
          <h1
            className='
              text-2xl sm:text-3xl font-semibold
              text-gray-100 mb-2 font-serif
            '
          >
            {title}
          </h1>
          <p className='mb-4 text-gray-300 text-sm sm:text-base'>{description}</p>
          {children}
        </div>
      </div>

      {/* Figuras decorativas en el fondo general */}
      <div
        className='
          absolute z-0 top-0 left-0 w-96 h-96
          rounded-full bg-[#2196f3] opacity-10
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