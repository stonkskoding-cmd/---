import { Request, Response } from 'express';

const PRODUCTION_FRONTEND = 'https://online-school-1-zj77.onrender.com';

/** trim + strip CR/LF — на Render/Windows в .env часто попадает \r */
export function normalizeOrigin(value: string): string {
  return value.trim().replace(/\r/g, '').replace(/\/$/, '');
}

export function getAllowedOrigins(): string[] {
  const fromEnv = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    PRODUCTION_FRONTEND,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]
    .filter((v): v is string => Boolean(v))
    .map(normalizeOrigin);

  return [...new Set(fromEnv)];
}

const allowedSet = () => new Set(getAllowedOrigins());

/** Origin из запроса, если он в whitelist; иначе первый разрешённый */
export function resolveCorsOrigin(req: Request): string {
  const allowed = getAllowedOrigins();
  const defaultOrigin = allowed[0] || PRODUCTION_FRONTEND;
  const requestOrigin = req.headers.origin;

  if (!requestOrigin) {
    return defaultOrigin;
  }

  const normalizedRequest = normalizeOrigin(requestOrigin);
  if (allowedSet().has(normalizedRequest)) {
    return requestOrigin;
  }

  return defaultOrigin;
}

export function applyCorsHeaders(req: Request, res: Response): string {
  const origin = resolveCorsOrigin(req);

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  return origin;
}

export function handlePreflight(req: Request, res: Response): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  const origin = applyCorsHeaders(req, res);
  console.log(`✅ OPTIONS ${req.path} | Allow-Origin: ${origin}`);
  res.status(204).end();
  return true;
}
