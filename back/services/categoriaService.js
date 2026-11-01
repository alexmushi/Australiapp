import { Categoria } from '../models/categoria.model.js';
import { Gasto } from '../models/gasto.model.js';
import { badRequest, HttpError, notFound } from '../utils/errors.js';

function parseFields(data = {}) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) throw badRequest('El nombre es obligatorio');
  if (name.length > 50) throw badRequest('El nombre no puede tener más de 50 caracteres');
  const description =
    typeof data.description === 'string' && data.description.trim()
      ? data.description.trim().slice(0, 255)
      : null;
  return { name, description };
}

async function assertUniqueName(name, exceptId) {
  const existing = await Categoria.findAll({ attributes: ['id', 'name'] });
  if (existing.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.toLowerCase())) {
    throw badRequest('Ya existe una categoría con ese nombre');
  }
}

/** Crea una categoría. Ya no lleva presupuesto: todos los gastos salen del mismo 50%. */
export async function createCategory(data) {
  const fields = parseFields(data);
  await assertUniqueName(fields.name);
  const category = await Categoria.create(fields);
  return category.toJSON();
}

export async function updateCategory(id, data) {
  const category = await Categoria.findByPk(Number(id));
  if (!category) throw notFound('Categoría no encontrada');
  const fields = parseFields(data);
  await assertUniqueName(fields.name, category.id);
  await category.update(fields);
  return { id: category.id, ...fields };
}

/** Solo se puede borrar una categoría sin gastos, para no perder historial. */
export async function deleteCategory(id) {
  const category = await Categoria.findByPk(Number(id));
  if (!category) throw notFound('Categoría no encontrada');
  const count = await Gasto.count({ where: { category_id: category.id } });
  if (count > 0) {
    throw new HttpError(409, `No se puede eliminar: tiene ${count} ${count === 1 ? 'gasto' : 'gastos'} registrados`);
  }
  await Categoria.destroy({ where: { id: category.id } });
  return { deleted: true };
}

export async function getAllCategories() {
  const categories = await Categoria.findAll({
    attributes: ['id', 'name', 'description'],
    order: [['name', 'ASC']],
  });
  const out = [];
  for (const c of categories) {
    out.push({
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      expense_count: await Gasto.count({ where: { category_id: c.id } }),
    });
  }
  return out;
}
