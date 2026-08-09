import { Router } from 'express';
import db from '../db.js';
import { intId, isoDate, optionalText, positiveAmount, requiredText } from '../validate.js';
import { requireCategory } from './income.js';

const router = Router();

const SELECT_EXPENSE = `
  SELECT e.id, e.date, e.amount, e.category_id, e.description, e.receipt_note, c.name AS category
  FROM expenses e
  LEFT JOIN categories c ON c.id = e.category_id
`;

function readBody(body) {
  return {
    date: isoDate(body.date, 'Date'),
    amount: positiveAmount(body.amount),
    category_id: requireCategory(body.category_id, 'expense'),
    description: requiredText(body.description, 'Description'),
    receipt_note: optionalText(body.receipt_note, 'Receipt note', 200),
  };
}

router.get('/', (req, res) => {
  const direction = String(req.query.sort ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const rows = db
    .prepare(`${SELECT_EXPENSE} ORDER BY e.date ${direction}, e.id ${direction}`)
    .all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const entry = readBody(req.body);
  const info = db
    .prepare(
      `INSERT INTO expenses (date, amount, category_id, description, receipt_note)
       VALUES (@date, @amount, @category_id, @description, @receipt_note)`
    )
    .run(entry);
  res.status(201).json(db.prepare(`${SELECT_EXPENSE} WHERE e.id = ?`).get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const id = intId(req.params.id, 'Expense entry');
  const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Expense entry not found.' });

  const entry = readBody(req.body);
  db.prepare(
    `UPDATE expenses
     SET date = @date, amount = @amount, category_id = @category_id,
         description = @description, receipt_note = @receipt_note
     WHERE id = @id`
  ).run({ ...entry, id });
  res.json(db.prepare(`${SELECT_EXPENSE} WHERE e.id = ?`).get(id));
});

router.delete('/:id', (req, res) => {
  const id = intId(req.params.id, 'Expense entry');
  const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Expense entry not found.' });

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
