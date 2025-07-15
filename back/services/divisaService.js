import { Divisa } from '../models/divisa.model.js';

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

export async function updateDivisaValues(rates) {
  for (const [code, value] of Object.entries(rates)) {
    await Divisa.update({ value }, { where: { code } });
  }
}