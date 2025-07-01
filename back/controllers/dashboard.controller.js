import { getCategoryStats } from '../services/dashboardService.js';

export async function dashboardData(req, res) {
  try {
    let { start, end } = req.query;
    const today = new Date();
    if (!start) {
      start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    } else {
      start = new Date(start);
    }
    if (!end) {
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
    } else {
      end = new Date(end);
    }
    const categories = await getCategoryStats(start, end);
    const totalBudget = categories.reduce((a, c) => a + c.budget, 0);
    const totalExpenses = categories.reduce((a, c) => a + c.expenses, 0);
    res.json({ categories, totalBudget, totalExpenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
