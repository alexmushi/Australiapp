import cron from 'node-cron';
import { Op } from 'sequelize';
import { Gasto } from '../models/gasto.model.js';

function addPeriod(date, type) {
  const d = new Date(date);
  if (type === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  // normalize to YYYY-MM-DD for comparison
  return new Date(d.toISOString().split('T')[0]);
}

export function startRecurringExpenseJob() {
  cron.schedule('0 0 * * *', async () => {
    const today = new Date();
    try {
      const gastos = await Gasto.findAll({ where: { recurring: true } });
      for (const g of gastos) {
        let lastRecord = await Gasto.findOne({
          where: {
            recurring: true,
            amount: g.amount,
            currency_code: g.currency_code,
            category_id: g.category_id,
            description: g.description,
            recurrence_type: g.recurrence_type,
            recurrence_end_date: g.recurrence_end_date,
            date: { [Op.lte]: today },
          },
          order: [['date', 'DESC']],
        });
        if (!lastRecord) continue;
        let nextDate = addPeriod(lastRecord.date, g.recurrence_type);
        while (
          nextDate <= today &&
          (!g.recurrence_end_date || nextDate <= g.recurrence_end_date)
        ) {
          const exists = await Gasto.findOne({
            where: {
              recurring: true,
              amount: g.amount,
              currency_code: g.currency_code,
              category_id: g.category_id,
              description: g.description,
              recurrence_type: g.recurrence_type,
              recurrence_end_date: g.recurrence_end_date,
              date: nextDate,
            },
          });
          if (!exists) {
            await Gasto.create({
              amount: g.amount,
              currency_code: g.currency_code,
              category_id: g.category_id,
              date: nextDate,
              description: g.description,
              recurring: true,
              recurrence_type: g.recurrence_type,
              recurrence_end_date: g.recurrence_end_date,
            });
          }
          nextDate = addPeriod(nextDate, g.recurrence_type);
        }
      }
    } catch (err) {
      console.error('Recurring expense job failed', err);
    }
  });
}
