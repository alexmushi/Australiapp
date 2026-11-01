// npm run db:schema: guarda la ESTRUCTURA de todas las tablas (sin datos) en
// back/db/schema-actual.sql, para compartirla sin exponer información.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sequelize } from '../config/index.js';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema-actual.sql');

try {
  const [rows] = await sequelize.query('SHOW FULL TABLES');
  const parts = [`-- Estructura de ${sequelize.getDatabaseName()} (sin datos)`, `-- Generado: ${new Date().toISOString()}`, ''];
  for (const row of rows) {
    const [name, type] = Object.values(row);
    const [[create]] = await sequelize.query(`SHOW CREATE ${type === 'VIEW' ? 'VIEW' : 'TABLE'} \`${name}\``);
    // Quita el contador AUTO_INCREMENT: revela cuántos registros hay.
    const ddl = String(create['Create Table'] ?? create['Create View']).replace(/ AUTO_INCREMENT=\d+/, '');
    parts.push(`${ddl};`, '');
  }
  fs.writeFileSync(out, parts.join('\n'));
  console.log(`✔️ ${rows.length} tablas exportadas a ${out}`);
} catch (err) {
  console.error('❌ No se pudo exportar la estructura:', err?.parent?.sqlMessage ?? err.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
