import express from 'express';
import cors from 'cors';
import { testConnection, sequelize } from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import reviewerRoutes from './routes/reviewers.routes.js';
import categoriaRoutes from './routes/categorias.routes.js';
import usuarioRoutes from './routes/usuarios.routes.js';
import divisaRoutes from './routes/divisas.routes.js';
import gastoRoutes from './routes/gastos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { startRecurringExpenseJob } from './cron/recurringExpenses.js';
import { startDivisaUpdateJob } from './cron/updateDivisas.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reviewers', reviewerRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/users', usuarioRoutes);
app.use('/api/divisas', divisaRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/dashboard', dashboardRoutes);

async function start() {
  await testConnection();
  await sequelize.sync();
  startRecurringExpenseJob();
  startDivisaUpdateJob();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Backend corriendo en puerto ${port}`));
}

start();