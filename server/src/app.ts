import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

import apiRouter from './routes';
import {
  CORS_BUILD_ID,
  applyCorsHeaders,
  corsMiddleware,
  getAllowedOrigins,
  handlePreflight,
} from './lib/cors';

console.log('🚀 APP LOADED | CORS_BUILD_ID:', CORS_BUILD_ID);
console.log('🧪 ALLOWED ORIGINS:', getAllowedOrigins());

const app = express();

// =========================================================
// 🛡️ CORS — САМЫМ ПЕРВЫМ (до парсинга и роутов)
// =========================================================

// Явный перехват OPTIONS для любого пути (до apiRouter)
app.options(/.*/, (req, res) => {
  console.log('🔥 app.options handler for', req.method, req.originalUrl);
  handlePreflight(req, res);
});

app.use(corsMiddleware);

// =========================================================
// Парсинг и роуты
// =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, build: CORS_BUILD_ID, ts: Date.now() });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, build: CORS_BUILD_ID, ts: Date.now() });
});

app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  applyCorsHeaders(req, res);
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
