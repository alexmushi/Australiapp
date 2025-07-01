import { createCategoryWithBudget, listAllCategories } from '../services/categoriaService.js';

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
    const cats = await listAllCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
