import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

/**
 * Tipo de cambio de cada divisa por día (unidades de la divisa por 1 MXN).
 * Permite convertir cada gasto con el tipo de cambio de su fecha, para que
 * un cambio futuro en las tasas no altere el historial.
 */
export const DivisaHistorial = sequelize.define(
  'DivisaHistorial',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(3), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    value: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  },
  {
    tableName: 'divisas_historial',
    timestamps: false,
    indexes: [{ unique: true, fields: ['code', 'date'] }],
  }
);
