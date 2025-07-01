import { getSummary } from '../services/reportService.js';

export async function summaryController(req, res) {
  const { range = 'month' } = req.query;
  try {
    const data = await getSummary(range);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
