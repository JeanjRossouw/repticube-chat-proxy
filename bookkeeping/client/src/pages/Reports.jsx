import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate, formatMoney } from '../format.js';

const pad = (n) => String(n).padStart(2, '0');
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function presetRange(preset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (preset) {
    case 'last-month':
      return { from: iso(new Date(year, month - 1, 1)), to: iso(new Date(year, month, 0)) };
    case 'this-year':
      return { from: iso(new Date(year, 0, 1)), to: iso(new Date(year, 11, 31)) };
    case 'last-year':
      return { from: iso(new Date(year - 1, 0, 1)), to: iso(new Date(year - 1, 11, 31)) };
    case 'this-month':
    default:
      return { from: iso(new Date(year, month, 1)), to: iso(new Date(year, month + 1, 0)) };
  }
}

const PRESETS = [
  ['this-month', 'This month'],
  ['last-month', 'Last month'],
  ['this-year', 'This year'],
  ['last-year', 'Last year'],
  ['custom', 'Custom'],
];

export default function Reports({ refreshKey }) {
  const [preset, setPreset] = useState('this-month');
  const [range, setRange] = useState(() => presetRange('this-month'));
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!range.from || !range.to) return;
    try {
      setReport(await api.get(`/reports/pl?from=${range.from}&to=${range.to}`));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
      setReport(null);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const choosePreset = (value) => {
    setPreset(value);
    if (value !== 'custom') setRange(presetRange(value));
  };

  return (
    <section>
      <header className="page-header no-print">
        <div>
          <h1>Profit &amp; loss</h1>
          <p className="page-subtitle">
            {formatDate(range.from)} – {formatDate(range.to)}
          </p>
        </div>
        <button type="button" className="button ghost" onClick={() => window.print()}>
          Print
        </button>
      </header>

      <div className="card filter-bar no-print">
        <div className="preset-row">
          {PRESETS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`chip${preset === value ? ' is-active' : ''}`}
              onClick={() => choosePreset(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="form-grid">
            <label className="field">
              <span>From</span>
              <input
                type="date"
                value={range.from}
                onChange={(e) => setRange((current) => ({ ...current, from: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>To</span>
              <input
                type="date"
                value={range.to}
                onChange={(e) => setRange((current) => ({ ...current, to: e.target.value }))}
              />
            </label>
          </div>
        )}
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      {report && (
        <>
          <div className="card-grid">
            <Summary label="Total income" value={report.total_income} />
            <Summary label="Total expenses" value={report.total_expenses} />
            <Summary
              label="Gross profit"
              value={report.gross_profit}
              tone={report.gross_profit < 0 ? 'negative' : 'positive'}
            />
          </div>

          <Breakdown title="Income by category" rows={report.income} total={report.total_income} />
          <Breakdown title="Expenses by category" rows={report.expenses} total={report.total_expenses} />
        </>
      )}
    </section>
  );
}

function Summary({ label, value, tone }) {
  return (
    <div className="summary-card">
      <span className="summary-label">{label}</span>
      <strong className={`summary-value${tone ? ` ${tone}` : ''}`}>{formatMoney(value)}</strong>
    </div>
  );
}

function Breakdown({ title, rows, total }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th className="right">Entries</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                Nothing recorded in this period.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>
              <td className="right muted">{row.entries}</td>
              <td className="right mono">{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th />
            <th className="right mono">{formatMoney(total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
