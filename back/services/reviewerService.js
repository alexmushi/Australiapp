import bcrypt from 'bcrypt';
import { sequelize } from '../config/index.js';
import { Usuario } from '../models/usuario.model.js';
import { UsuarioRevisor } from '../models/usuarioRevisor.model.js';
import { badRequest, notFound } from '../utils/errors.js';

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,50}$/;
export const MIN_PASSWORD = 8;

/** Revisores (solo lectura) del dueño. */
export async function listReviewers(ownerId) {
  const links = await UsuarioRevisor.findAll({ where: { user_id: ownerId } });
  const out = [];
  for (const link of links) {
    const u = await Usuario.findByPk(link.reviewer_id);
    if (u) out.push({ id: u.id, username: u.username });
  }
  return out.sort((a, b) => a.username.localeCompare(b.username));
}

/** Crea una cuenta de revisor con su contraseña y la liga al dueño. */
export async function createReviewer(owner, { username, password } = {}) {
  const name = typeof username === 'string' ? username.trim() : '';
  if (!USERNAME_RE.test(name)) {
    throw badRequest('El usuario debe tener de 3 a 50 letras, números, puntos, guiones o guiones bajos');
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    throw badRequest(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
  }
  if (await Usuario.findOne({ where: { username: name } })) {
    throw badRequest('Ese nombre de usuario ya existe');
  }
  const password_hash = await bcrypt.hash(password, 10);
  return sequelize.transaction(async (transaction) => {
    const user = await Usuario.create(
      { username: name, password_hash, default_currency_code: owner.default_currency_code },
      { transaction }
    );
    await UsuarioRevisor.create({ user_id: owner.id, reviewer_id: user.id }, { transaction });
    return { id: user.id, username: user.username };
  });
}

/** Quita al revisor y borra su cuenta (no tiene datos propios). */
export async function deleteReviewer(ownerId, reviewerId) {
  const id = Number(reviewerId);
  const link = await UsuarioRevisor.findOne({ where: { user_id: ownerId, reviewer_id: id } });
  if (!link) throw notFound('Revisor no encontrado');
  await sequelize.transaction(async (transaction) => {
    await UsuarioRevisor.destroy({ where: { user_id: ownerId, reviewer_id: id }, transaction });
    const others = await UsuarioRevisor.findOne({ where: { reviewer_id: id }, transaction });
    if (!others) await Usuario.destroy({ where: { id }, transaction });
  });
  return { deleted: true };
}
