import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Categoria = sequelize.define(
  'Categoria',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.STRING(255) },
  },
  {
    tableName: 'categorias',
    timestamps: false,
  }
);
