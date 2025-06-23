import { Divisa } from '../models/divisa.model.js';

export async function getAllDivisaCodes() {
  const divisas = await Divisa.findAll({ attributes: ['code'], order: [['code', 'ASC']] });
  return divisas.map((d) => d.code);
}
