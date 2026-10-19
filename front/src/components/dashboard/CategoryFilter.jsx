import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

/**
 * Selector múltiple de categorías. ['all'] significa todas.
 */
export default function CategoryFilter({ categories, selected, onChange, colorMap }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelId = useId();
  const isAll = selected.includes('all');
  const selectedSet = new Set(selected);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (id) => {
    if (isAll) {
      onChange([id]);
      return;
    }
    const next = selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(next.length === 0 || next.length === categories.length ? ['all'] : next);
  };

  const names = categories.filter((c) => selectedSet.has(String(c.id))).map((c) => c.name);
  const summary = isAll
    ? 'Todas las categorías'
    : names.length === 1
      ? names[0]
      : `${names.length || selected.length} categorías`;

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup='true'
        className='flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink hover:border-muted sm:w-60'
      >
        <span className='truncate'>
          <span className='text-muted'>Categorías: </span>
          {summary}
        </span>
        <LuChevronDown aria-hidden className='shrink-0 text-muted' />
      </button>
      {open && (
        <div
          id={panelId}
          className='absolute left-0 z-40 mt-2 max-h-80 w-full min-w-64 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-lg sm:w-72'
        >
          <fieldset>
            <legend className='sr-only'>Categorías a mostrar</legend>
            <Option checked={isAll} onToggle={() => onChange(['all'])} label='Todas las categorías' />
            <div className='my-1 h-px bg-line' />
            {categories.map((c) => (
              <Option
                key={c.id}
                checked={!isAll && selectedSet.has(String(c.id))}
                onToggle={() => toggle(String(c.id))}
                label={c.name}
                color={colorMap[String(c.id)]}
              />
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}

function Option({ checked, onToggle, label, color }) {
  return (
    <label className='flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-2'>
      <input type='checkbox' checked={checked} onChange={onToggle} className='peer sr-only' />
      <span
        aria-hidden
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
          checked ? 'border-primary bg-primary text-on-primary' : 'border-line-strong'
        }`}
      >
        {checked && <LuCheck className='text-xs' />}
      </span>
      {color && <span aria-hidden className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ background: color }} />}
      <span className='truncate text-ink'>{label}</span>
    </label>
  );
}

Option.propTypes = {
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  colorMap: PropTypes.object.isRequired,
};
