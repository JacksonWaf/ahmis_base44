import crypto from 'node:crypto';
import { Router } from 'express';
import { getEntityOrThrow, isAllowedField, mapSortField, normalizeRow, pool, preparePayload } from '../lib/db.mjs';

export const entityRouter = Router();

function buildWhereClause(entity, filters) {
  const clauses = [];
  const values = [];

  for (const [field, value] of Object.entries(filters || {})) {
    if (!isAllowedField(entity, field)) continue;
    clauses.push(`\`${field}\` = ?`);
    values.push(value);
  }

  return {
    sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}

entityRouter.get('/:entity', async (req, res, next) => {
  try {
    const entity = getEntityOrThrow(req.params.entity);
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const { sql, values } = buildWhereClause(entity, filter);
    const sort = mapSortField(req.query.sort);
    const orderSql = sort && isAllowedField(entity, sort.field) ? ` ORDER BY \`${sort.field}\` ${sort.direction}` : '';
    const [rows] = await pool.query(`SELECT * FROM \`${entity.table}\` ${sql}${orderSql}`, values);
    res.json(rows.map((row) => normalizeRow(entity, row)));
  } catch (error) {
    next(error);
  }
});

entityRouter.get('/:entity/:id', async (req, res, next) => {
  try {
    const entity = getEntityOrThrow(req.params.entity);
    const [rows] = await pool.query(`SELECT * FROM \`${entity.table}\` WHERE id = ? LIMIT 1`, [req.params.id]);
    if (rows.length === 0) {
      const error = new Error(`${entity.name} not found`);
      error.status = 404;
      throw error;
    }
    res.json(normalizeRow(entity, rows[0]));
  } catch (error) {
    next(error);
  }
});

entityRouter.post('/:entity', async (req, res, next) => {
  try {
    const entity = getEntityOrThrow(req.params.entity);
    const payload = preparePayload(entity, req.body || {});
    const id = payload.id || crypto.randomUUID();
    payload.id = id;

    const fields = Object.keys(payload).filter((field) => isAllowedField(entity, field));
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((field) => payload[field]);

    await pool.query(
      `INSERT INTO \`${entity.table}\` (${fields.map((field) => `\`${field}\``).join(', ')}) VALUES (${placeholders})`,
      values,
    );

    const [rows] = await pool.query(`SELECT * FROM \`${entity.table}\` WHERE id = ? LIMIT 1`, [id]);
    res.status(201).json(normalizeRow(entity, rows[0]));
  } catch (error) {
    next(error);
  }
});

entityRouter.patch('/:entity/:id', async (req, res, next) => {
  try {
    const entity = getEntityOrThrow(req.params.entity);
    const payload = preparePayload(entity, req.body || {});
    delete payload.id;

    const fields = Object.keys(payload).filter((field) => isAllowedField(entity, field));
    if (fields.length === 0) {
      const [existing] = await pool.query(`SELECT * FROM \`${entity.table}\` WHERE id = ? LIMIT 1`, [req.params.id]);
      res.json(normalizeRow(entity, existing[0]));
      return;
    }

    await pool.query(
      `UPDATE \`${entity.table}\` SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE id = ?`,
      [...fields.map((field) => payload[field]), req.params.id],
    );

    const [rows] = await pool.query(`SELECT * FROM \`${entity.table}\` WHERE id = ? LIMIT 1`, [req.params.id]);
    if (rows.length === 0) {
      const error = new Error(`${entity.name} not found`);
      error.status = 404;
      throw error;
    }
    res.json(normalizeRow(entity, rows[0]));
  } catch (error) {
    next(error);
  }
});

entityRouter.delete('/:entity/:id', async (req, res, next) => {
  try {
    const entity = getEntityOrThrow(req.params.entity);
    await pool.query(`DELETE FROM \`${entity.table}\` WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
