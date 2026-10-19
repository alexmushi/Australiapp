import { createCategory, getAllCategories } from '../services/categoriaService.js';
import { sendError } from '../utils/errors.js';

export async function createCategoria(req, res) {
  try {
    const categoria = await createCategory(req.body);
    res.json(categoria);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listCategorias(req, res) {
  try {
    const categorias = await getAllCategories();
    res.json(categorias);
  } catch (err) {
    sendError(res, err);
  }
}
