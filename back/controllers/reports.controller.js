import {
  getSummary,
  getCategoryDetail,
  getHistoricalTable,
} from '../services/reportService.js';

export async function summaryController(req, res) {
  const { range = 'month' } = req.query;
  try {
    const data = await getSummary(range);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function categoryController(req, res) {
  const { range = 'month' } = req.query;
  const { id } = req.params;
  try {
    const data = await getCategoryDetail(id, range);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function summaryTableController(req, res) {
  try {
    const data = await getHistoricalTable();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}