import { LuBanknote, LuLayoutDashboard, LuReceipt, LuTags } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext.jsx';
// import ReviewerForm from '../components/ReviewerForm.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import IncomeForm from '../components/IncomeForm.jsx';
import Dashboard from '../components/Dashboard.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import UserMenu from '../components/layout/UserMenu.jsx';
import useHashView from '../hooks/useHashView.js';

const VIEWS = { home: '', expense: 'gasto', income: 'ingresos', category: 'categoria' };

const NAV_ITEMS = [
  { key: 'home', label: 'Resumen', icon: LuLayoutDashboard },
  { key: 'expense', label: 'Registrar gasto', shortLabel: 'Gasto', icon: LuReceipt },
  { key: 'income', label: 'Ingresos', icon: LuBanknote },
  { key: 'category', label: 'Nueva categoría', shortLabel: 'Categoría', icon: LuTags },
];

const HEADINGS = {
  home: { title: 'Resumen', subtitle: 'Tus gastos frente al 50% de tu ingreso' },
  expense: { title: 'Registrar gasto', subtitle: 'Agrega una compra o un pago' },
  income: { title: 'Ingresos', subtitle: 'Lo que ganaste el mes pasado, repartido 30/20/50' },
  category: { title: 'Nueva categoría', subtitle: 'Crea una categoría para clasificar gastos' },
};

export default function HomePage() {
  const { user, logout, changeCurrency } = useAuth();
  const [view, setView] = useHashView(VIEWS, 'home');

  let content = (
    <Dashboard onAddExpense={() => setView('expense')} onAddIncome={() => setView('income')} />
  );
  if (view === 'income') content = <IncomeForm />;
  if (view === 'category') content = <CategoryForm />;
  if (view === 'expense') content = <ExpenseForm />;

  return (
    <AppShell
      items={NAV_ITEMS}
      current={view}
      onNavigate={setView}
      title={HEADINGS[view].title}
      subtitle={HEADINGS[view].subtitle}
      userMenu={
        <UserMenu
          username={user.username}
          currency={user.default_currency_code}
          onCurrencyChange={changeCurrency}
          onLogout={logout}
        />
      }
    >
      {content}
    </AppShell>
  );
}
