import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../../models/User.js';
import { Progress } from '../../models/Progress.js';
import { AuditLog } from '../../models/AuditLog.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/tokenHelper.js';

const BCRYPT_ROUNDS = 12;

export async function registerUser(dto, ip, ua) {
  const existing = await User.findOne({ email: dto.email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
  const user = await User.create({ email: dto.email, passwordHash, displayName: dto.displayName });

  // Create progress document in same logical operation
  await Progress.create({ userId: user._id });

  // Audit
  await AuditLog.create({ userId: user._id, action: 'USER_REGISTER', ip, userAgent: ua });

  const tokens = generateTokenPair(user);
  await user.addRefreshToken(tokens.refreshToken);

  return { user, tokens };
}

export async function loginUser(dto, ip, ua) {
  const user = await User.findByEmail(dto.email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');

  const valid = await user.comparePassword(dto.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  await AuditLog.create({ userId: user._id, action: 'USER_LOGIN', ip, userAgent: ua });

  const tokens = generateTokenPair(user);
  await user.addRefreshToken(tokens.refreshToken);

  return { user, tokens };
}

export async function refreshTokens(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.isActive) throw ApiError.unauthorized('User not found');
  if (!user.hasRefreshToken(refreshToken)) {
    // Token reuse detected — invalidate all tokens (token family compromise)
    user.refreshTokens = [];
    await user.save();
    throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
  }

  await user.removeRefreshToken(refreshToken);
  const tokens = generateTokenPair(user);
  await user.addRefreshToken(tokens.refreshToken);

  return tokens;
}

export async function logoutUser(userId, refreshToken) {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user && refreshToken) {
    await user.removeRefreshToken(refreshToken);
  }
  await AuditLog.create({ userId, action: 'USER_LOGOUT' });
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw ApiError.notFound('User');
  return user;
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return; // Silent — don't reveal if email exists

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save();

  // TODO: send email with reset link containing raw token
  return token;
}

export async function resetPassword(token, newPassword) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  await AuditLog.create({ userId: user._id, action: 'USER_PASSWORD_RESET' });
}
