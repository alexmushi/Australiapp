import { getMonthStatus } from './reportService.js';
import { APP_TIME_ZONE, currentMonth } from '../utils/months.js';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const label = (m) => `${MONTHS[m.month - 1]} ${m.year}`;
const key = (m) => `${m.year}-${String(m.month).padStart(2, '0')}`;

/** Porcentaje transcurrido del mes en curso (hora de Sídney). */
export function monthProgress(now = new Date()) {
  const { year, month } = currentMonth(now);
  const day = Number(now.toLocaleDateString('en-CA', { timeZone: APP_TIME_ZONE }).slice(8, 10));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { day, days, percentage: (day / days) * 100 };
}

/**
 * Notificaciones calculadas a partir de los datos del mes actual. Cada una
 * tiene un id estable para poder marcarla como leída en el cliente.
 */
export async function getNotifications(currency = 'MXN', now = new Date()) {
  const status = await getMonthStatus(undefined, currency, now);
  const cur = { year: status.year, month: status.month };
  const prev = { year: status.previous[1].year, month: status.previous[1].month };
  const list = [];

  if (!status.hasIncome) {
    list.push({
      id: `missing-income-${key(cur)}`,
      severity: 'warning',
      title: 'Falta tu ingreso del mes',
      message: `Registra lo que ganaste en ${label(prev)} para calcular tu presupuesto de ${label(cur)}.`,
      action: 'income',
    });
  } else {
    const used = status.spending > 0 ? (status.spent / status.spending) * 100 : 100;
    const { percentage: elapsed } = monthProgress(now);
    if (status.remaining < -0.004) {
      list.push({
        id: `over-${key(cur)}`,
        severity: 'critical',
        title: 'Te pasaste del 50%',
        message: `Ya gastaste más de lo disponible para ${label(cur)}.`,
        action: 'home',
      });
    } else if (used >= 80) {
      list.push({
        id: `pool-80-${key(cur)}`,
        severity: 'warning',
        title: `Llevas ${Math.round(used)}% del dinero para gastos`,
        message: `Te queda poco para ${label(cur)}.`,
        action: 'home',
      });
    } else if (used - elapsed >= 15) {
      list.push({
        id: `pace-${key(cur)}`,
        severity: 'info',
        title: 'Vas gastando rápido',
        message: `Llevas ${Math.round(used)}% del dinero con ${Math.round(elapsed)}% del mes transcurrido.`,
        action: 'home',
      });
    }
  }

  if (status.overspentStreak) {
    list.push({
      id: `streak-${key(cur)}`,
      severity: 'critical',
      title: 'Dos meses seguidos por encima del 50%',
      message: `Te pasaste en ${label(status.previous[0])} y ${label(status.previous[1])}.`,
      action: 'home',
    });
  }
  return list;
}
