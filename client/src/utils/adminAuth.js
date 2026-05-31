function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isValidAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const payload = parseJwtPayload(token.trim());
  if (payload?.role !== 'admin') return false;
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return false;
  return true;
}

/** Токен для Authorization на /api/admin/* */
export function getAdminBearerToken() {
  const adminToken = localStorage.getItem('adminToken')?.trim();
  const userToken = localStorage.getItem('token')?.trim();

  if (adminToken && isValidAdminToken(adminToken)) return adminToken;
  if (userToken && isValidAdminToken(userToken)) return userToken;
  // Fallback: отправляем adminToken — сервер проверит JWT
  if (adminToken) return adminToken;
  if (userToken) return userToken;
  return null;
}

export function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/** Доступ в /admin: валидный JWT с role admin */
export function canAccessAdminRoute() {
  const adminToken = localStorage.getItem('adminToken')?.trim();
  const userToken = localStorage.getItem('token')?.trim();
  return isValidAdminToken(adminToken) || isValidAdminToken(userToken);
}
