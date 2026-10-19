import { Usuario } from '../models/usuario.model.js';
import { UsuarioRevisor } from '../models/usuarioRevisor.model.js';
import { getDivisaRates } from './divisaService.js';
import { badRequest, notFound } from '../utils/errors.js';

/** Un usuario es revisor si aparece como revisor de alguien; si no, es dueño. */
export async function getRole(userId) {
  const link = await UsuarioRevisor.findOne({ where: { reviewer_id: userId } });
  return link ? 'reviewer' : 'owner';
}

/** Datos públicos del usuario de la sesión (sin hash) o null si ya no existe. */
export async function getSessionUser(userId) {
  const user = await Usuario.findByPk(userId);
  if (!user) return null;
  const { password_hash: _omit, ...rest } = user.toJSON();
  return { ...rest, role: await getRole(userId) };
}

export async function updateUserCurrency(id, code) {
  const rates = await getDivisaRates();
  if (typeof code !== 'string' || !(code in rates)) throw badRequest('Divisa inválida');
  const user = await Usuario.findByPk(id);
  if (!user) {
    throw notFound('User not found');
  }
  user.default_currency_code = code;
  await user.save();
  return getSessionUser(user.id);
}
