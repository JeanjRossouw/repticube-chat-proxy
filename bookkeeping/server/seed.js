// Populates the database with three months of example data so a new install
// has something to look at. Running it replaces any existing entries.
import db from './db.js';

const pad = (n) => String(n).padStart(2, '0');
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Day `day` of the month that is `monthsAgo` months before the current one,
// clamped so it never rolls into the following month.
function dayIn(monthsAgo, day) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  return iso(new Date(base.getFullYear(), base.getMonth(), Math.min(day, lastDay)));
}

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return iso(new Date(y, m - 1, d + days));
}

// Payments are never dated in the future, so the current month still looks
// plausible right after seeding.
function paymentDate(issued) {
  const today = iso(new Date());
  const nominal = addDays(issued, 12);
  return nominal > today ? today : nominal;
}

const categoryId = (name, type) =>
  db.prepare('SELECT id FROM categories WHERE name = ? AND type = ?').get(name, type).id;

const INCOME = [
  ['Sales', 'Product sales — retail', 4820.5, 4],
  ['Services', 'Consulting retainer', 3200, 9],
  ['Sales', 'Product sales — wholesale', 2650, 17],
  ['Other Income', 'Interest received', 118.4, 24],
  ['Services', 'Support contract', 1450, 27],
];

const EXPENSES = [
  ['Salaries', 'Monthly payroll', 6200, 25],
  ['Software', 'SaaS subscriptions', 289.99, 3],
  ['Marketing', 'Online advertising', 640, 8],
  ['Office', 'Rent and utilities', 1350, 1],
  ['Travel', 'Client visits', 412.75, 14],
  ['Professional Fees', 'Accountant', 750, 20],
  ['Other', 'Courier and postage', 96.3, 22],
];

const CLIENTS = [
  ['Harbour Group', 'accounts@harbourgroup.example'],
  ['Nordfield Interiors', 'billing@nordfield.example'],
  ['Rivera & Co', 'finance@riveraco.example'],
];

function nextInvoiceNumber(offset) {
  return `INV-${String(offset).padStart(4, '0')}`;
}

const seed = db.transaction(() => {
  db.prepare('DELETE FROM income').run();
  db.prepare('DELETE FROM expenses').run();
  db.prepare('DELETE FROM invoice_items').run();
  db.prepare('DELETE FROM invoices').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('income','expenses','invoices','invoice_items')").run();

  db.prepare(
    `UPDATE settings
     SET company_name = 'Northbridge Trading Ltd',
         company_address = '14 Mill Lane\nBristol\nBS1 4RT\nUnited Kingdom',
         company_email = 'accounts@northbridge.example'
     WHERE id = 1`
  ).run();

  const insertIncome = db.prepare(
    `INSERT INTO income (date, amount, category_id, description, reference, invoice_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertExpense = db.prepare(
    `INSERT INTO expenses (date, amount, category_id, description, receipt_note)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertInvoice = db.prepare(
    `INSERT INTO invoices (invoice_number, client_name, client_email, date_issued, due_date, status, paid_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    'INSERT INTO invoice_items (invoice_id, description, amount, position) VALUES (?, ?, ?, ?)'
  );

  let invoiceCount = 0;

  // Three months of ledger entries, gently varied month to month.
  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo -= 1) {
    const factor = 1 + (2 - monthsAgo) * 0.08;

    for (const [category, description, amount, day] of INCOME) {
      const date = dayIn(monthsAgo, day);
      if (date > iso(new Date())) continue;
      insertIncome.run(
        date,
        Math.round(amount * factor * 100) / 100,
        categoryId(category, 'income'),
        description,
        `REC-${date.replace(/-/g, '').slice(2)}`,
        null
      );
    }

    for (const [category, description, amount, day] of EXPENSES) {
      const date = dayIn(monthsAgo, day);
      if (date > iso(new Date())) continue;
      insertExpense.run(
        date,
        Math.round(amount * factor * 100) / 100,
        categoryId(category, 'expense'),
        description,
        `Receipt filed ${date}`
      );
    }

    // One invoice per client per month: paid, sent (overdue in older months)
    // and draft, so every status is visible in the list.
    CLIENTS.forEach(([client, email], index) => {
      const issued = dayIn(monthsAgo, 5 + index * 7);
      if (issued > iso(new Date())) return;
      const due = addDays(issued, 30);
      const status = index === 0 ? 'paid' : index === 1 ? 'sent' : 'draft';
      invoiceCount += 1;
      const number = nextInvoiceNumber(invoiceCount);
      const info = insertInvoice.run(
        number,
        client,
        email,
        issued,
        due,
        status,
        status === 'paid' ? paymentDate(issued) : null,
        status === 'draft' ? 'Awaiting final sign-off.' : null
      );
      const invoiceId = info.lastInsertRowid;

      const items = [
        ['Consulting — project work', Math.round(1800 * factor * 100) / 100],
        ['Materials and supplies', Math.round(420.5 * factor * 100) / 100],
      ];
      items.forEach(([description, amount], position) => {
        insertItem.run(invoiceId, description, amount, position);
      });

      if (status === 'paid') {
        const total = Math.round(items.reduce((sum, [, amount]) => sum + amount, 0) * 100) / 100;
        insertIncome.run(
          paymentDate(issued),
          total,
          categoryId('Sales', 'income'),
          `Invoice ${number} — ${client}`,
          number,
          invoiceId
        );
      }
    });
  }
});

seed();

const counts = {
  income: db.prepare('SELECT COUNT(*) AS n FROM income').get().n,
  expenses: db.prepare('SELECT COUNT(*) AS n FROM expenses').get().n,
  invoices: db.prepare('SELECT COUNT(*) AS n FROM invoices').get().n,
};

console.log('Example data loaded:');
console.log(`  ${counts.income} income entries`);
console.log(`  ${counts.expenses} expense entries`);
console.log(`  ${counts.invoices} invoices`);
console.log('Run "npm start" and open http://localhost:3000');
