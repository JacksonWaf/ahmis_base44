# MySQL schema

This schema is generated from the JSON entity definitions in `entities/`.

## Files

- `schema.sql`: MySQL DDL generated from the entity files.
- `../../scripts/generate-mysql-schema.mjs`: Regenerates `schema.sql` whenever entity definitions change.
- `../../server/`: Express API that reads and writes the generated MySQL tables.

## Generate

```bash
npm run db:mysql:generate
```

## Import into MySQL

```bash
mysql -u root -p < database/mysql/schema.sql
```

## Backend setup

1. Copy `.env.example` to `.env`.
2. Fill in your MySQL credentials.
3. Install dependencies with `npm install`.
4. Start the API with `npm run server`.
5. Start the frontend with `npm run dev`.

The Vite dev server proxies `/api` requests to `http://localhost:4000` by default.

## Connection example for a backend

The current repo now includes a backend in `server/`. It bootstraps the schema on startup and creates a default admin user if `users` is empty.

Install the driver in that backend first:

```bash
npm install
```

## Notes

- Every entity table gets an `id` primary key plus `created_at` and `updated_at`.
- Nested objects and arrays from the source schemas are stored as `JSON`.
- Foreign keys are added only when an `*_id` field clearly matches another entity name.
- The frontend no longer needs Base44 for entity CRUD; it talks to the local `/api` server instead.
