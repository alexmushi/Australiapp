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
      className="
        flex justify-center items-center w-full min-h-screen
        p-4 bg-background relative overflow-hidden
      "
    >
      <div
        className="
          w-full max-w-lg
          rounded-lg overflow-hidden shadow-lg relative z-10 bg-surface
        "
      >
        <div className="flex flex-col w-full h-full p-6 sm:p-8 md:p-10">
          {showBackButton && (
            <div className="mb-4">
              <BackButton onClick={onBack} className="cursor-pointer" />
            </div>
          )}
          <h1
            className="
              text-2xl sm:text-3xl font-semibold
              text-on-surface mb-2 font-serif
            "
          >
            {title}
          </h1>
          <p className="mb-4 text-on-surface/70 text-sm sm:text-base">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
