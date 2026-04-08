import { Simulation } from '../../models/Simulation.js';
import { SimulationRun } from '../../models/SimulationRun.js';
import { Progress } from '../../models/Progress.js';
import { AuditLog } from '../../models/AuditLog.js';
import { ApiError } from '../../utils/ApiError.js';
import { run as engineRun } from '@os-sim/engine';
import { getRedis } from '../../config/redis.js';
import crypto from 'crypto';

// ─── Simulation Templates ────────────────────────────────────────────────────

export async function listSimulations(query) {
  const { module, algorithm, difficulty, page = 1, limit = 20, tags } = query;

  const filter = { isPublished: true };
  if (module) filter.module = module;
  if (algorithm) filter.algorithm = algorithm;
  if (difficulty) filter.difficulty = difficulty;
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };

  const skip = (page - 1) * limit;
  const [sims, totalCount] = await Promise.all([
    Simulation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-defaultConfig') // exclude heavy config from listing
      .lean(),
    Simulation.countDocuments(filter),
  ]);

  return { data: sims, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) } };
}

export async function getSimulation(id) {
  const sim = await Simulation.findOne({ _id: id, isPublished: true }).lean();
  if (!sim) throw ApiError.notFound('Simulation');
  return sim;
}

export async function createSimulation(dto, userId) {
  const sim = await Simulation.create({ ...dto, createdBy: userId });
  await AuditLog.create({ userId, action: 'SIMULATION_CREATE', resource: `simulation:${sim._id}` });
  return sim;
}

export async function updateSimulation(id, dto, userId) {
  const sim = await Simulation.findById(id);
  if (!sim) throw ApiError.notFound('Simulation');
  if (sim.createdBy.toString() !== userId) throw ApiError.forbidden();
  Object.assign(sim, dto);
  sim.version += 1;
  await sim.save();
  await AuditLog.create({ userId, action: 'SIMULATION_UPDATE', resource: `simulation:${sim._id}` });
  return sim;
}

export async function deleteSimulation(id, userId) {
  const sim = await Simulation.findById(id);
  if (!sim) throw ApiError.notFound('Simulation');
  // Soft delete: mark as unpublished
  sim.isPublished = false;
  await sim.save();
  await AuditLog.create({ userId, action: 'SIMULATION_DELETE', resource: `simulation:${sim._id}` });
}

// ─── Simulation Execution ────────────────────────────────────────────────────

export async function runSimulation(simId, config, userId) {
  const sim = await Simulation.findById(simId);
  if (!sim) throw ApiError.notFound('Simulation');

  // Check engine result cache (Redis) — same config hash = instant result
  const configHash = crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex');
  const cacheKey = `sim:run:${sim.module}:${configHash}`;
  const redis = getRedis();

  let engineResult = null;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) engineResult = JSON.parse(cached);
  } catch (_) { /* Redis failure is non-fatal */ }

  const startedAt = new Date();

  // Create run document
  const runDoc = await SimulationRun.create({
    userId,
    simulationId: simId,
    config,
    status: 'running',
    startedAt,
  });

  try {
    if (!engineResult) {
      engineResult = engineRun(sim.module, config);
      // Cache for 1 hour
      try {
        await redis.set(cacheKey, JSON.stringify(engineResult), 'EX', 3600);
      } catch (_) { /* non-fatal */ }
    }

    const completedAt = new Date();
    runDoc.status = 'completed';
    runDoc.steps = engineResult.steps || [];
    runDoc.stepCount = (engineResult.steps || []).length;
    runDoc.metrics = engineResult.metrics || null;
    runDoc.result = {
      ganttChart: engineResult.ganttChart,
      completedProcesses: engineResult.completedProcesses,
      seekSequence: engineResult.seekSequence,
      finalBitmap: engineResult.finalBitmap,
      fileTable: engineResult.fileTable,
      need: engineResult.need,
      safeSequence: engineResult.safeSequence,
      requestResults: engineResult.requestResults,
      adjacencyList: engineResult.adjacencyList,
    };
    runDoc.completedAt = completedAt;
    runDoc.durationMs = completedAt - startedAt;
    await runDoc.save();

    // Update simulation run count
    await Simulation.findByIdAndUpdate(simId, { $inc: { runCount: 1 } });

    // Update user progress
    const progress = await Progress.getOrCreate(userId);
    await progress.recordRun(sim.module, sim.algorithm);

    await AuditLog.create({ userId, action: 'SIMULATION_RUN', resource: `simulation:${simId}`, metadata: { runId: runDoc._id, module: sim.module, algorithm: sim.algorithm } });

    return runDoc;
  } catch (err) {
    runDoc.status = 'failed';
    runDoc.errorMessage = err.message;
    await runDoc.save();
    throw ApiError.internal(`Simulation engine error: ${err.message}`);
  }
}

export async function listRunsForSimulation(simId, userId, query) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const [runs, totalCount] = await Promise.all([
    SimulationRun.find({ userId, simulationId: simId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-steps')
      .lean(),
    SimulationRun.countDocuments({ userId, simulationId: simId }),
  ]);
  return { data: runs, pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) } };
}
