import express from 'express';
import { bootstrapDatabase } from './lib/db.mjs';
import { authRouter } from './routes/auth.mjs';
import { entityRouter } from './routes/entities.mjs';
import { integrationsRouter } from './routes/integrations.mjs';
import { usersRouter } from './routes/users.mjs';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/entities', entityRouter);
app.use('/api/users', usersRouter);
app.use('/api/integrations/core', integrationsRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

bootstrapDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to bootstrap database', error);
    process.exit(1);
  });
