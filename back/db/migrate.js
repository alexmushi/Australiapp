import { sequelize } from '../config/index.js';
// Importa todos los modelos para que sync() los conozca.
import '../models/usuario.model.js';
import '../models/usuarioRevisor.model.js';
import '../models/categoria.model.js';
import '../models/gasto.model.js';
import '../models/divisa.model.js';
import '../models/ingreso.model.js';
import '../models/divisaHistorial.model.js';

/** Tablas que la app necesita para funcionar. */
export const REQUIRED_TABLES = [
  'usuarios',
  'usuario_revisores',
  'categorias',
  'gastos',
  'divisas',
  'ingresos',
  'divisas_historial',
];

const tableName = (t) => (typeof t === 'string' ? t : t.tableName ?? t.name ?? Object.values(t)[0]);

/**
 * Crea las tablas que falten (CREATE TABLE IF NOT EXISTS; nunca borra ni
 * altera tablas existentes) y devuelve cuáles siguen faltando.
 */
export async function migrate() {
  await sequelize.sync();
  const tables = (await sequelize.getQueryInterface().showAllTables()).map((t) => String(tableName(t)).toLowerCase());
  return { tables, missing: REQUIRED_TABLES.filter((t) => !tables.includes(t)) };
}

export function explainMigrationError(err) {
  const code = err?.parent?.code ?? err?.original?.code ?? err?.code;
  const hint =
    code === 'ER_TABLEACCESS_DENIED_ERROR' || code === 'ER_DBACCESS_DENIED_ERROR'
      ? 'El usuario de MySQL no tiene permiso para crear tablas. Ejecuta back/db/new-tables.sql con un usuario administrador (por ejemplo en MySQL Workbench) o da permiso CREATE al usuario de la app.'
      : 'Puedes crear las tablas a mano ejecutando back/db/new-tables.sql en tu base de datos.';
  return `${err?.parent?.sqlMessage ?? err?.message ?? err}\n${hint}`;
}
