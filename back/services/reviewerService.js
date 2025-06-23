import { Usuario } from '../models/usuario.model.js';
import { UsuarioRevisor } from '../models/usuarioRevisor.model.js';

export async function addReviewer({ user_id, reviewer_username }) {
  const reviewer = await Usuario.findOne({ where: { username: reviewer_username } });
  if (!reviewer) {
    throw new Error('Reviewer not found');
  }
  const existing = await UsuarioRevisor.findOne({ where: { user_id, reviewer_id: reviewer.id } });
  if (existing) {
    throw new Error('Reviewer already added');
  }
  const relation = await UsuarioRevisor.create({ user_id, reviewer_id: reviewer.id });
  return relation.toJSON();
}