import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import useDashboard from '../hooks/useDashboard.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ranges = {
  thisMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  },
  lastWeek: () => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { start, end };
  },
  lastMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  },
  lastYear: () => {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    return { start, end };
  },
};

export default function Dashboard() {
  const [range, setRange] = useState('thisMonth');
  const { start, end } = ranges[range]();
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const { data } = useDashboard(startStr, endStr);

  if (!data) return <p className='p-4'>Cargando...</p>;

  const categoryLabels = data.categories.map((c) => c.name);
  const expensesData = data.categories.map((c) => c.expenses);
  const budgetData = data.categories.map((c) => c.budget);

  const combinedData = {
    labels: ['Presupuesto', 'Gastos'],
    datasets: [
      {
        data: [data.totalBudget, data.totalExpenses],
        backgroundColor: ['#4caf50', '#f44336'],
      },
    ],
  };

  const barData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Presupuesto',
        data: budgetData,
        backgroundColor: '#4caf50',
      },
      {
        label: 'Gastos',
        data: expensesData,
        backgroundColor: '#f44336',
      },
    ],
  };

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <select value={range} onChange={(e) => setRange(e.target.value)} className='text-black p-1'>
          <option value='thisMonth'>Este mes</option>
          <option value='lastWeek'>Última semana</option>
          <option value='lastMonth'>Último mes</option>
          <option value='lastYear'>Último año</option>
        </select>
      </div>
      <div className='mb-8'>
        <h2 className='text-xl mb-2'>General</h2>
        <Pie data={combinedData} />
      </div>
      <div>
        <h2 className='text-xl mb-2'>Por categoría</h2>
        <Bar data={barData} />
      </div>
    </div>
  );
}

Dashboard.propTypes = {};
