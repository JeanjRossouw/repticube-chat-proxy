# Bookkeeping

A simple bookkeeping app for one company. It runs entirely on your own computer:
nothing is uploaded anywhere, and all data sits in a single file on your disk.

## Getting started

### 1. Install Node.js

Download the **LTS** version from <https://nodejs.org> and run the installer
(any version from Node 18 upwards works). To check it worked, open a terminal
and run:

```bash
node -v
```

You should see a version number such as `v22.11.0`.

### 2. Install the app

In a terminal, go to this folder and run:

```bash
cd bookkeeping
npm install
```

This downloads everything the app needs. It only has to be done once.

### 3. Load example data (optional)

If you would like to see the app filled in with three months of example
transactions and invoices before adding your own:

```bash
npm run seed
```

Skip this step to start with an empty set of books. Running it later **replaces
all existing entries**, so only use it on a fresh install.

### 4. Start the app

```bash
npm start
```

Then open <http://localhost:3000> in your browser.

Leave the terminal window open while you work — closing it stops the app. To
stop it deliberately, click the terminal and press `Ctrl+C`.

## Using the app

The sidebar has six sections:

- **Dashboard** — income, expenses and profit for the current month, your
  all-time running balance, and the last five transactions.
- **Income** — record money coming in. Click a column heading date arrow to
  flip the sort order.
- **Expenses** — record money going out.
- **Invoices** — create invoices with as many line items as you need. Invoice
  numbers are assigned automatically (`INV-0001`, `INV-0002`, …). Marking an
  invoice as paid automatically creates a matching income entry; marking it
  unpaid again removes that entry. Click an invoice number to open a clean
  printable version, then use **Print / Save as PDF**.
- **Reports** — a profit and loss table for any date range, broken down by
  category. Presets cover this month, last month, this year and last year.
- **Settings** — your company name, address and email (these appear on printed
  invoices), plus the categories used by income and expense entries.

Dates are shown as DD/MM/YYYY throughout. Every delete asks for confirmation
first, and forms refuse to save with missing fields or amounts of zero or less.

A few deliberate guard rails:

- A **paid invoice** cannot be edited or deleted, and the income entry it
  created cannot be edited or deleted on its own. Mark the invoice unpaid
  first — that keeps the books and the invoices in step.
- A **category that is already in use** cannot be deleted. Move those entries
  to another category first.

## Your data

Everything lives in one file: `data/bookkeeping.db` (plus two temporary
`-shm` / `-wal` files SQLite uses while running). The database and its tables
are created automatically the first time the app starts.

To back up your books, stop the app and copy the `data` folder somewhere safe.
To start over, stop the app and delete the `data` folder — a fresh, empty
database is created on the next start.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies (run once) |
| `npm start` | Starts the app on <http://localhost:3000> |
| `npm run seed` | Replaces all data with three months of examples |
| `npm run build` | Builds the frontend for offline use (optional) |

`npm start` runs two things at once: the API server on port 4000 and the web
interface on port 3000. You only ever open port 3000 in the browser.

If one of those ports is already used by something else, override it:

- browser port: `CLIENT_PORT=3100 npm start`, then open <http://localhost:3100>
- API port: `PORT=4500 API_PORT=4500 npm start` (both names are needed — one
  tells the server where to listen, the other tells the web interface where to
  look)

After `npm run build`, the server alone can serve the whole app — run
`npm run server` and open <http://localhost:4000>.

## How it is built

- **Frontend** — React with React Router, built by Vite (`client/`)
- **Backend** — Node with Express (`server/`)
- **Database** — SQLite via better-sqlite3, one file in `data/`
