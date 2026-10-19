import { useMemo } from 'react';
import CategoryForm from './CategoryForm.jsx';
import CategoryTable from './CategoryTable.jsx';
import Alert from './ui/Alert.jsx';
import useCategories from '../hooks/useCategories.js';
import useReport from '../hooks/useReport.js';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryColorMap } from '../utils/dashboard.js';

export default function CategoryPage() {
  const { user } = useAuth();
  const currency = user?.default_currency_code || 'MXN';
  const { categories, error, loading, reload } = useCategories();
  const report = useReport('month', currency);
  const colorMap = useMemo(() => categoryColorMap(categories), [categories]);
  const spentThisMonth = useMemo(
    () => Object.fromEntries((report.data?.categories ?? []).map((c) => [String(c.id), c.expenses])),
    [report.data]
  );

  return (
    <div className='mx-auto flex max-w-3xl flex-col gap-5'>
      {error && <Alert title='No se pudieron cargar las categorías'>Revisa tu conexión y recarga la página.</Alert>}
      <CategoryForm onCreated={reload} />
      <CategoryTable
        categories={categories}
        spentThisMonth={spentThisMonth}
        currency={currency}
        colorMap={colorMap}
        onChanged={() => {
          reload();
          report.reload();
        }}
        loading={loading}
      />
    </div>
  );
}
