import { verifyToken } from '../utils/auth.js';
import { getSessionUser } from '../services/usuarioService.js';

/** Exige una sesión válida y deja el usuario en req.user. */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const uid = verifyToken(token);
  if (!uid) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  try {
    const user = await getSessionUser(uid);
    if (!user) return res.status(401).json({ error: 'Sesión inválida o expirada' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Los revisores solo pueden leer. La única escritura permitida es cambiar su
 * propia divisa de visualización.
 */
export function readOnlyForReviewers(req, res, next) {
  if (req.user?.role !== 'reviewer' || READ_METHODS.has(req.method)) return next();
  const ownCurrency = req.method === 'PUT' && req.path === `/users/${req.user.id}/currency`;
  if (ownCurrency) return next();
  return res.status(403).json({ error: 'Los revisores solo pueden consultar' });
}

/** Solo para el dueño de la cuenta (no revisores). */
export function requireOwner(req, res, next) {
  if (req.user?.role === 'owner') return next();
  return res.status(403).json({ error: 'Solo el dueño de la cuenta puede hacer esto' });
}
