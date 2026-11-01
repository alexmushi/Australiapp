import cron from 'node-cron';
import { Op } from 'sequelize';
import { Gasto } from '../models/gasto.model.js';

// Las fechas se guardan como medianoche UTC; se suman periodos en UTC para que
// la zona horaria del servidor no desplace el día (antes 1 jul + 1 mes = 31 jul
// en servidores con zona horaria negativa).
export function addPeriod(date, type) {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (type === 'weekly') {
    start.setUTCDate(start.getUTCDate() + 7);
    return start;
  }
  // Mensual: mismo día del mes siguiente, o el último día si no existe (31 ene -> 28 feb).
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(start.getUTCDate(), lastDay)));
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
