/** Error con código HTTP para devolverlo tal cual desde los controladores. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message) => new HttpError(404, message);

/** Responde con el código del error (400 por defecto para errores de validación). */
export function sendError(res, err, fallbackStatus = 500) {
  const status = err instanceof HttpError ? err.status : fallbackStatus;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message });
}
