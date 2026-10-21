// npm run migrate: crea las tablas que falten y muestra el resultado.
import { sequelize } from '../config/index.js';
import { explainMigrationError, migrate } from './migrate.js';

try {
  const { tables, missing } = await migrate();
  console.log(`Base de datos: ${sequelize.getDatabaseName()}`);
  console.log(`Tablas: ${tables.sort().join(', ')}`);
  if (missing.length) {
    console.error(`❌ Faltan tablas: ${missing.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('✔️ Todas las tablas necesarias existen.');
  }
} catch (err) {
  console.error('❌ No se pudieron crear las tablas:', explainMigrationError(err));
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
