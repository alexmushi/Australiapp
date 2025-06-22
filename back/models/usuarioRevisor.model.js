import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const UsuarioRevisor = sequelize.define(
  'UsuarioRevisor',
  {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    reviewer_id: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: 'usuario_revisores',
    timestamps: false,
  }
);