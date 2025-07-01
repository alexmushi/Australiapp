import { getDashboardData } from '../services/dashboardService.js';

export async function dashboardController(req, res) {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end parameters required' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const data = await getDashboardData(startDate, endDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
