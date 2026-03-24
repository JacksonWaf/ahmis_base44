import crypto from 'node:crypto';
import { Router } from 'express';
import { normalizeRow, pool } from '../lib/db.mjs';

export const usersRouter = Router();

usersRouter.post('/invite', async (req, res, next) => {
  try {
    const { email, role = 'user' } = req.body || {};
    if (!email) {
      const error = new Error('Email is required');
      error.status = 400;
      throw error;
    }

    const id = crypto.randomUUID();
    const fullName = email.split('@')[0];
    const password = crypto.randomUUID().slice(0, 12);

    await pool.query(
      'INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fullName, email, password, role, 'active']
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    res.status(201).json(normalizeRow({ jsonFields: [] }, rows[0]));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'A user with that email already exists';
    }
    next(error);
  }
});
