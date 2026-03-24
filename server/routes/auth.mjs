import { Router } from 'express';
import { normalizeRow, pool } from '../lib/db.mjs';

export const authRouter = Router();

async function getCurrentUser() {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE status = 'active' ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at ASC LIMIT 1"
  );
  return rows[0] || null;
}

authRouter.get('/me', async (_req, res, next) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const error = new Error('No active user found');
      error.status = 401;
      throw error;
    }
    res.json(normalizeRow({ jsonFields: [] }, user));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
