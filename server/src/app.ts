import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRouter from './routes';
import {
  CORS_BUILD_ID,
  CORS_ORIGINS,
  CORS_METHODS,
  CORS_ALLOWED_HEADERS,
  getAllowedOrigins,
  isOriginAllowed,
} from './lib/cors';

console.log('🚀 APP LOADED | CORS_BUILD_ID:', CORS_BUILD_ID);
console.log('🧪 ALLOWED ORIGINS:', getAllowedOrigins());

const app = express();

app.set('trust proxy', 1);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    console.log('CORS allowed origin:', origin ?? 'none');
    if (!origin || isOriginAllowed(origin)) {
      callback(null, origin ?? true);
      return;
    }
    console.warn(`[CORS] blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: [...CORS_METHODS],
  allowedHeaders: [...CORS_ALLOWED_HEADERS],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use((req, _res, next) => {
  if (req.headers.origin) {
    console.log('CORS allowed origin:', req.headers.origin);
  }
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, build: CORS_BUILD_ID, origins: CORS_ORIGINS, ts: Date.now() });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, build: CORS_BUILD_ID, origins: CORS_ORIGINS, ts: Date.now() });
});

app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', CORS_ALLOWED_HEADERS.join(', '));
  }
  console.error('❌ Error:', err.message);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  }
});

export default app;
