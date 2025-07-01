import { sequelize } from '../config/index.js';
import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';

export async function createCategoryWithBudget(data) {
  const { name, description, recurring, currency_code } = data;
  return sequelize.transaction(async (t) => {
    const category = await Categoria.create({ name, description }, { transaction: t });

    if (recurring) {
      const { amount, start_month, start_year, end_month, end_year } = data;
      if (
        amount == null ||
        start_month == null ||
        start_year == null ||
        end_month == null ||
        end_year == null ||
        !currency_code
      ) {
        throw new Error('Missing fields for recurring budget');
      }
      const endDate = new Date(Number(end_year), Number(end_month) - 1, 1);
      await Presupuesto.create(
        {
          category_id: category.id,
          amount,
          currency_code,
          period_month: Number(start_month),
          period_year: Number(start_year),
          recurring: true,
          recurrence_end_date: endDate,
        },
        { transaction: t }
      );
    } else {
      if (!Array.isArray(data.budgets) || data.budgets.length === 0) {
        throw new Error('No budgets provided');
      }
      for (const b of data.budgets) {
        const { amount, month, year } = b;
        if (amount == null || month == null || year == null || !currency_code) {
          throw new Error('Invalid budget entry');
        }
        await Presupuesto.create(
          {
            category_id: category.id,
            amount,
            currency_code,
            period_month: Number(month),
            period_year: Number(year),
            recurring: false,
          },
          { transaction: t }
        );
      }
    }
    return category.toJSON();
  });
}
export async function listCategorias() {
  const categorias = await Categoria.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });
  return categorias.map((c) => c.toJSON());
}
