import mongoose from 'mongoose';
import { RUN_STATUS } from '@os-sim/shared';

const simulationRunSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    simulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    // Snapshot of config used (may differ from simulation.defaultConfig)
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: Object.values(RUN_STATUS),
      default: RUN_STATUS.PENDING,
      index: true,
    },
    // Full execution result (module-specific shape)
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    // Step-by-step snapshots — excluded from list queries via projection
    steps: { type: [mongoose.Schema.Types.Mixed], default: [] },
    stepCount: { type: Number, default: 0 },
    metrics: { type: mongoose.Schema.Types.Mixed, default: null },
    // User annotations
    userNotes: { type: String, default: '', maxlength: 2000 },
    isSaved: { type: Boolean, default: false, index: true },
    // Timing
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound indexes for common queries
simulationRunSchema.index({ userId: 1, createdAt: -1 });
simulationRunSchema.index({ userId: 1, simulationId: 1 });
simulationRunSchema.index({ userId: 1, isSaved: 1 });
simulationRunSchema.index({ status: 1, createdAt: -1 }); // For cleanup jobs

export const SimulationRun = mongoose.model('SimulationRun', simulationRunSchema);
