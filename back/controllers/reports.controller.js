import {
  getSummary,
  getCategoryDetail,
  getHistoricalTable,
} from '../services/reportService.js';

export async function summaryController(req, res) {
  const { range = 'month', currency = 'MXN' } = req.query;
  try {
    const data = await getSummary(range, currency);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function categoryController(req, res) {
  const { range = 'month', currency = 'MXN' } = req.query;
  const { id } = req.params;
  try {
    const data = await getCategoryDetail(id, range, currency);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function summaryTableController(req, res) {
  const { currency = 'MXN' } = req.query;
  try {
    const data = await getHistoricalTable(currency);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}