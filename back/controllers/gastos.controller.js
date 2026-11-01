import { createGasto } from '../services/gastoService.js';
import { sendError } from '../utils/errors.js';

export async function createGastoController(req, res) {
  try {
    const gasto = await createGasto(req.body);
    res.json(gasto);
  } catch (err) {
    sendError(res, err);
  }
}
