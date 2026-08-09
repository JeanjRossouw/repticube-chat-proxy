import { Router } from 'express';
import db from '../db.js';
import { todayIso } from './invoices.js';

const router = Router();

const round = (value) => Math.round((value ?? 0) * 100) / 100;

router.get('/', (req, res) => {
  const today = todayIso();
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthEnd = `${today.slice(0, 7)}-31`;

  const sum = (table, from, to) =>
    round(
      db
        .prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM ${table} WHERE date BETWEEN ? AND ?`)
        .get(from, to).total
    );
  const sumAll = (table) =>
    round(db.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM ${table}`).get().total);

  const monthIncome = sum('income', monthStart, monthEnd);
  const monthExpenses = sum('expenses', monthStart, monthEnd);

  // The five most recent movements across both ledgers, newest first.
  const recent = db
    .prepare(
      `SELECT 'income' AS type, i.id AS id, i.date AS date, i.amount AS amount,
              i.description AS description, c.name AS category
       FROM income i LEFT JOIN categories c ON c.id = i.category_id
       UNION ALL
       SELECT 'expense' AS type, e.id AS id, e.date AS date, e.amount AS amount,
              e.description AS description, c.name AS category
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
       ORDER BY date DESC, id DESC
       LIMIT 5`
    )
    .all();

  const unpaid = db
    .prepare(
      `SELECT COUNT(*) AS count,
              COALESCE(SUM((SELECT COALESCE(SUM(amount), 0) FROM invoice_items WHERE invoice_id = inv.id)), 0) AS total
       FROM invoices inv
       WHERE inv.status != 'paid'`
    )
    .get();

  res.json({
    month: today.slice(0, 7),
    month_income: monthIncome,
    month_expenses: monthExpenses,
    month_net: round(monthIncome - monthExpenses),
    running_balance: round(sumAll('income') - sumAll('expenses')),
    recent,
    outstanding_invoices: { count: unpaid.count, total: round(unpaid.total) },
  });
});

export default router;
