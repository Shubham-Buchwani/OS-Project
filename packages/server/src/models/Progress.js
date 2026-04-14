import mongoose from 'mongoose';
import { MODULES } from '@os-sim/shared';

const moduleProgressSchema = new mongoose.Schema(
  {
    completedAlgorithms: { type: [String], default: [] },
    totalRuns: { type: Number, default: 0 },
    bestScores: { type: Map, of: Number, default: {} },
    lastAccessedAt: { type: Date, default: null },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    modules: {
      scheduling: { type: moduleProgressSchema, default: () => ({}) },
      memory: { type: moduleProgressSchema, default: () => ({}) },
      deadlock: { type: moduleProgressSchema, default: () => ({}) },
      filesystem: { type: moduleProgressSchema, default: () => ({}) },
    },
    overallCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },
    totalSimulationsRun: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null, index: true },
    achievements: {
      type: [
        {
          id: String,
          title: String,
          description: String,
          unlockedAt: Date,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Static method to get or create progress for a user
progressSchema.statics.getOrCreate = async function (userId) {
  let progress = await this.findOne({ userId });
  if (!progress) {
    progress = await this.create({ userId });
  }
  return progress;
};

// Update module progress after a run
progressSchema.methods.recordRun = async function (module, algorithm) {
  const mod = this.modules[module];
  if (!mod) return;

  mod.totalRuns = (mod.totalRuns || 0) + 1;
  mod.lastAccessedAt = new Date();

  if (!mod.completedAlgorithms.includes(algorithm)) {
    mod.completedAlgorithms.push(algorithm);
  }

  this.totalSimulationsRun = (this.totalSimulationsRun || 0) + 1;

  // ── Streak Calculation ───────────────────────────────────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!this.lastActiveAt) {
    this.streakDays = 1;
  } else {
    const lastActive = new Date(this.lastActiveAt.getFullYear(), this.lastActiveAt.getMonth(), this.lastActiveAt.getDate());
    const diffTime = today - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day: increment streak
      this.streakDays = (this.streakDays || 0) + 1;
    } else if (diffDays > 1) {
      // Broken streak: reset to 1
      this.streakDays = 1;
    }
    // If diffDays === 0, it's the same day, leave streak as is
  }

  this.lastActiveAt = now;

  // Recalculate overall completion (simplified: based on completed algorithms)
  const ALL_ALGORITHMS_COUNT = 5 + 4 + 2 + 5; // scheduling + memory + deadlock + filesystem
  const completed = Object.values(this.modules).reduce(
    (sum, m) => sum + (m.completedAlgorithms ? m.completedAlgorithms.length : 0),
    0
  );
  this.overallCompletionPercent = Math.min(100, Math.round((completed / ALL_ALGORITHMS_COUNT) * 100));

  this.markModified('modules');
  await this.save();
};

export const Progress = mongoose.model('Progress', progressSchema);
