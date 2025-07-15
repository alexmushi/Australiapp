import { createCategoryWithBudget, getAllCategories } from '../services/categoriaService.js';

export async function createCategoria(req, res) {
  try {
    const categoria = await createCategoryWithBudget(req.body);
    res.json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listCategorias(req, res) {
  try {
    const categorias = await getAllCategories();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
