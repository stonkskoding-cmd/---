import { IncomingMessage, ServerResponse } from 'http';
import { Request, Response, NextFunction } from 'express';

const PRODUCTION_FRONTEND = 'https://online-school-1-zj77.onrender.com';

export const CORS_BUILD_ID = `cors-options-fix-${Date.now()}`;

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

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return allowedSet().has(normalizeOrigin(origin));
}

/** Значение для Access-Control-Allow-Origin (должно совпадать с Origin браузера) */
export function pickAllowOrigin(origin: string | undefined): string {
  if (origin && isAllowedOrigin(origin)) {
    return origin;
  }
  return getAllowedOrigins()[0] || PRODUCTION_FRONTEND;
}

const CORS_METHODS = 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD';
const CORS_HEADERS = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';

function setHeadersOnNodeResponse(
  origin: string | undefined,
  res: { setHeader(name: string, value: string): void },
): string {
  const allowOrigin = pickAllowOrigin(origin);
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', CORS_METHODS);
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS);
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  return allowOrigin;
}

/** OPTIONS на уровне http.Server — ДО Express (обход роутинга) */
export function handleHttpPreflight(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  const allowOrigin = setHeadersOnNodeResponse(req.headers.origin, res);
  console.log(
    `✅ [HTTP OPTIONS intercepted] ${req.url} | Allow-Origin: ${allowOrigin}`,
  );
  res.writeHead(204);
  res.end();
  return true;
}

export function applyCorsHeaders(req: Request, res: Response): string {
  return setHeadersOnNodeResponse(req.headers.origin, res);
}

export function handlePreflight(req: Request, res: Response): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  const allowOrigin = applyCorsHeaders(req, res);
  console.log(`✅ OPTIONS intercepted for ${req.path} | Allow-Origin: ${allowOrigin}`);
  res.status(204).end();
  return true;
}

/** Express middleware — первым в app.ts */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.log('🔥 CORS middleware triggered for', req.method, req.path);

  if (handlePreflight(req, res)) {
    return;
  }

  applyCorsHeaders(req, res);
  next();
}
