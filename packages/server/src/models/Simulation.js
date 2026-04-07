import mongoose from 'mongoose';
import { MODULES, DIFFICULTY } from '@os-sim/shared';

const simulationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    module: { type: String, enum: Object.values(MODULES), required: true, index: true },
    algorithm: { type: String, required: true, index: true },
    difficulty: { type: String, enum: Object.values(DIFFICULTY), required: true, index: true },
    description: { type: String, default: '', maxlength: 2000 },
    defaultConfig: { type: mongoose.Schema.Types.Mixed, required: true },
    tags: { type: [String], default: [], index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    version: { type: Number, default: 1 },
    runCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for common listing queries
simulationSchema.index({ isPublished: 1, module: 1, difficulty: 1 });
simulationSchema.index({ module: 1, algorithm: 1 });
simulationSchema.index({ createdAt: -1 });

// Auto-generate slug from title if not provided
simulationSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

export const Simulation = mongoose.model('Simulation', simulationSchema);
