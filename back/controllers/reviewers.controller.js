import { createReviewer, deleteReviewer, listReviewers } from '../services/reviewerService.js';
import { sendError } from '../utils/errors.js';

export async function listReviewersController(req, res) {
  try {
    res.json(await listReviewers(req.user.id));
  } catch (err) {
    sendError(res, err);
  }
}

export async function createReviewerController(req, res) {
  try {
    res.json(await createReviewer(req.user, req.body));
  } catch (err) {
    sendError(res, err);
  }
}

export async function deleteReviewerController(req, res) {
  try {
    res.json(await deleteReviewer(req.user.id, req.params.id));
  } catch (err) {
    sendError(res, err);
  }
}
