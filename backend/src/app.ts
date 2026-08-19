/**
 * Express application: middleware pipeline, health check and API mount.
 */
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

// Security headers (CSP, HSTS, X-Content-Type-Options, etc.).
app.use(helmet());

// Allow multiple comma-separated origins (dev + production frontends).
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Global rate limiter for the API. NOTE: the default in-memory store works for
// a single instance; on Vercel's serverless you'd need a shared store (Redis).
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde', data: null },
});

// Lightweight liveness probe for Vercel / uptime monitors.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'barber-shop-api' });
});

app.use('/api', apiLimiter);
app.use('/api', apiRouter);

// Centralized error handling must be registered last.
app.use(errorHandler);