import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'USER_PASSWORD_RESET',
        'SIMULATION_RUN', 'SIMULATION_CREATE', 'SIMULATION_UPDATE', 'SIMULATION_DELETE',
        'RUN_SAVED', 'RUN_DELETED',
        'ADMIN_USER_UPDATE', 'CONFIG_CHANGE',
      ],
      index: true,
    },
    resource: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// TTL index: auto-delete after 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7_776_000 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
