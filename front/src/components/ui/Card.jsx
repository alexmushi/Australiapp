import PropTypes from 'prop-types';

export default function Card({ as: Tag = 'section', title, subtitle, actions, className = '', bodyClassName = '', children, ...rest }) {
  return (
    <Tag className={`rounded-xl border border-line bg-surface shadow-card ${className}`} {...rest}>
      {(title || actions) && (
        <header className='flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5'>
          <div className='min-w-0'>
            {title && <h2 className='text-base font-semibold text-ink'>{title}</h2>}
            {subtitle && <p className='mt-0.5 text-sm text-muted'>{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </Tag>
  );
}

Card.propTypes = {
  as: PropTypes.elementType,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  children: PropTypes.node,
};
