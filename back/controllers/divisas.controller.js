import { getAllDivisaCodes, getAllDivisas } from '../services/divisaService.js';

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
    const data = await getAllDivisas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
