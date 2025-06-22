import bcrypt from 'bcrypt';
import { Usuario } from '../models/usuario.model.js';

export async function createUser({ username, password, default_currency_code }) {
  const password_hash = await bcrypt.hash(password, 10);
  const user = await Usuario.create({ username, password_hash, default_currency_code });
  return user;
}

export async function verifyUser(username, password) {
  const user = await Usuario.findOne({ where: { username } });
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  return match ? user : null;
}
