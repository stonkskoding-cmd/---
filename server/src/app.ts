import express, { Request, Response, NextFunction } from 'express';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

import apiRouter from './routes';
import { applyCorsHeaders, getAllowedOrigins, handlePreflight } from './lib/cors';

console.log('🧪 CHECK ENV FRONTEND_URL:', JSON.stringify(process.env.FRONTEND_URL));
console.log('🧪 ALLOWED ORIGINS:', getAllowedOrigins());
console.log('🔥 SERVER BUILD CHECK - TIMESTAMP:', Date.now());

const app = express();

// 0. OPTIONS на любой путь — до всего остального
app.options('*', (req, res) => {
  handlePreflight(req, res);
});

// 1. CORS — ПЕРВЫМ (каждый запрос)
app.use((req, res, next) => {
  const origin = applyCorsHeaders(req, res);

  if (handlePreflight(req, res)) {
    return;
  }

  console.log(
    `📥 ${req.method} ${req.path} | Origin: ${req.headers.origin ?? 'none'} | CORS: ${origin}`,
  );
  next();
});

// 2. Парсинг
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health (для Render / ручной проверки CORS)
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// 3. Роуты
app.use('/api', apiRouter);

// 404 с CORS
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// 4. Error handler с CORS
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  applyCorsHeaders(req, res);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status =
    err && typeof err === 'object' && 'status' in err && typeof (err as { status: number }).status === 'number'
      ? (err as { status: number }).status
      : 500;
  console.error('❌ Error:', message);
  res.status(status).json({ message });
});

export default app;
