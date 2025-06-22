import { DataTypes } from 'sequelize';
import { sequelize } from '../config/index.js';

export const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  default_currency_code: { type: DataTypes.CHAR(3), allowNull: false },
}, {
  tableName: 'usuarios',
  timestamps: false,
});
