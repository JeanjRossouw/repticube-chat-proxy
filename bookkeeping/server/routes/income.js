import { Router } from 'express';
import db from '../db.js';
import {
  ValidationError,
  intId,
  isoDate,
  optionalText,
  positiveAmount,
  requiredText,
} from '../validate.js';

const router = Router();

const SELECT_INCOME = `
  SELECT i.id, i.date, i.amount, i.category_id, i.description, i.reference, i.invoice_id,
         c.name AS category, inv.invoice_number
  FROM income i
  LEFT JOIN categories c ON c.id = i.category_id
  LEFT JOIN invoices inv ON inv.id = i.invoice_id
`;

export function requireCategory(categoryId, type) {
  const id = intId(categoryId, 'Category');
  const category = db.prepare('SELECT id, type FROM categories WHERE id = ?').get(id);
  if (!category || category.type !== type) {
    throw new ValidationError('Choose a valid category.');
  }
  return id;
}

function readBody(body) {
  return {
    date: isoDate(body.date, 'Date'),
    amount: positiveAmount(body.amount),
    category_id: requireCategory(body.category_id, 'income'),
    description: requiredText(body.description, 'Description'),
    reference: optionalText(body.reference, 'Reference number', 60),
  };
}

router.get('/', (req, res) => {
  const direction = String(req.query.sort ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const rows = db.prepare(`${SELECT_INCOME} ORDER BY i.date ${direction}, i.id ${direction}`).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const entry = readBody(req.body);
  const info = db
    .prepare(
      `INSERT INTO income (date, amount, category_id, description, reference)
       VALUES (@date, @amount, @category_id, @description, @reference)`
    )
    .run(entry);
  res.status(201).json(db.prepare(`${SELECT_INCOME} WHERE i.id = ?`).get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const id = intId(req.params.id, 'Income entry');
  const existing = db.prepare('SELECT id, invoice_id FROM income WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Income entry not found.' });
  if (existing.invoice_id) {
    throw new ValidationError(
      'This entry was created by a paid invoice. Edit the invoice instead.'
    );
  }

  const entry = readBody(req.body);
  db.prepare(
    `UPDATE income
     SET date = @date, amount = @amount, category_id = @category_id,
         description = @description, reference = @reference
     WHERE id = @id`
  ).run({ ...entry, id });
  res.json(db.prepare(`${SELECT_INCOME} WHERE i.id = ?`).get(id));
});

router.delete('/:id', (req, res) => {
  const id = intId(req.params.id, 'Income entry');
  const existing = db.prepare('SELECT id, invoice_id FROM income WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Income entry not found.' });
  if (existing.invoice_id) {
    throw new ValidationError(
      'This entry was created by a paid invoice. Mark the invoice unpaid to remove it.'
    );
  }

  db.prepare('DELETE FROM income WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
