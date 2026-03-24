import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { loadEnvFile } from './env.mjs';

loadEnvFile();

const rootDir = process.cwd();
const schemaFile = path.join(rootDir, 'database', 'mysql', 'schema.sql');
const entitiesDir = path.join(rootDir, 'entities');

function pascalToSnake(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function loadEntityConfig() {
  const ignored = new Set([
    'Patient - Copy (5).json',
    'Patient - Copy (6).json',
    'Patient - Copy (7).json',
    'Patient - Copy (8).json',
    'Patient - Copy (9).json',
    'Patient - Copy (10).json',
  ]);

  const files = fs.readdirSync(entitiesDir)
    .filter((file) => file.endsWith('.json') && !ignored.has(file));

  const config = {};
  for (const file of files) {
    const schema = JSON.parse(fs.readFileSync(path.join(entitiesDir, file), 'utf8'));
    const fields = ['id', 'created_at', 'updated_at'];
    for (const field of Object.keys(schema.properties || {})) fields.push(field);
    config[schema.name] = {
      name: schema.name,
      table: pascalToSnake(schema.name),
      properties: schema.properties || {},
      fields,
      jsonFields: Object.entries(schema.properties || {})
        .filter(([, def]) => def.type === 'array' || def.type === 'object')
        .map(([field]) => field),
    };
  }

  config.User = {
    name: 'User',
    table: 'users',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      role: { type: 'string' },
      status: { type: 'string' },
    },
    fields: ['id', 'full_name', 'email', 'password', 'role', 'status', 'created_at', 'updated_at'],
    jsonFields: [],
  };

  return config;
}

export const entityConfig = loadEntityConfig();

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mediflow',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    multipleStatements: true,
  });
}

export const pool = createPool();

export async function bootstrapDatabase() {
  const schemaSql = fs.readFileSync(schemaFile, 'utf8');
  await pool.query(schemaSql);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) NOT NULL,
      full_name VARCHAR(255) NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'admin',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  if (rows[0].total === 0) {
    const id = crypto.randomUUID();
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@mediflow.local';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const fullName = process.env.DEFAULT_ADMIN_NAME || 'System Administrator';
    await pool.query(
      'INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fullName, email, password, 'admin', 'active']
    );
  }
}

export function getEntityOrThrow(entityName) {
  const entity = entityConfig[entityName];
  if (!entity) {
    const error = new Error(`Unknown entity: ${entityName}`);
    error.status = 404;
    throw error;
  }
  return entity;
}

function parseJsonValue(value) {
  if (value == null) return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function normalizeRow(entity, row) {
  const normalized = { ...row };
  for (const field of entity.jsonFields) {
    normalized[field] = parseJsonValue(normalized[field]);
  }
  if (normalized.created_at && !normalized.created_date) normalized.created_date = normalized.created_at;
  if (normalized.updated_at && !normalized.updated_date) normalized.updated_date = normalized.updated_at;
  return normalized;
}

export function preparePayload(entity, payload) {
  const prepared = { ...payload };
  delete prepared.created_at;
  delete prepared.updated_at;
  delete prepared.created_date;
  delete prepared.updated_date;

  for (const field of entity.jsonFields) {
    if (prepared[field] !== undefined) {
      prepared[field] = JSON.stringify(prepared[field]);
    }
  }

  return prepared;
}

export function isAllowedField(entity, field) {
  return entity.fields.includes(field) || field === 'created_date' || field === 'updated_date';
}

export function mapSortField(sort) {
  if (!sort) return null;
  const direction = sort.startsWith('-') ? 'DESC' : 'ASC';
  const rawField = sort.replace(/^-/, '');
  const field = rawField === 'created_date' ? 'created_at' : rawField === 'updated_date' ? 'updated_at' : rawField;
  return { field, direction };
}
