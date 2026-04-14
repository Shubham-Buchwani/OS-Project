import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { config } from './config/index.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import simulationRoutes from './modules/simulation/simulation.routes.js';
import runRoutes from './modules/simulationRun/run.routes.js';
import progressRoutes from './modules/progress/progress.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: config.NODE_ENV === 'production',
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true, // Allow cookies (refresh token)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing & Cookies ───────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Request ID ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = randomUUID();
  next();
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/simulations', simulationRoutes);
app.use('/api/v1/runs', runRoutes);
app.use('/api/v1/progress', progressRoutes);

// ── Static Files (Production) ────────────────────────────────────────────────
if (config.NODE_ENV === 'production') {
  const publicPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(publicPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ── 404 Catch-All ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Central Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
