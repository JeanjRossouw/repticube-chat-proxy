import { Router } from 'express';
import db from '../db.js';
import { ValidationError, intId, requiredText } from '../validate.js';

const router = Router();

function categoryType(value) {
  const type = String(value ?? '').trim();
  if (type !== 'income' && type !== 'expense') {
    throw new ValidationError('Category type must be income or expense.');
  }
  return type;
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT id, name, type FROM categories ORDER BY type, name COLLATE NOCASE')
    .all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const name = requiredText(req.body.name, 'Category name', 60);
  const type = categoryType(req.body.type);

  const existing = db
    .prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND type = ?')
    .get(name, type);
  if (existing) throw new ValidationError('That category already exists.');

  const info = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
  res.status(201).json({ id: info.lastInsertRowid, name, type });
});

router.delete('/:id', (req, res) => {
  const id = intId(req.params.id, 'Category');
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ error: 'Category not found.' });

  const inUse =
    db.prepare('SELECT COUNT(*) AS n FROM income WHERE category_id = ?').get(id).n +
    db.prepare('SELECT COUNT(*) AS n FROM expenses WHERE category_id = ?').get(id).n;
  if (inUse > 0) {
    throw new ValidationError(
      `This category is used by ${inUse} ${inUse === 1 ? 'entry' : 'entries'} and cannot be deleted.`
    );
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
