import { getNotifications } from '../services/notificationService.js';
import { sendError } from '../utils/errors.js';

export async function listNotificaciones(req, res) {
  try {
    res.json(await getNotifications(req.query.currency || req.user.default_currency_code));
  } catch (err) {
    sendError(res, err);
  }
}
