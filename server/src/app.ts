import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

import apiRouter from './routes';

const ALLOWED_ORIGINS = [
  'https://online-school-1-zj77.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim().replace(/\r/g, '')] : []),
];

function setCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
}

const app = express();

// =========================================================
// 🛡️ ПУЛЕНЕПРОБИВАЕМЫЙ CORS (Ставим САМЫМ ПЕРВЫМ!)
// =========================================================
app.use((req, res, next) => {
  console.log(` [REQUEST] ${req.method} ${req.originalUrl}`);

  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    console.log(`✅ [OPTIONS INTERCEPTED] Отправляю 204 No Content для ${req.originalUrl}`);
    return res.sendStatus(204);
  }

  next();
});

// =========================================================
// Дальше стандартные настройки
// =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  setCorsHeaders(req, res);
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
