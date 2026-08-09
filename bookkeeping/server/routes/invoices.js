import { Router } from 'express';
import db from '../db.js';
import {
  ValidationError,
  intId,
  isoDate,
  optionalEmail,
  optionalText,
  positiveAmount,
  requiredText,
} from '../validate.js';

const router = Router();

export function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Invoice numbers look like INV-0001. The next one is derived from the highest
// numeric suffix already stored, so gaps from deleted invoices are not reused.
export function nextInvoiceNumber() {
  const rows = db.prepare('SELECT invoice_number FROM invoices').all();
  let highest = 0;
  for (const { invoice_number: number } of rows) {
    const match = /(\d+)\s*$/.exec(number);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `INV-${String(highest + 1).padStart(4, '0')}`;
}

function withStatus(invoice) {
  const overdue =
    invoice.status !== 'paid' && invoice.status !== 'draft' && invoice.due_date < todayIso();
  return {
    ...invoice,
    total: Math.round(invoice.total * 100) / 100,
    display_status: overdue ? 'overdue' : invoice.status,
  };
}

const SELECT_INVOICE = `
  SELECT inv.*,
         COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = inv.id), 0) AS total
  FROM invoices inv
`;

function getInvoice(id) {
  const invoice = db.prepare(`${SELECT_INVOICE} WHERE inv.id = ?`).get(id);
  if (!invoice) return null;
  const items = db
    .prepare(
      'SELECT id, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position, id'
    )
    .all(id);
  return { ...withStatus(invoice), items };
}

function readBody(body) {
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) throw new ValidationError('Add at least one line item.');
  if (rawItems.length > 100) throw new ValidationError('An invoice can hold up to 100 line items.');

  const items = rawItems.map((item, index) => ({
    description: requiredText(item.description, `Line ${index + 1} description`, 200),
    amount: positiveAmount(item.amount, `Line ${index + 1} amount`),
    position: index,
  }));

  const dateIssued = isoDate(body.date_issued, 'Date issued');
  const dueDate = isoDate(body.due_date, 'Due date');
  if (dueDate < dateIssued) {
    throw new ValidationError('Due date cannot be before the date issued.');
  }

  return {
    fields: {
      client_name: requiredText(body.client_name, 'Client name', 120),
      client_email: optionalEmail(body.client_email, 'Client email'),
      date_issued: dateIssued,
      due_date: dueDate,
      notes: optionalText(body.notes, 'Notes', 1000),
    },
    items,
  };
}

function invoiceStatus(value) {
  const status = String(value ?? '').trim();
  if (!['draft', 'sent', 'paid'].includes(status)) {
    throw new ValidationError('Status must be draft, sent or paid.');
  }
  return status;
}

function incomeCategoryId(preferred) {
  if (preferred !== undefined && preferred !== null && preferred !== '') {
    const id = intId(preferred, 'Category');
    const category = db.prepare('SELECT id, type FROM categories WHERE id = ?').get(id);
    if (!category || category.type !== 'income') throw new ValidationError('Choose a valid income category.');
    return id;
  }
  const sales = db
    .prepare("SELECT id FROM categories WHERE type = 'income' AND name = 'Sales'")
    .get();
  if (sales) return sales.id;
  const fallback = db
    .prepare("SELECT id FROM categories WHERE type = 'income' ORDER BY id LIMIT 1")
    .get();
  if (!fallback) throw new ValidationError('Add an income category before marking invoices paid.');
  return fallback.id;
}

router.get('/', (req, res) => {
  const rows = db.prepare(`${SELECT_INVOICE} ORDER BY inv.date_issued DESC, inv.id DESC`).all();
  res.json(rows.map(withStatus));
});

router.get('/next-number', (req, res) => {
  res.json({ invoice_number: nextInvoiceNumber() });
});

router.get('/:id', (req, res) => {
  const invoice = getInvoice(intId(req.params.id, 'Invoice'));
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(invoice);
});

