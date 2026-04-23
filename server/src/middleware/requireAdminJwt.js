import { verifyAdminToken } from '../services/adminJwt.js';

export function requireAdminJwt(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Admin session required.' });
    }
    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Admin session required.' });
    }
    const payload = verifyAdminToken(token);
    if (payload.typ !== 'admin' || !payload.sub) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid admin session.' });
    }
    req.adminAuth = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired admin session.' });
  }
}
