import { Divisa } from '../models/divisa.model.js';

export async function getAllDivisaCodes() {
  const divisas = await Divisa.findAll({ attributes: ['code'], order: [['code', 'ASC']] });
  return divisas.map((d) => d.code);
}

export async function getAllDivisaRates() {
  const divisas = await Divisa.findAll({
    attributes: ['code', 'name', 'value'],
    order: [['code', 'ASC']],
  });
  return divisas.map((d) => ({
    code: d.code,
    name: d.name,
    value: parseFloat(d.value),
  }));
}

export async function updateDivisaValues(rates) {
  for (const [code, value] of Object.entries(rates)) {
    await Divisa.update({ value }, { where: { code } });
  }
}