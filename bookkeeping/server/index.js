import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

import { DB_FILE } from './db.js';
import categories from './routes/categories.js';
import dashboard from './routes/dashboard.js';
import expenses from './routes/expenses.js';
import income from './routes/income.js';
import invoices from './routes/invoices.js';
import reports from './routes/reports.js';
import settings from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/dashboard', dashboard);
app.use('/api/income', income);
app.use('/api/expenses', expenses);
app.use('/api/invoices', invoices);
app.use('/api/reports', reports);
app.use('/api/categories', categories);
app.use('/api/settings', settings);

// After `npm run build` the compiled frontend is served from the same port,
// so the app also works without the dev server running.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next();
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status ?? 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'Something went wrong.' : error.message });
});

app.listen(PORT, () => {
  console.log(`Bookkeeping API listening on http://localhost:${PORT}`);
  console.log(`Database: ${DB_FILE}`);
});
