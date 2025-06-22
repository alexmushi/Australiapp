import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Divisa = sequelize.define(
  'Divisa',
  {
    code: { type: DataTypes.STRING(3), primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
  },
  {
    tableName: 'divisas',
    timestamps: false,
  }
);
