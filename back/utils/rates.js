/**
 * Libro de tipos de cambio. `current[code]` y los valores del historial son
 * unidades de `code` por 1 MXN (así los guarda el cron de divisas).
 *
 * rateAt(code, fecha) usa el último tipo de cambio registrado en o antes de esa
 * fecha. Para fechas anteriores al inicio del historial usa el primero
 * registrado (queda fijo, ya no cambia con las tasas de hoy). Sin historial,
 * usa el tipo de cambio actual.
 */
export function makeRateBook(current, historyRows = []) {
  const history = new Map();
  for (const row of historyRows) {
    const date = String(row.date).slice(0, 10);
    const value = parseFloat(row.value);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (!history.has(row.code)) history.set(row.code, []);
    history.get(row.code).push({ date, value });
  }
  for (const list of history.values()) list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  function rateAt(code, isoDate) {
    if (code === 'MXN') return 1;
    const list = history.get(code);
    if (list?.length && isoDate) {
      let lo = 0;
      let hi = list.length - 1;
      let found = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid].date <= isoDate) {
          found = mid;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      return list[found === -1 ? 0 : found].value;
    }
    const value = current[code];
    if (!value) throw new Error(`Divisa sin tipo de cambio: ${code}`);
    return value;
  }

  return {
    current,
    rateAt,
    has: (code) => code === 'MXN' || code in current,
    /** Convierte `amount` de `from` a `to` con los tipos de cambio de `isoDate`. */
    convert(amount, from, to, isoDate) {
      const val = parseFloat(amount);
      if (from === to) return val;
      const mxn = val / rateAt(from, isoDate);
      return mxn * rateAt(to, isoDate);
    },
  };
}

/** Fecha aaaa-mm-dd de un valor Date/ISO (las fechas de gastos son medianoche UTC). */
export const isoDay = (date) => (date instanceof Date ? date.toISOString() : String(date)).slice(0, 10);
