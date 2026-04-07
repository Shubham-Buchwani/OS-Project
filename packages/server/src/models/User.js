import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, SUBSCRIPTION_TIERS } from '@os-sim/shared';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never return by default
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
      index: true,
    },
    avatarUrl: { type: String, default: null },
    subscription: {
      tier: { type: String, enum: Object.values(SUBSCRIPTION_TIERS), default: SUBSCRIPTION_TIERS.FREE },
      expiresAt: { type: Date, default: null },
    },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      animationSpeed: { type: Number, min: 0.1, max: 10, default: 1 },
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },
    lastLoginAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// ── Static Methods ────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim(), isActive: true }).select('+passwordHash +refreshTokens');
};

// ── Instance Methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.addRefreshToken = async function (token) {
  this.refreshTokens.push(token);
  // Limit stored tokens to 5 per user (multi-device support)
  if (this.refreshTokens.length > 5) this.refreshTokens.shift();
  await this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
  await this.save();
};

userSchema.methods.hasRefreshToken = function (token) {
  return this.refreshTokens.includes(token);
};

export const User = mongoose.model('User', userSchema);
