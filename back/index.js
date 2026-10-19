import { testConnection, sequelize } from './config/index.js';
import { app } from './app.js';
import { startRecurringExpenseJob } from './cron/recurringExpenses.js';
import { startDivisaUpdateJob } from './cron/updateDivisas.js';
import { ensureRateSnapshot } from './services/divisaService.js';

async function start() {
  await testConnection();
  await sequelize.sync();
  await ensureRateSnapshot().catch((err) => console.error('No se pudo guardar el tipo de cambio de hoy', err));
  startRecurringExpenseJob();
  startDivisaUpdateJob();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Backend corriendo en puerto ${port}`));
}

start();
