import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '../services/categoriaService.js';
import { sendError } from '../utils/errors.js';

export async function createCategoria(req, res) {
  try {
    res.json(await createCategory(req.body));
  } catch (err) {
    sendError(res, err);
  }
}

export async function listCategorias(req, res) {
  try {
    res.json(await getAllCategories());
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateCategoria(req, res) {
  try {
    res.json(await updateCategory(req.params.id, req.body));
  } catch (err) {
    sendError(res, err);
  }
}

export async function deleteCategoria(req, res) {
  try {
    res.json(await deleteCategory(req.params.id));
  } catch (err) {
    sendError(res, err);
  }
}
