import { vi } from 'vitest';

/**
 * Sustituye fetch por un router de rutas -> respuestas.
 * routes: { 'GET /api/x': data | (req) => data | { status, body } }
 */
export function mockFetch(routes) {
  const calls = [];
  const fn = vi.fn(async (url, opts = {}) => {
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : undefined;
    calls.push({ method, url, body });
    const path = url.split('?')[0];
    const handler =
      routes[`${method} ${url}`] ?? routes[`${method} ${path}`] ?? routes[`${method} *`];
    if (handler === undefined) {
      return { ok: false, status: 404, json: async () => ({ error: `No route ${method} ${url}` }) };
    }
    let result = typeof handler === 'function' ? await handler({ url, method, body }) : handler;
    if (result && result.__status) {
      return { ok: result.__status < 400, status: result.__status, json: async () => result.body };
    }
    return { ok: true, status: 200, json: async () => result };
  });
  globalThis.fetch = fn;
  return { fn, calls };
}

export const fail = (status, body = {}) => ({ __status: status, body });
