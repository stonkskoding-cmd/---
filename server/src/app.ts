import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env';

import apiRouter from './routes';
import { errorHandler } from './middleware/error';

const app = express();

// 1) CORS — первый middleware (до helmet, парсеров и /api)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
console.log('CORS ALLOWED ORIGIN:', process.env.FRONTEND_URL);

// 2) Парсинг тела — до роутов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3) API: фронт шлёт на {VITE_API_URL}/auth/... где baseURL уже содержит /api
//    → здесь один префикс /api; внутри apiRouter только /auth, /packages, …
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);
app.use('/api', apiRouter);

// Health check (вне /api)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
