import { getSummary, getHistoricalTable } from '../services/reportService.js';
import { sendError } from '../utils/errors.js';

export async function summaryController(req, res) {
  const { range = 'month', currency = 'MXN', month } = req.query;
  try {
    const data = await getSummary(range, currency, month);
    res.json(data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function summaryTableController(req, res) {
  const { currency = 'MXN' } = req.query;
  try {
    const data = await getHistoricalTable(currency);
    res.json(data);
  } catch (err) {
    sendError(res, err);
  }
}
