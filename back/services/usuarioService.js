import { Usuario } from '../models/usuario.model.js';

export async function updateUserCurrency(id, code) {
  const user = await Usuario.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  user.default_currency_code = code;
  await user.save();
  return user.toJSON();
}