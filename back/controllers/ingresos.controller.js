import { deleteIngreso, listIngresos, upsertIngreso } from '../services/ingresoService.js';
import { sendError } from '../utils/errors.js';

export async function listIngresosController(req, res) {
  try {
    res.json(await listIngresos());
  } catch (err) {
    sendError(res, err);
  }
}

export async function upsertIngresoController(req, res) {
  try {
    res.json(await upsertIngreso(req.params.year, req.params.month, req.body));
  } catch (err) {
    sendError(res, err);
  }
}

export async function deleteIngresoController(req, res) {
  try {
    res.json(await deleteIngreso(req.params.year, req.params.month));
  } catch (err) {
    sendError(res, err);
  }
}
