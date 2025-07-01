import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useDashboard from '../hooks/useDashboard.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ranges = {
  month: { label: 'Este mes', start: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: () => new Date() },
  week: { label: 'Última semana', start: () => { const d = new Date(); d.setDate(d.getDate()-7); return d; }, end: () => new Date() },
  year: { label: 'Último año', start: () => { const d = new Date(); d.setFullYear(d.getFullYear()-1); return d; }, end: () => new Date() },
};

export default function Dashboard() {
  const [rangeKey, setRangeKey] = useState('month');
  const range = ranges[rangeKey];
  const { data, loading, error } = useDashboard({
    start: range.start().toISOString().slice(0,10),
    end: range.end().toISOString().slice(0,10)
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className='text-red-500'>{error}</p>;
  if (!data) return null;

  const categoryLabels = data.categories.map(c => c.name);
  const budgetData = data.categories.map(c => c.budget);
  const expenseData = data.categories.map(c => c.expenses);

  const pieData = {
    labels: categoryLabels,
    datasets: [{ data: expenseData, backgroundColor: ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'] }],
  };

  const barData = {
    labels: categoryLabels,
    datasets: [
      { label: 'Presupuesto', data: budgetData, backgroundColor: '#60a5fa' },
      { label: 'Gastos', data: expenseData, backgroundColor: '#f87171' },
    ],
  };

  const totalData = {
    labels: ['Presupuesto', 'Gastos'],
    datasets: [{ data: [data.totalBudget, data.totalExpenses], backgroundColor: ['#60a5fa', '#f87171'] }],
  };

  return (
    <div className='p-4'>
      <div className='mb-4'>
        {Object.entries(ranges).map(([key, r]) => (
          <button key={key} className={`mr-2 ${key===rangeKey?'font-bold':''}`} onClick={() => setRangeKey(key)}>
            {r.label}
          </button>
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <h3 className='text-lg mb-2'>Gastos por categoría</h3>
          <Pie data={pieData} />
        </div>
        <div>
          <h3 className='text-lg mb-2'>Presupuesto vs Gastos</h3>
          <Bar data={barData} />
        </div>
      </div>
      <div className='mt-6'>
        <h3 className='text-lg mb-2'>Totales</h3>
        <Pie data={totalData} />
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  rangeKey: PropTypes.string,
};
