import {
  getAllDivisaCodes,
  getAllDivisas,
} from '../services/divisaService.js';

export async function listDivisaCodes(req, res) {
  try {
    const codes = await getAllDivisaCodes();
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listDivisas(req, res) {
  try {
    const divisas = await getAllDivisas();
    res.json(divisas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
