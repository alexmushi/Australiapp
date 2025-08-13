import PropTypes from 'prop-types';
import CustomButton from './CustomButton.jsx';

export default function StatusModal({ status, onClose }) {
  if (!status) return null;

  const isLoading = status === 'loading';
  let message = 'Registrando gasto..';
  if (status === 'success') message = 'Gasto registrado';
  if (status === 'error') message = 'No se pudo registrar el gasto';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[var(--md-sys-color-surface)] text-center p-6 rounded shadow-lg">
        {isLoading && <div className="spinner mx-auto mb-4"></div>}
        <p
          className={`mb-4 ${
            status === 'success'
              ? 'text-green-500'
              : status === 'error'
                ? 'text-red-500'
                : ''
          }`}
        >
          {message}
        </p>
        {!isLoading && (
          <CustomButton isPrimary onClick={onClose}>
            Aceptar
          </CustomButton>
        )}
      </div>
    </div>
  );
}

StatusModal.propTypes = {
  status: PropTypes.oneOf([null, 'loading', 'success', 'error']),
  onClose: PropTypes.func,
};

