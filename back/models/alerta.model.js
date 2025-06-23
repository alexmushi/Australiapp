import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Alerta = sequelize.define(
  'Alerta',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    threshold_percentage: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'alertas',
    timestamps: false,
  }
);
