import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Gasto = sequelize.define(
  'Gasto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency_code: { type: DataTypes.STRING(3), allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    description: { type: DataTypes.STRING(255) },
    recurring: { type: DataTypes.BOOLEAN, defaultValue: false },
    recurrence_type: { type: DataTypes.STRING(20) },
    recurrence_end_date: { type: DataTypes.DATE },
  },
  {
    tableName: 'gastos',
    timestamps: false,
  }
);
