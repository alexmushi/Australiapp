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

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ranges = [
  { value: 'month', label: 'Este mes' },
  { value: 'week', label: 'Última semana' },
  { value: 'year', label: 'Último año' },
];

export default function Dashboard() {
  const categories = useCategories();
  const [range, setRange] = useState('month');
  const [category, setCategory] = useState('all');
  const report = useReport(range, category);
  const table = useSummaryTable(category === 'all');

  if (!report) return <p className='p-4'>Cargando...</p>;

  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const makeColors = (n) =>
    Array.from({ length: n }, (_, i) => `hsl(${(i * 60) % 360},70%,60%)`);

  const monthName = (m) =>
    new Date(2000, m - 1, 1).toLocaleString('es', { month: 'short' }).toUpperCase();

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

    const expenses = report.expenses;
    const totalLeft = Math.max(report.totalBudget - report.totalExpenses, 0);
    const pieData = {
      labels: expenses.map((_, i) => `Gasto ${i + 1}`).concat(['Restante']),
      datasets: [
        {
          data: expenses.map((e) => e.amount).concat([totalLeft]),
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
                return `Restante: $${totalLeft.toFixed(2)}`;
              const e = expenses[ctx.dataIndex];
              const date = new Date(e.date).toLocaleDateString();
              return `${date}: $${e.amount.toFixed(2)}${e.description ? ' - ' + e.description : ''}`;
            },
          },
        },
      },
    };

    content = (
      <>
        <div className='mb-8'>
          <h3 className='text-lg mb-2'>General</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div>
          <h3 className='text-lg mb-2'>Por categoría</h3>
          <Bar data={barData} />
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
                return `Restante: $${left.toFixed(2)}`;
              const e = expenses[ctx.dataIndex];
              const date = new Date(e.date).toLocaleDateString();
              return `${date}: $${e.amount.toFixed(2)}${e.description ? ' - ' + e.description : ''}`;
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
          <Bar data={barData} />
        </div>
        <div>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </>
    );
  }

  return (
    <div className='p-4'>
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
          <table className='min-w-max text-sm border-collapse whitespace-nowrap'>
            <thead>
              <tr>
                <th className='border px-2 whitespace-nowrap'>Rubros</th>
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
                <th></th>
                <th className='border px-2 whitespace-nowrap'>Mes</th>
                <th className='border px-2 whitespace-nowrap'>Real</th>
                <th className='border px-2 whitespace-nowrap'>Dif</th>
                {table.months.map((m) => (
                  <React.Fragment key={`h-${m.year}-${m.month}`}>
                    <th className='border px-2 whitespace-nowrap'>Mes</th>
                    <th className='border px-2 whitespace-nowrap'>Real</th>
                    <th className='border px-2 whitespace-nowrap'>Dif</th>
                  </React.Fragment>
                ))}
                <th className='border px-2 whitespace-nowrap'>Mes</th>
                <th className='border px-2 whitespace-nowrap'>Real</th>
              </tr>
            </thead>
            <tbody>
              {table.categories.map((cat) => (
                <tr key={cat.id}>
                  <td className='border px-2 text-left whitespace-nowrap'>{cat.name}</td>
                  <td className='border px-2 whitespace-nowrap'>{cat.antesBudget.toFixed(2)}</td>
                  <td className='border px-2 whitespace-nowrap'>{cat.antesReal.toFixed(2)}</td>
                  <td className='border px-2 whitespace-nowrap'>
                    {(cat.antesBudget - cat.antesReal).toFixed(2)}
                  </td>
                  {cat.months.map((m, idx) => (
                    <React.Fragment key={idx}>
                      <td className='border px-2 whitespace-nowrap'>{m.budget.toFixed(2)}</td>
                      <td className='border px-2 whitespace-nowrap'>{m.real.toFixed(2)}</td>
                      <td className='border px-2 whitespace-nowrap'>
                        {(m.budget - m.real).toFixed(2)}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className='border px-2 whitespace-nowrap'>{cat.totalBudget.toFixed(2)}</td>
                  <td className='border px-2 whitespace-nowrap'>{cat.totalReal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}