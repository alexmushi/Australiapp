import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import useReport from '../hooks/useReport.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ranges = [
  { value: 'month', label: 'Este mes' },
  { value: 'week', label: 'Última semana' },
  { value: 'year', label: 'Último año' },
];

export default function Dashboard() {
  const [range, setRange] = useState('month');
  const report = useReport(range);

  if (!report) return <p className='p-4'>Cargando...</p>;

  const categoryLabels = report.categories.map((c) => c.name);
  const expenseData = report.categories.map((c) => c.expenses);
  const budgetData = report.categories.map((c) => c.budget);

  const barData = {
    labels: categoryLabels,
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

  const pieData = {
    labels: ['Gastos', 'Presupuesto restante'],
    datasets: [
      {
        data: [report.totalExpenses, Math.max(report.totalBudget - report.totalExpenses, 0)],
        backgroundColor: ['#ff6384', '#36a2eb'],
      },
    ],
  };

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <select value={range} onChange={(e) => setRange(e.target.value)} className='text-black p-1 rounded'>
          {ranges.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className='mb-8'>
        <h3 className='text-lg mb-2'>General</h3>
        <Pie data={pieData} />
      </div>
      <div>
        <h3 className='text-lg mb-2'>Por categoría</h3>
        <Bar data={barData} />
      </div>
    </div>
  );
}
