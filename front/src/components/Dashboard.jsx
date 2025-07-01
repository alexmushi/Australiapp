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

  if (!report) return <p className='p-4'>Cargando...</p>;

  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const makeColors = (n) =>
    Array.from({ length: n }, (_, i) => `hsl(${(i * 60) % 360},70%,60%)`);

  let content;
  if (category === 'all') {
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
    </div>
  );
}