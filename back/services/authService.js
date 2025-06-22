import bcrypt from 'bcrypt';
import { Usuario } from '../models/usuario.model.js';

export async function registerUser({ username, password, default_currency_code }) {
  const existing = await Usuario.findOne({ where: { username } });
  if (existing) {
    throw new Error('Username already exists');
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = await Usuario.create({ username, password_hash, default_currency_code });
  return user.toJSON();
}

export async function loginUser({ username, password }) {
  const user = await Usuario.findOne({ where: { username } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid credentials');
  }
  return user.toJSON();
}