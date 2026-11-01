import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

/**
 * Ingreso que financia un mes. period_* es el mes al que se aplica el
 * reparto 30/20/50 (lo ganado el mes anterior). Uno por mes.
 */
export const Ingreso = sequelize.define(
  'Ingreso',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency_code: { type: DataTypes.STRING(3), allowNull: false },
    period_month: { type: DataTypes.INTEGER, allowNull: false },
    period_year: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING(255) },
  },
  {
    tableName: 'ingresos',
    timestamps: false,
    indexes: [{ unique: true, fields: ['period_year', 'period_month'] }],
  }
);
