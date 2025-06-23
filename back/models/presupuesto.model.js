import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Presupuesto = sequelize.define(
  'Presupuesto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency_code: { type: DataTypes.STRING(3), allowNull: false },
    period_month: { type: DataTypes.INTEGER, allowNull: false },
    period_year: { type: DataTypes.INTEGER, allowNull: false },
    recurring: { type: DataTypes.BOOLEAN, defaultValue: false },
    recurrence_end_date: { type: DataTypes.DATE },
  },
  {
    tableName: 'presupuestos',
    timestamps: false,
  }
);