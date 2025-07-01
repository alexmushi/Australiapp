import { getDashboardData } from '../services/dashboardService.js';

export async function getDashboard(req, res) {
  try {
    const period = req.query.period || 'this_month';
    const data = await getDashboardData(period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
