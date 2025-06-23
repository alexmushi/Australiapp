import { createCategoryWithBudget } from '../services/categoriaService.js';

export async function createCategoria(req, res) {
  try {
    const categoria = await createCategoryWithBudget(req.body);
    res.json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
