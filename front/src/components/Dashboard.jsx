import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import useReport from '../hooks/useReport.js';
import useCategories from '../hooks/useCategories.js';
import useSummaryTable from '../hooks/useSummaryTable.js';
import { useAuth } from '../context/AuthContext.jsx';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ranges = [
  { value: 'month', label: 'Este mes' },
  { value: 'week', label: 'Esta semana' },
  { value: 'year', label: 'Último año' },
  { value: 'all', label: 'Todo' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const categories = useCategories();
  const [range, setRange] = useState('month');
  const [category, setCategory] = useState('all');
  const currency = user?.default_currency_code || 'MXN';
  const formatCurrency = (v) =>
    new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
    }).format(v);
  const report = useReport(range, category, currency);
  const table = useSummaryTable(category === 'all', currency);
  const [hoverCol, setHoverCol] = useState(null);

  if (!report) return <p className='p-4'>Cargando...</p>;

  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const makeColors = (n) =>
    Array.from({ length: n }, (_, i) => `hsl(${(i * 60) % 360},70%,60%)`);

  const monthName = (m) =>
    new Date(2000, m - 1, 1).toLocaleString('es', { month: 'short' }).toUpperCase();

  const cellClass = (idx) =>
    `border px-2 whitespace-nowrap ${hoverCol === idx ? 'col-hover' : ''}`;

  const barOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v) => formatCurrency(v),
        },
      },
    },
  };

  const totals = table
    ? (() => {
        const antesBudget = table.categories.reduce(
          (s, c) => s + c.antesBudget,
          0
        );
        const antesReal = table.categories.reduce(
          (s, c) => s + c.antesReal,
          0
        );
        const monthTotals = table.months.map((_, idx) => {
          const budget = table.categories.reduce(
            (s, c) => s + c.months[idx].budget,
            0
          );
          const real = table.categories.reduce(
            (s, c) => s + c.months[idx].real,
            0
          );
          return { budget, real };
        });
        const totalBudget = table.categories.reduce(
          (s, c) => s + c.totalBudget,
          0
        );
        const totalReal = table.categories.reduce(
          (s, c) => s + c.totalReal,
          0
        );
      return { antesBudget, antesReal, monthTotals, totalBudget, totalReal };
    })()
    : null;
  const monthCount = table ? table.months.length : 0;

  const mensualDiffs = totals
    ? [
        totals.antesBudget - totals.antesReal,
        ...totals.monthTotals.map((m) => m.budget - m.real),
      ]
    : [];
  const acumulados = [];
  if (mensualDiffs.length) {
    mensualDiffs.reduce((acc, val, idx) => {
      const sum = acc + val;
      acumulados[idx] = sum;
      return sum;
    }, 0);
  }

  let content;
  if (category === 'all') {
    if (!Array.isArray(report.categories)) return <p className='p-4'>Cargando...</p>;
    const catLabels = report.categories.map((c) => c.name);
    const expenseData = report.categories.map((c) => c.expenses);
    const budgetData = report.categories.map((c) => c.budget);

    const barData = {
      labels: catLabels,
      datasets: [
        {
          label: 'Gastos',
          backgroundColor: 'rgba(255,99,132,0.5)',
          data: expenseData,
        },
        {
          label: 'Presupuesto',
          backgroundColor: 'rgba(54,162,235,0.5)',
          data: budgetData,
        },
      ],
    };

    const catOrder = Object.fromEntries(
      report.categories.map((c, idx) => [c.id, idx])
    );
    const expenses = [...report.expenses].sort(
      (a, b) => catOrder[a.category_id] - catOrder[b.category_id]
    );
    const totalLeft = Math.max(report.totalBudget - report.totalExpenses, 0);
    const catNameById = Object.fromEntries(
      report.categories.map((c) => [c.id, c.name])
    );
    const catColorMap = (() => {
      const colors = makeColors(report.categories.length);
      return Object.fromEntries(
        report.categories.map((c, idx) => [c.id, colors[idx]])
      );
    })();
    const pieData = {
      labels: expenses
        .map((e, i) => catNameById[e.category_id] || `Gasto ${i + 1}`)
        .concat(['Restante']),
      datasets: [
        {
          data: expenses.map((e) => e.amount).concat([totalLeft]),
          backgroundColor: expenses
            .map((e) => catColorMap[e.category_id])
            .concat(['hsl(0,0%,80%)']),
        },
      ],
    };
    
    const pieOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.dataIndex === expenses.length)
                return `Restante: ${formatCurrency(totalLeft)}`;
              const e = expenses[ctx.dataIndex];
              const date = new Date(e.date).toLocaleDateString();
              return `${date}: ${formatCurrency(e.amount)}${e.description ? ' - ' + e.description : ''}`;
            },
          },
        },
        legend: {
          labels: {
            filter: (legendItem) => {
              if (legendItem.text === 'Restante') return true;
              return (
                legendItem.index ===
                expenses.findIndex(
                  (e) => catNameById[e.category_id] === legendItem.text
                )
              );
            },
          },
        },
      },
    };
    
    content = (
      <>
        <div className='mb-8'>
          <h3 className='text-lg mb-2'>General</h3>
          <div className='mx-auto max-w-2xl'>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        <div>
          <h3 className='text-lg mb-2'>Por categoría</h3>
          <div className='mx-auto max-w-2xl'>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </>
    );
  } else {
    if (!report.expenses || !Array.isArray(report.expenses.items))
      return <p className='p-4'>Cargando...</p>;
    const expenses = report.expenses.items;
    const left = Math.max(report.budget - report.expenses.total, 0);
    const pieData = {
      labels: expenses.map((_, i) => `Gasto ${i + 1}`).concat(['Restante']),
      datasets: [
        {
          data: expenses.map((e) => e.amount).concat([left]),
          backgroundColor: makeColors(expenses.length + 1),
        },
      ],
    };
    const pieOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.dataIndex === expenses.length)
                return `Restante: ${formatCurrency(left)}`;
              const e = expenses[ctx.dataIndex];
              const date = new Date(e.date).toLocaleDateString();
              return `${date}: ${formatCurrency(e.amount)}${e.description ? ' - ' + e.description : ''}`;
            },
          },
        },
      },
    };

    const barData = {
      labels: ['Presupuesto'],
      datasets: [
        {
          label: 'Gastos',
          backgroundColor: 'rgba(255,99,132,0.5)',
          data: [report.expenses.total],
        },
        {
          label: 'Presupuesto',
          backgroundColor: 'rgba(54,162,235,0.5)',
          data: [report.budget],
        },
      ],
    };

    content = (
      <>
        <div className='mb-8'>
          <h3 className='text-lg mb-2'>{report.name}</h3>
          <div className='mx-auto max-w-2xl'>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div>
          <div className='mx-auto max-w-2xl'>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <div className='flex gap-4 mb-4'>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='text-black p-1 rounded'
        >
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className='text-black p-1 rounded'
        >
          {ranges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      {content}
      {category === 'all' && table && (
        <div className='overflow-x-auto mt-8'>
          <table
            className='min-w-max text-sm border-collapse whitespace-nowrap crosshair-table'
            onMouseLeave={() => setHoverCol(null)}
          >
            <thead>
              <tr>
                <th className='border px-2 whitespace-nowrap sticky left-0 bg-background z-10 sticky-col'>Rubros</th>
                <th className='border px-2 whitespace-nowrap' colSpan={3}>Antes</th>
                {table.months.map((m) => (
                  <th
                    key={`${m.year}-${m.month}`}
                    className='border px-2 whitespace-nowrap'
                    colSpan='3'
                  >
                    {monthName(m.month)} {m.year}
                  </th>
                ))}
                <th className='border px-2 whitespace-nowrap' colSpan='2'>Total por rubro</th>
              </tr>
              <tr>
                <th
                  className={`${cellClass(0)} sticky left-0 bg-background sticky-col`}
                  onMouseEnter={() => setHoverCol(0)}
                ></th>
                <th
                  className={cellClass(1)}
                  onMouseEnter={() => setHoverCol(1)}
                >
                  Presupuesto
                </th>
                <th
                  className={cellClass(2)}
                  onMouseEnter={() => setHoverCol(2)}
                >
                  Real
                </th>
                <th
                  className={cellClass(3)}
                  onMouseEnter={() => setHoverCol(3)}
                >
                  Dif
                </th>
                {table.months.map((m, mi) => (
                  <React.Fragment key={`h-${m.year}-${m.month}`}>
                    <th
                      className={cellClass(4 + mi * 3)}
                      onMouseEnter={() => setHoverCol(4 + mi * 3)}
                    >
                      Presupuesto
                    </th>
                    <th
                      className={cellClass(4 + mi * 3 + 1)}
                      onMouseEnter={() => setHoverCol(4 + mi * 3 + 1)}
                    >
                      Real
                    </th>
                    <th
                      className={cellClass(4 + mi * 3 + 2)}
                      onMouseEnter={() => setHoverCol(4 + mi * 3 + 2)}
                    >
                      Dif
                    </th>
                  </React.Fragment>
                ))}
                <th
                  className={cellClass(4 + monthCount * 3)}
                  onMouseEnter={() => setHoverCol(4 + monthCount * 3)}
                >
                  Presupuesto
                </th>
                <th
                  className={cellClass(5 + monthCount * 3)}
                  onMouseEnter={() => setHoverCol(5 + monthCount * 3)}
                >
                  Real
                </th>
              </tr>
            </thead>
            <tbody>
              {table.categories.map((cat) => (
                <tr key={cat.id}>
                  <td
                    className={`${cellClass(0)} text-left sticky left-0 bg-background sticky-col`}
                    onMouseEnter={() => setHoverCol(0)}
                  >
                    {cat.name}
                  </td>
                  <td
                    className={cellClass(1)}
                    onMouseEnter={() => setHoverCol(1)}
                  >
                    {cat.antesBudget.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(2)}
                    onMouseEnter={() => setHoverCol(2)}
                  >
                    {cat.antesReal.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(3)}
                    onMouseEnter={() => setHoverCol(3)}
                  >
                    {(cat.antesBudget - cat.antesReal).toFixed(2)}
                  </td>
                  {cat.months.map((m, idx) => (
                    <React.Fragment key={idx}>
                      <td
                        className={cellClass(4 + idx * 3)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3)}
                      >
                        {m.budget.toFixed(2)}
                      </td>
                      <td
                        className={cellClass(4 + idx * 3 + 1)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 1)}
                      >
                        {m.real.toFixed(2)}
                      </td>
                      <td
                        className={cellClass(4 + idx * 3 + 2)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 2)}
                      >
                        {(m.budget - m.real).toFixed(2)}
                      </td>
                    </React.Fragment>
                  ))}
                  <td
                    className={cellClass(4 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(4 + monthCount * 3)}
                  >
                    {cat.totalBudget.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(5 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(5 + monthCount * 3)}
                  >
                    {cat.totalReal.toFixed(2)}
                  </td>
                </tr>
              ))}
              {totals && (
                <tr className='font-semibold'>
                  <td
                    className={`${cellClass(0)} sticky left-0 bg-background sticky-col`}
                    onMouseEnter={() => setHoverCol(0)}
                  >
                    Mensual
                  </td>
                  <td
                    className={cellClass(1)}
                    onMouseEnter={() => setHoverCol(1)}
                  >
                    {totals.antesBudget.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(2)}
                    onMouseEnter={() => setHoverCol(2)}
                  >
                    {totals.antesReal.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(3)}
                    onMouseEnter={() => setHoverCol(3)}
                  >
                    {mensualDiffs[0].toFixed(2)}
                  </td>
                  {totals.monthTotals.map((m, idx) => (
                    <React.Fragment key={`m-${idx}`}>
                      <td
                        className={cellClass(4 + idx * 3)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3)}
                      >
                        {m.budget.toFixed(2)}
                      </td>
                      <td
                        className={cellClass(4 + idx * 3 + 1)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 1)}
                      >
                        {m.real.toFixed(2)}
                      </td>
                      <td
                        className={cellClass(4 + idx * 3 + 2)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 2)}
                      >
                        {mensualDiffs[idx + 1].toFixed(2)}
                      </td>
                    </React.Fragment>
                  ))}
                  <td
                    className={cellClass(4 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(4 + monthCount * 3)}
                  >
                    {totals.totalBudget.toFixed(2)}
                  </td>
                  <td
                    className={cellClass(5 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(5 + monthCount * 3)}
                  >
                    {totals.totalReal.toFixed(2)}
                  </td>
                </tr>
              )}
              {totals && (
                <tr className='font-semibold'>
                  <td
                    className={`${cellClass(0)} sticky left-0 bg-background sticky-col`}
                    onMouseEnter={() => setHoverCol(0)}
                  >
                    Acumulado
                  </td>
                  <td
                    className={cellClass(1)}
                    onMouseEnter={() => setHoverCol(1)}
                  ></td>
                  <td
                    className={cellClass(2)}
                    onMouseEnter={() => setHoverCol(2)}
                  ></td>
                  <td
                    className={cellClass(3)}
                    onMouseEnter={() => setHoverCol(3)}
                  >
                    {acumulados[0].toFixed(2)}
                  </td>
                  {totals.monthTotals.map((_, idx) => (
                    <React.Fragment key={`a-${idx}`}>
                      <td
                        className={cellClass(4 + idx * 3)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3)}
                      ></td>
                      <td
                        className={cellClass(4 + idx * 3 + 1)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 1)}
                      ></td>
                      <td
                        className={cellClass(4 + idx * 3 + 2)}
                        onMouseEnter={() => setHoverCol(4 + idx * 3 + 2)}
                      >
                        {acumulados[idx + 1].toFixed(2)}
                      </td>
                    </React.Fragment>
                  ))}
                  <td
                    className={cellClass(4 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(4 + monthCount * 3)}
                  ></td>
                  <td
                    className={cellClass(5 + monthCount * 3)}
                    onMouseEnter={() => setHoverCol(5 + monthCount * 3)}
                  ></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}