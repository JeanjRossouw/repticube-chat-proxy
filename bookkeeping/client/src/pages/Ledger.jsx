import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate, formatMoney } from '../format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import TransactionForm from '../components/TransactionForm.jsx';

// Income and expenses share one page; `kind` selects the endpoint, wording and
// the optional column.
export default function Ledger({ kind, categories, onDataChanged }) {
  const isIncome = kind === 'income';
  const endpoint = isIncome ? '/income' : '/expenses';
  const noun = isIncome ? 'income' : 'expense';
  const optionalField = isIncome ? 'reference' : 'receipt_note';
  const optionalLabel = isIncome ? 'Reference' : 'Receipt note';

  const [entries, setEntries] = useState([]);
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | entry
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await api.get(`${endpoint}?sort=${sort}`));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (values) => {
    if (editing === 'new') await api.post(endpoint, values);
    else await api.put(`${endpoint}/${editing.id}`, values);
    setEditing(null);
    await load();
    onDataChanged?.();
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.del(`${endpoint}/${deleting.id}`);
      setDeleting(null);
      await load();
      onDataChanged?.();
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const categoryList = categories.filter((category) => category.type === noun);

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>{isIncome ? 'Income' : 'Expenses'}</h1>
          <p className="page-subtitle">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · total {formatMoney(total)}
          </p>
        </div>
        <button type="button" className="button primary" onClick={() => setEditing('new')}>
          Add {noun}
        </button>
      </header>

      {error && <p className="form-error-banner">{error}</p>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
                  title="Sort by date"
                >
                  Date {sort === 'desc' ? '↓' : '↑'}
                </button>
              </th>
              <th>Description</th>
              <th>Category</th>
              <th>{optionalLabel}</th>
              <th className="right">Amount</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="empty">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No {noun} entries yet. Use “Add {noun}” to record the first one.
                </td>
              </tr>
            )}
            {!loading &&
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.description}</td>
                  <td>
                    <span className="pill">{entry.category ?? 'Uncategorised'}</span>
                  </td>
                  <td className="muted">{entry[optionalField] || '—'}</td>
                  <td className="right mono">{formatMoney(entry.amount)}</td>
                  <td className="right nowrap">
                    <button type="button" className="link-button" onClick={() => setEditing(entry)}>
                      Edit
                    </button>
                    <button type="button" className="link-button danger" onClick={() => setDeleting(entry)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? `Add ${noun}` : `Edit ${noun}`}
          onClose={() => setEditing(null)}
        >
          <TransactionForm
            kind={noun}
            categories={categoryList}
            initial={editing === 'new' ? null : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete this ${noun} entry?`}
          message={`“${deleting.description}” for ${formatMoney(deleting.amount)} on ${formatDate(
            deleting.date
          )} will be removed permanently.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={deleteBusy}
        />
      )}
    </section>
  );
}
