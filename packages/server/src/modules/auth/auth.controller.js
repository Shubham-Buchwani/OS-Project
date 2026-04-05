import { asyncHandler } from '../../utils/ApiError.js';
import * as authService from './auth.service.js';
import { config } from '../../config/index.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.registerUser(
    req.body,
    req.ip,
    req.headers['user-agent']
  );
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role },
    tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.loginUser(
    req.body,
    req.ip,
    req.headers['user-agent']
  );
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  res.json({
    user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role, preferences: user.preferences },
    tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' } });
  }
  const tokens = await authService.refreshTokens(refreshToken);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  res.json({ tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn } });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logoutUser(req.user.id, refreshToken);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.json({ message: 'Password reset successfully. Please log in.' });
});
