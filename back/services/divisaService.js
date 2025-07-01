import { Divisa } from '../models/divisa.model.js';

export async function getAllDivisaCodes() {
  const divisas = await Divisa.findAll({ attributes: ['code'], order: [['code', 'ASC']] });
  return divisas.map((d) => d.code);
}

export async function updateDivisaValues(rates) {
  for (const [code, value] of Object.entries(rates)) {
    await Divisa.update({ value }, { where: { code } });
  }
}