import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.join(__dirname, '..', 'data');
export const DB_FILE = path.join(DATA_DIR, 'bookkeeping.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const DEFAULT_INCOME_CATEGORIES = ['Sales', 'Services', 'Refunds', 'Other Income'];
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Salaries',
  'Software',
  'Marketing',
  'Office',
  'Travel',
  'Professional Fees',
  'Tax',
  'Other',
];

// Tables are created on first run if they do not exist yet, so a fresh
// checkout works with no setup step.
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    UNIQUE (name, type)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_email TEXT,
    date_issued TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
    paid_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER REFERENCES categories (id),
    description TEXT NOT NULL,
    reference TEXT,
    invoice_id INTEGER REFERENCES invoices (id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER REFERENCES categories (id),
    description TEXT NOT NULL,
    receipt_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT NOT NULL DEFAULT '',
    company_address TEXT NOT NULL DEFAULT '',
    company_email TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_income_date ON income (date);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
  CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);
`);

const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)'
);

const seedDefaults = db.transaction(() => {
  for (const name of DEFAULT_INCOME_CATEGORIES) insertCategory.run(name, 'income');
  for (const name of DEFAULT_EXPENSE_CATEGORIES) insertCategory.run(name, 'expense');
  db.prepare('INSERT OR IGNORE INTO settings (id) VALUES (1)').run();
});

seedDefaults();

export default db;
