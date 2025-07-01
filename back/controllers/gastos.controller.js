import { createGasto } from '../services/gastoService.js';

export async function createGastoController(req, res) {
  try {
    const gasto = await createGasto(req.body);
    res.json(gasto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
