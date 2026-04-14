import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(5),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().email().default('noreply@ossim.app'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
