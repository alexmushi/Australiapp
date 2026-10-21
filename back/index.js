import { testConnection } from './config/index.js';
import { app } from './app.js';
import { startRecurringExpenseJob } from './cron/recurringExpenses.js';
import { startDivisaUpdateJob } from './cron/updateDivisas.js';
import { ensureRateSnapshot } from './services/divisaService.js';
import { explainMigrationError, migrate } from './db/migrate.js';

async function start() {
  await testConnection();

  // Crea las tablas que falten. Si no se puede, no arranca: mejor un error
  // claro aquí que errores "Table doesn't exist" en cada petición.
  try {
    const { missing } = await migrate();
    if (missing.length) {
      console.error(`❌ Faltan tablas en la base de datos: ${missing.join(', ')}`);
      console.error('   Ejecuta back/db/new-tables.sql o revisa DB_NAME en back/.env.');
      process.exit(1);
    }
    console.log('✔️ Tablas verificadas');
  } catch (err) {
    console.error('❌ No se pudieron crear las tablas:', explainMigrationError(err));
    process.exit(1);
  }

  await ensureRateSnapshot().catch((err) => console.error('No se pudo guardar el tipo de cambio de hoy', err));
  startRecurringExpenseJob();
  startDivisaUpdateJob();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Backend corriendo en puerto ${port}`));
}

start();
