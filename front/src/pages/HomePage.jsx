import { LuBanknote, LuLayoutDashboard, LuReceipt, LuTags } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext.jsx';
import CategoryPage from '../components/CategoryPage.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import IncomeForm from '../components/IncomeForm.jsx';
import ReviewersPanel from '../components/ReviewersPanel.jsx';
import Dashboard from '../components/Dashboard.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import UserMenu from '../components/layout/UserMenu.jsx';
import NotificationBell from '../components/layout/NotificationBell.jsx';
import useHashView from '../hooks/useHashView.js';

const OWNER_VIEWS = {
  home: '',
  expense: 'gasto',
  income: 'ingresos',
  category: 'categoria',
  reviewers: 'revisores',
};
const REVIEWER_VIEWS = { home: '' };

const NAV_ITEMS = [
  { key: 'home', label: 'Resumen', icon: LuLayoutDashboard },
  { key: 'expense', label: 'Registrar gasto', shortLabel: 'Gasto', icon: LuReceipt },
  { key: 'income', label: 'Ingresos', icon: LuBanknote },
  { key: 'category', label: 'Categorías', icon: LuTags },
];

const HEADINGS = {
  home: { title: 'Resumen', subtitle: 'Tus gastos frente al 50% de tu ingreso' },
  expense: { title: 'Registrar gasto', subtitle: 'Agrega una compra o un pago' },
  income: { title: 'Ingresos', subtitle: 'Lo que ganaste el mes pasado, repartido 30/20/50' },
  category: { title: 'Categorías', subtitle: 'Clasifica tus gastos' },
  reviewers: { title: 'Revisores', subtitle: 'Personas que pueden ver tus finanzas' },
};

export default function HomePage() {
  const { user, isReviewer, logout, changeCurrency } = useAuth();
  // Los revisores solo ven el resumen (el servidor también bloquea los cambios).
  const [view, setView] = useHashView(isReviewer ? REVIEWER_VIEWS : OWNER_VIEWS, 'home');
  const currency = user.default_currency_code;

  let content = (
    <Dashboard
      onAddExpense={isReviewer ? undefined : () => setView('expense')}
      onAddIncome={isReviewer ? undefined : () => setView('income')}
    />
  );
  if (view === 'category') content = <CategoryPage />;
  if (view === 'expense') content = <ExpenseForm />;
  if (view === 'income') content = <IncomeForm />;
  if (view === 'reviewers') content = <ReviewersPanel />;

  return (
    <AppShell
      items={isReviewer ? NAV_ITEMS.slice(0, 1) : NAV_ITEMS}
      current={view}
      onNavigate={setView}
      title={
        isReviewer ? (
          <span className='flex items-center gap-2'>
            {HEADINGS[view].title}{' '}
            <span className='rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2'>Solo lectura</span>
          </span>
        ) : (
          HEADINGS[view].title
        )
      }
      subtitle={HEADINGS[view].subtitle}
      actions={
        <NotificationBell
          currency={currency}
          refreshKey={view}
          onNavigate={(target) => setView(isReviewer ? 'home' : target)}
        />
      }
      userMenu={
        <UserMenu
          username={user.username}
          currency={currency}
          onCurrencyChange={changeCurrency}
          onLogout={logout}
          isReviewer={isReviewer}
          onManageReviewers={isReviewer ? undefined : () => setView('reviewers')}
        />
      }
    >
      {content}
    </AppShell>
  );
}
