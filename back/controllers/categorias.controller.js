import { createCategoryWithBudgets } from '../services/categoriaService.js';

export async function createCategory(req, res) {
  try {
    const category = await createCategoryWithBudgets(req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
