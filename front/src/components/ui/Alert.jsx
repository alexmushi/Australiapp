import PropTypes from 'prop-types';
import { LuCircleAlert, LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';

const TONES = {
  error: { cls: 'bg-bad-soft text-bad', Icon: LuCircleAlert, role: 'alert' },
  success: { cls: 'bg-good-soft text-good', Icon: LuCircleCheck, role: 'status' },
  warning: { cls: 'bg-warn-soft text-warn', Icon: LuTriangleAlert, role: 'status' },
};

export default function Alert({ tone = 'error', title, action, className = '', children }) {
  const { cls, Icon, role } = TONES[tone];
  return (
    <div role={role} className={`flex items-start gap-3 rounded-lg px-3.5 py-3 text-sm ${cls} ${className}`}>
      <Icon aria-hidden className='mt-0.5 shrink-0 text-base' />
      <div className='min-w-0 flex-1'>
        {title && <p className='font-semibold'>{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

Alert.propTypes = {
  tone: PropTypes.oneOf(['error', 'success', 'warning']),
  title: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};
