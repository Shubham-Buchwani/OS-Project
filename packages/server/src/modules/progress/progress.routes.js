import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../utils/ApiError.js';
import * as progressService from './progress.service.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const progress = await progressService.getProgress(req.user.id);
  res.json({ data: progress });
}));

router.get('/leaderboard', asyncHandler(async (req, res) => {
  const leaders = await progressService.getLeaderboard(10);
  res.json({ data: leaders });
}));

router.get('/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await progressService.getPlatformStats();
  res.json({ data: stats });
}));

export default router;
