import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from './ApiError.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_ACCESS_EXPIRY });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRY });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Access token expired');
    throw ApiError.unauthorized('Invalid access token');
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Refresh token expired');
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

export function generateTokenPair(user) {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user._id.toString() }),
    expiresIn: 900, // 15 min in seconds
  };
}
