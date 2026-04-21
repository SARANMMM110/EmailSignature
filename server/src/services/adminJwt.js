import jwt from 'jsonwebtoken';

const DEFAULT_DEV_SECRET = 'dev-admin-jwt-secret-change-in-production';

export function getAdminJwtSecret() {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    console.error('[admin] Missing ADMIN_JWT_SECRET — set a long random string in production.');
  }
  return DEFAULT_DEV_SECRET;
}

export function signAdminToken() {
  return jwt.sign({ typ: 'admin', sub: 'panel' }, getAdminJwtSecret(), { expiresIn: '7d' });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, getAdminJwtSecret());
}