router.post('/', (req, res) => {
  const data = readBody(req.body);
  const status = req.body.status ? invoiceStatus(req.body.status) : 'draft';
  if (status === 'paid') {
    throw new ValidationError('Create the invoice first, then mark it as paid.');
  }

  const create = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO invoices (invoice_number, client_name, client_email, date_issued, due_date, status, notes)
         VALUES (@invoice_number, @client_name, @client_email, @date_issued, @due_date, @status, @notes)`
      )
      .run({ ...data.fields, invoice_number: nextInvoiceNumber(), status });
    const invoiceId = info.lastInsertRowid;
    const insertItem = db.prepare(
      'INSERT INTO invoice_items (invoice_id, description, amount, position) VALUES (?, ?, ?, ?)'
    );
    for (const item of data.items) {
      insertItem.run(invoiceId, item.description, item.amount, item.position);
    }
    return invoiceId;
  });

  res.status(201).json(getInvoice(create()));
});

router.put('/:id', (req, res) => {
  const id = intId(req.params.id, 'Invoice');
  const existing = db.prepare('SELECT id, status FROM invoices WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Invoice not found.' });
  if (existing.status === 'paid') {
    throw new ValidationError('A paid invoice cannot be edited. Mark it unpaid first.');
  }

  const data = readBody(req.body);
  const status = req.body.status ? invoiceStatus(req.body.status) : existing.status;
  if (status === 'paid') {
    throw new ValidationError('Use the "Mark as paid" action to record payment.');
  }

  const update = db.transaction(() => {
    db.prepare(
      `UPDATE invoices
       SET client_name = @client_name, client_email = @client_email, date_issued = @date_issued,
           due_date = @due_date, notes = @notes, status = @status
       WHERE id = @id`
    ).run({ ...data.fields, status, id });
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
    const insertItem = db.prepare(
      'INSERT INTO invoice_items (invoice_id, description, amount, position) VALUES (?, ?, ?, ?)'
    );
    for (const item of data.items) {
      insertItem.run(id, item.description, item.amount, item.position);
    }
  });
  update();

  res.json(getInvoice(id));
});

// Status changes are the only path to "paid", because paying an invoice also
// writes the matching income entry (and un-paying removes it again).
router.post('/:id/status', (req, res) => {
  const id = intId(req.params.id, 'Invoice');
  const invoice = db.prepare(`${SELECT_INVOICE} WHERE inv.id = ?`).get(id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  const status = invoiceStatus(req.body.status);
  if (status === invoice.status) return res.json(getInvoice(id));

  if (status === 'paid') {
    if (invoice.total <= 0) throw new ValidationError('Add a line item before marking as paid.');
    const paidDate = req.body.paid_date ? isoDate(req.body.paid_date, 'Payment date') : todayIso();
    const categoryId = incomeCategoryId(req.body.category_id);

    db.transaction(() => {
      db.prepare("UPDATE invoices SET status = 'paid', paid_date = ? WHERE id = ?").run(paidDate, id);
      db.prepare('DELETE FROM income WHERE invoice_id = ?').run(id);
      db.prepare(
        `INSERT INTO income (date, amount, category_id, description, reference, invoice_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        paidDate,
        Math.round(invoice.total * 100) / 100,
        categoryId,
        `Invoice ${invoice.invoice_number} — ${invoice.client_name}`,
        invoice.invoice_number,
        id
      );
    })();
  } else {
    db.transaction(() => {
      db.prepare('UPDATE invoices SET status = ?, paid_date = NULL WHERE id = ?').run(status, id);
      db.prepare('DELETE FROM income WHERE invoice_id = ?').run(id);
    })();
  }

  res.json(getInvoice(id));
});

router.delete('/:id', (req, res) => {
  const id = intId(req.params.id, 'Invoice');
  const invoice = db.prepare('SELECT id, status FROM invoices WHERE id = ?').get(id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  if (invoice.status === 'paid') {
    throw new ValidationError('A paid invoice cannot be deleted. Mark it unpaid first.');
  }

  db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
