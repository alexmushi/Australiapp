import { updateUserCurrency } from '../services/usuarioService.js';
import { sendError } from '../utils/errors.js';

export async function updateCurrency(req, res) {
  if (Number(req.params.id) !== req.user.id) {
    return res.status(403).json({ error: 'Solo puedes cambiar tu propia divisa' });
  }
  try {
    const user = await updateUserCurrency(req.user.id, req.body?.code);
    res.json(user);
  } catch (err) {
    sendError(res, err);
  }
}
