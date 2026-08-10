import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatMoney, monthLabel } from '../format.js';

export default function Dashboard({ refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard')
      .then((result) => active && setData(result))
      .catch((loadError) => active && setError(loadError.message));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (error) return <p className="form-error-banner">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">{monthLabel(data.month)}</p>
        </div>
      </header>

      <div className="card-grid">
        <SummaryCard label="Income this month" value={data.month_income} />
        <SummaryCard label="Expenses this month" value={data.month_expenses} />
        <SummaryCard label="Net profit this month" value={data.month_net} tone={data.month_net < 0 ? 'negative' : 'positive'} />
        <SummaryCard label="Running balance (all time)" value={data.running_balance} tone={data.running_balance < 0 ? 'negative' : undefined} />
      </div>

      {data.outstanding_invoices.count > 0 && (
        <p className="notice">
          {data.outstanding_invoices.count} unpaid{' '}
          {data.outstanding_invoices.count === 1 ? 'invoice' : 'invoices'} worth{' '}
          {formatMoney(data.outstanding_invoices.total)}.{' '}
          <Link to="/invoices">View invoices</Link>
        </p>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Last 5 transactions</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  Nothing recorded yet. Add income or an expense to get started.
                </td>
              </tr>
            )}
            {data.recent.map((entry) => (
              <tr key={`${entry.type}-${entry.id}`}>
                <td data-label="Date">{formatDate(entry.date)}</td>
                <td data-label="Description">{entry.description}</td>
                <td data-label="Category">
                  <span className="pill">{entry.category ?? 'Uncategorised'}</span>
                </td>
                <td
                  data-label="Type"
                  className={entry.type === 'income' ? 'positive' : 'negative'}
                >
                  {entry.type === 'income' ? 'Income' : 'Expense'}
                </td>
                <td data-label="Amount" className="right mono">
                  {entry.type === 'income' ? '' : '−'}
                  {formatMoney(entry.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="summary-card">
      <span className="summary-label">{label}</span>
      <strong className={`summary-value${tone ? ` ${tone}` : ''}`}>{formatMoney(value)}</strong>
    </div>
  );
}
