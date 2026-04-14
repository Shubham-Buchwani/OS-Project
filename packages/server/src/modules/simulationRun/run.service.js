import { SimulationRun } from '../../models/SimulationRun.js';
import { AuditLog } from '../../models/AuditLog.js';
import { ApiError } from '../../utils/ApiError.js';

export async function listRuns(userId, query) {
  const { page = 1, limit = 20, isSaved } = query;
  const skip = (page - 1) * limit;
  const filter = { userId };
  if (isSaved !== undefined) filter.isSaved = isSaved === 'true';

  const [runs, totalCount] = await Promise.all([
    SimulationRun.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-steps') // exclude heavy steps from listing
      .populate('simulationId', 'title module algorithm difficulty')
      .lean(),
    SimulationRun.countDocuments(filter),
  ]);
  return { data: runs, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) } };
}

export async function getRun(runId, userId) {
  const run = await SimulationRun.findById(runId)
    .populate('simulationId', 'title module algorithm difficulty description')
    .lean();
  if (!run) throw ApiError.notFound('Simulation run');
  if (run.userId.toString() !== userId) throw ApiError.forbidden();
  return run;
}

export async function updateRun(runId, userId, dto) {
  const run = await SimulationRun.findById(runId);
  if (!run) throw ApiError.notFound('Simulation run');
  if (run.userId.toString() !== userId) throw ApiError.forbidden();

  if (dto.userNotes !== undefined) run.userNotes = dto.userNotes;
  if (dto.isSaved !== undefined) {
    run.isSaved = dto.isSaved;
    if (dto.isSaved) await AuditLog.create({ userId, action: 'RUN_SAVED', resource: `run:${runId}` });
  }
  await run.save();
  return run;
}

export async function deleteRun(runId, userId) {
  const run = await SimulationRun.findById(runId);
  if (!run) throw ApiError.notFound('Simulation run');
  if (run.userId.toString() !== userId) throw ApiError.forbidden();
  await run.deleteOne();
  await AuditLog.create({ userId, action: 'RUN_DELETED', resource: `run:${runId}` });
}

export async function getRunSteps(runId, userId, query) {
  const { page = 1, limit = 50 } = query;
  const run = await SimulationRun.findById(runId).select('userId steps stepCount').lean();
  if (!run) throw ApiError.notFound('Simulation run');
  if (run.userId.toString() !== userId) throw ApiError.forbidden();

  const skip = (page - 1) * limit;
  const steps = run.steps.slice(skip, skip + limit);
  return { data: steps, pagination: { page, limit, totalCount: run.stepCount, totalPages: Math.ceil(run.stepCount / limit) } };
}
