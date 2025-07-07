import { getAllDivisaCodes, getAllDivisaRates } from '../services/divisaService.js';

export async function listDivisaCodes(req, res) {
  try {
    const codes = await getAllDivisaCodes();
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listDivisaRates(req, res) {
  try {
    const rates = await getAllDivisaRates();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
