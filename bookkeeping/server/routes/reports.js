import { Router } from 'express';
import db from '../db.js';
import { ValidationError, isoDate } from '../validate.js';

const router = Router();

const BY_CATEGORY = (table) => `
  SELECT COALESCE(c.name, 'Uncategorised') AS category, SUM(t.amount) AS total, COUNT(*) AS entries
  FROM ${table} t
  LEFT JOIN categories c ON c.id = t.category_id
  WHERE t.date BETWEEN ? AND ?
  GROUP BY category
  ORDER BY total DESC
`;

const round = (value) => Math.round((value ?? 0) * 100) / 100;

router.get('/pl', (req, res) => {
  const from = isoDate(req.query.from, 'Start date');
  const to = isoDate(req.query.to, 'End date');
  if (to < from) throw new ValidationError('End date cannot be before the start date.');

  const income = db.prepare(BY_CATEGORY('income')).all(from, to).map((row) => ({
    ...row,
    total: round(row.total),
  }));
  const expenses = db.prepare(BY_CATEGORY('expenses')).all(from, to).map((row) => ({
    ...row,
    total: round(row.total),
  }));

  const totalIncome = round(income.reduce((sum, row) => sum + row.total, 0));
  const totalExpenses = round(expenses.reduce((sum, row) => sum + row.total, 0));

  res.json({
    from,
    to,
    income,
    expenses,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    gross_profit: round(totalIncome - totalExpenses),
  });
});

export default router;
