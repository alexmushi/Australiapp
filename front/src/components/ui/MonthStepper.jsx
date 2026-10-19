import PropTypes from 'prop-types';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { monthLabel, shiftMonth } from '../../utils/date.js';

export default function MonthStepper({ value, onChange, label = 'Mes' }) {
  return (
    <div role='group' aria-label={label} className='flex h-10 items-center rounded-lg border border-line-strong bg-surface'>
      <button
        type='button'
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label='Mes anterior'
        className='flex h-full w-10 items-center justify-center rounded-l-lg text-ink-2 hover:bg-surface-2'
      >
        <LuChevronLeft aria-hidden />
      </button>
      <span className='min-w-36 flex-1 px-2 text-center text-sm font-medium capitalize text-ink' aria-live='polite'>
        {monthLabel(value)}
      </span>
      <button
        type='button'
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label='Mes siguiente'
        className='flex h-full w-10 items-center justify-center rounded-r-lg text-ink-2 hover:bg-surface-2'
      >
        <LuChevronRight aria-hidden />
      </button>
    </div>
  );
}

MonthStepper.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};
