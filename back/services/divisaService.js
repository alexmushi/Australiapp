import { Divisa } from '../models/divisa.model.js';
import { DivisaHistorial } from '../models/divisaHistorial.model.js';
import { makeRateBook } from '../utils/rates.js';
import { APP_TIME_ZONE } from '../utils/months.js';

export async function getAllDivisaCodes() {
  const divisas = await Divisa.findAll({ attributes: ['code'], order: [['code', 'ASC']] });
  return divisas.map((d) => d.code);
}

export async function getAllDivisas() {
  const divisas = await Divisa.findAll({
    attributes: ['code', 'name', 'value'],
    order: [['code', 'ASC']],
  });
  return divisas.map((d) => d.toJSON());
}

export async function getDivisaRates() {
  const divisas = await Divisa.findAll({ attributes: ['code', 'value'] });
  const rates = {};
  for (const d of divisas) {
    rates[d.code] = parseFloat(d.value);
  }
  return rates;
}

/** Tipos de cambio actuales más el historial diario. */
export async function getRateBook() {
  const [current, history] = await Promise.all([
    getDivisaRates(),
    DivisaHistorial.findAll({ attributes: ['code', 'date', 'value'] }),
  ]);
  return makeRateBook(current, history);
}

const todayISO = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: APP_TIME_ZONE });

/** Guarda (o reemplaza) el tipo de cambio del día para cada divisa. */
async function snapshot(rates, now) {
  const date = todayISO(now);
  for (const [code, value] of Object.entries(rates)) {
    if (!Number.isFinite(Number(value)) || Number(value) <= 0) continue;
    const existing = await DivisaHistorial.findOne({ where: { code, date } });
    if (existing) await existing.update({ value });
    else await DivisaHistorial.create({ code, date, value });
  }
}

export async function updateDivisaValues(rates, now = new Date()) {
  for (const [code, value] of Object.entries(rates)) {
    await Divisa.update({ value }, { where: { code } });
  }
  await snapshot(rates, now);
}

/**
 * Al arrancar, registra el tipo de cambio de hoy si aún no existe. La primera
 * vez fija el tipo de cambio de todo el historial anterior.
 */
export async function ensureRateSnapshot(now = new Date()) {
  const date = todayISO(now);
  const rates = await getDivisaRates();
  const missing = {};
  for (const [code, value] of Object.entries(rates)) {
    if (!(await DivisaHistorial.findOne({ where: { code, date } }))) missing[code] = value;
  }
  await snapshot(missing, now);
}
