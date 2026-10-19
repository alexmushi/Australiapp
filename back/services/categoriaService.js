import { Categoria } from '../models/categoria.model.js';
import { badRequest } from '../utils/errors.js';

/** Crea una categoría. Ya no lleva presupuesto: todos los gastos salen del mismo 50%. */
export async function createCategory(data = {}) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) throw badRequest('El nombre es obligatorio');
  if (name.length > 50) throw badRequest('El nombre no puede tener más de 50 caracteres');
  const description =
    typeof data.description === 'string' && data.description.trim()
      ? data.description.trim().slice(0, 255)
      : null;

  const existing = await Categoria.findAll({ attributes: ['id', 'name'] });
  if (existing.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
    throw badRequest('Ya existe una categoría con ese nombre');
  }
  const category = await Categoria.create({ name, description });
  return category.toJSON();
}

export async function getAllCategories() {
  const categories = await Categoria.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  return categories.map((c) => ({ id: c.id, name: c.name }));
}
