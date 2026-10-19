import { useState } from 'react';
import PropTypes from 'prop-types';
import { LuCheck, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import Card from './ui/Card.jsx';
import EmptyState from './ui/EmptyState.jsx';
import CustomButton from './CustomButton.jsx';
import { useToast } from './ui/Toast.jsx';
import { deleteCategory, updateCategory } from '../services/api.js';
import { formatCurrency } from '../utils/money.js';

const inputClass =
  'h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-base sm:text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';

function EditRow({ category, onSaved, onCancel }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      setError('Ingresa un nombre.');
      return;
    }
    setSaving(true);
    try {
      await updateCategory(category.id, { name: name.trim(), description: description.trim() });
      onSaved(name.trim());
    } catch (err) {
      console.error(err);
      setError(err?.serverMessage || 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className='flex flex-col gap-2 py-3' noValidate>
      <div className='grid gap-2 sm:grid-cols-2'>
        <input
          aria-label='Nombre de la categoría'
          className={inputClass}
          value={name}
          maxLength={50}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          autoFocus
        />
        <input
          aria-label='Descripción de la categoría'
          className={inputClass}
          value={description}
          maxLength={255}
          placeholder='Descripción (opcional)'
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className='text-xs font-medium text-bad' role='alert'>{error}</p>}
      <div className='flex justify-end gap-2'>
        <CustomButton variant='ghost' size='sm' onClick={onCancel}>
          <LuX aria-hidden />
          Cancelar
        </CustomButton>
        <CustomButton type='submit' isPrimary size='sm' loading={saving}>
          <LuCheck aria-hidden />
          Guardar
        </CustomButton>
      </div>
    </form>
  );
}

EditRow.propTypes = {
  category: PropTypes.object.isRequired,
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/** Tabla de categorías con lo gastado este mes, edición y borrado. */
export default function CategoryTable({ categories, spentThisMonth, currency, colorMap, onChanged, loading }) {
  const notify = useToast();
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (c) => {
    try {
      await deleteCategory(c.id);
      notify(`Se eliminó “${c.name}”.`, { title: 'Categoría eliminada' });
      setConfirmDelete(null);
      onChanged();
    } catch (err) {
      console.error(err);
      notify(err?.serverMessage || 'No se pudo eliminar la categoría.', { tone: 'error' });
    }
  };

  const totalMonth = categories.reduce((s, c) => s + (spentThisMonth[String(c.id)] ?? 0), 0);

  return (
    <Card
      title='Tus categorías'
      subtitle={`${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'} · ${formatCurrency(totalMonth, currency)} gastado este mes`}
      bodyClassName='px-2 pb-2 pt-1 sm:px-3 sm:pb-3'
    >
      {categories.length === 0 ? (
        <EmptyState title='Sin categorías'>{loading ? 'Cargando…' : 'Crea tu primera categoría arriba.'}</EmptyState>
      ) : (
        <table className='w-full text-sm'>
          <thead className='sr-only sm:not-sr-only'>
            <tr className='text-left text-xs text-muted'>
              <th scope='col' className='px-2 py-2 font-medium sm:px-3'>Categoría</th>
              <th scope='col' className='px-2 py-2 text-right font-medium'>Este mes</th>
              <th scope='col' className='hidden px-2 py-2 text-right font-medium sm:table-cell'>Gastos</th>
              <th scope='col' className='px-2 py-2'>
                <span className='sr-only'>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-line border-t border-line'>
            {categories.map((c) =>
              editing === c.id ? (
                <tr key={c.id}>
                  <td colSpan={4} className='px-2 sm:px-3'>
                    <EditRow
                      category={c}
                      onCancel={() => setEditing(null)}
                      onSaved={(name) => {
                        notify(`Se guardó “${name}”.`, { title: 'Categoría actualizada' });
                        setEditing(null);
                        onChanged();
                      }}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td className='px-2 py-3 sm:px-3'>
                    <span className='flex items-center gap-2'>
                      <span
                        aria-hidden
                        className='h-2.5 w-2.5 shrink-0 rounded-full'
                        style={{ background: colorMap[String(c.id)] }}
                      />
                      <span className='min-w-0'>
                        <span className='block truncate font-medium text-ink'>{c.name}</span>
                        {c.description && <span className='block truncate text-xs text-muted'>{c.description}</span>}
                        <span className='block text-xs text-muted sm:hidden'>
                          {c.expense_count} {c.expense_count === 1 ? 'gasto' : 'gastos'}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className='px-2 py-3 text-right font-medium tabular-nums text-ink'>
                    {formatCurrency(spentThisMonth[String(c.id)] ?? 0, currency)}
                  </td>
                  <td className='hidden px-2 py-3 text-right tabular-nums text-ink-2 sm:table-cell'>{c.expense_count}</td>
                  <td className='px-1 py-2 text-right whitespace-nowrap'>
                    {confirmDelete === c.id ? (
                      <span className='inline-flex items-center gap-1'>
                        <CustomButton variant='danger' size='sm' onClick={() => handleDelete(c)}>
                          Eliminar
                        </CustomButton>
                        <CustomButton variant='ghost' size='sm' onClick={() => setConfirmDelete(null)}>
                          Cancelar
                        </CustomButton>
                      </span>
                    ) : (
                      <span className='inline-flex'>
                        <button
                          type='button'
                          onClick={() => setEditing(c.id)}
                          aria-label={`Editar ${c.name}`}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink'
                        >
                          <LuPencil aria-hidden />
                        </button>
                        <button
                          type='button'
                          onClick={() => setConfirmDelete(c.id)}
                          disabled={c.expense_count > 0}
                          aria-label={
                            c.expense_count > 0
                              ? `No se puede eliminar ${c.name}: tiene gastos`
                              : `Eliminar ${c.name}`
                          }
                          title={c.expense_count > 0 ? 'Tiene gastos registrados; no se puede eliminar' : undefined}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad disabled:pointer-events-none disabled:opacity-30'
                        >
                          <LuTrash2 aria-hidden />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </Card>
  );
}

CategoryTable.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      expense_count: PropTypes.number,
    })
  ).isRequired,
  spentThisMonth: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  colorMap: PropTypes.object.isRequired,
  onChanged: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
