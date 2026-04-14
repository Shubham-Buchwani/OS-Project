import { Progress } from '../../models/Progress.js';
import { SimulationRun } from '../../models/SimulationRun.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getProgress(userId) {
  const progress = await Progress.getOrCreate(userId);
  return progress;
}

export async function getLeaderboard(limit = 10) {
  const leaders = await Progress.find()
    .sort({ overallCompletionPercent: -1, totalSimulationsRun: -1 })
    .limit(limit)
    .populate('userId', 'displayName avatarUrl')
    .lean();
  return leaders;
}

export async function getPlatformStats() {
  const [totalUsers, totalRuns, moduleBreakdown] = await Promise.all([
    Progress.countDocuments(),
    SimulationRun.countDocuments({ status: 'completed' }),
    SimulationRun.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'simulations', localField: 'simulationId', foreignField: '_id', as: 'sim' } },
      { $unwind: '$sim' },
      { $group: { _id: '$sim.module', count: { $sum: 1 } } },
    ]),
  ]);
  return { totalUsers, totalRuns, moduleBreakdown };
}
