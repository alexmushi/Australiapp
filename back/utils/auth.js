import crypto from 'node:crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

let generatedSecret;

/**
 * Secreto para firmar sesiones. Debe definirse AUTH_SECRET en .env; si falta se
 * genera uno temporal (las sesiones se pierden al reiniciar el servidor).
 */
function getSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!generatedSecret) {
    generatedSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ AUTH_SECRET no está definido: las sesiones se cerrarán al reiniciar el servidor.');
  }
  return generatedSecret;
}

const sign = (data) => crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');

/** Token firmado (HMAC-SHA256) con el id de usuario y su expiración. */
export function signToken(userId, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: now + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** Devuelve el id de usuario si el token es válido y no ha expirado; si no, null. */
export function verifyToken(token, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(uid) || typeof exp !== 'number' || exp <= now) return null;
    return uid;
  } catch {
    return null;
  }
}
