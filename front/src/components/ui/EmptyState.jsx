import PropTypes from 'prop-types';
import { LuInbox } from 'react-icons/lu';

export default function EmptyState({ icon: Icon = LuInbox, title, children, action }) {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
      <span className='mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted'>
        <Icon aria-hidden className='text-xl' />
      </span>
      <p className='font-medium text-ink'>{title}</p>
      {children && <p className='mt-1 max-w-sm text-sm text-muted'>{children}</p>}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  action: PropTypes.node,
};
