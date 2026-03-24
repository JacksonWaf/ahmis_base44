import { Router } from 'express';

export const integrationsRouter = Router();

integrationsRouter.post('/send-email', async (req, res) => {
  const { to, subject } = req.body || {};
  console.log('SendEmail stub:', { to, subject });
  res.json({ ok: true, channel: 'email', to, subject });
});

integrationsRouter.post('/invoke-llm', async (req, res) => {
  const { prompt } = req.body || {};
  console.log('InvokeLLM stub:', { prompt });
  res.json({ ok: true, text: 'Dispatch logged successfully.' });
});
