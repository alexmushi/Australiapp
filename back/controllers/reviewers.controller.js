import { addReviewer } from '../services/reviewerService.js';

export async function createReviewer(req, res) {
  try {
    const relation = await addReviewer(req.body);
    res.json(relation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}