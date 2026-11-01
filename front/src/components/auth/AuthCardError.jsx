import PropTypes from 'prop-types';
import Alert from '../ui/Alert.jsx';

export default function AuthCardError({ children }) {
  return <Alert className='mb-5'>{children}</Alert>;
}

AuthCardError.propTypes = { children: PropTypes.node };
