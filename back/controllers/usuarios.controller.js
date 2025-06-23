import { updateUserCurrency } from '../services/usuarioService.js';

export async function updateCurrency(req, res) {
  try {
    const user = await updateUserCurrency(req.params.id, req.body.code);
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}