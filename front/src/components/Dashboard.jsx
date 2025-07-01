import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import CustomSelect from './CustomSelect.jsx';
import { fetchDashboard } from '../services/api.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const options = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_week', label: 'Última semana' },
  { value: 'last_month', label: 'Último mes' },
  { value: 'last_year', label: 'Último año' },
];

export default function Dashboard() {
  const [period, setPeriod] = useState('this_month');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard(period)
      .then(setData)
      .catch((err) => console.error(err));
  }, [period]);

  if (!data) {
    return <p className='p-4'>Cargando...</p>;
  }

  const chartData = {
    labels: data.categories.map((c) => c.name),
    datasets: [
      {
        label: 'Presupuesto',
        data: data.categories.map((c) => c.budget),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Gastos',
        data: data.categories.map((c) => c.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const totalData = {
    labels: ['Total'],
    datasets: [
      {
        label: 'Presupuesto',
        data: [data.totalBudget],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Gastos',
        data: [data.totalExpenses],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <CustomSelect
          name='period'
          id='period'
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={options}
        >
          Periodo
        </CustomSelect>
      </div>
      <Bar data={chartData} />
      <div className='mt-8'>
        <h2 className='text-xl mb-2'>General</h2>
        <Bar data={totalData} />
      </div>
    </div>
  );
}
