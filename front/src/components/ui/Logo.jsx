import PropTypes from 'prop-types';

export default function Logo({ compact = false }) {
  return (
    <span className='inline-flex items-center gap-2.5'>
      <img src='/favicon.png' alt='' className='h-8 w-8 rounded-lg' />
      {!compact && <span className='text-base font-semibold tracking-tight text-ink'>Australiapp</span>}
    </span>
  );
}

Logo.propTypes = { compact: PropTypes.bool };
