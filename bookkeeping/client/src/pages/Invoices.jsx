import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatMoney } from '../format.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
import Modal from '../components/Modal.jsx';

const STATUS_LABEL = { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue' };

export default function Invoices({ onDataChanged }) {
  const [invoices, setInvoices] = useState([]);
  const [nextNumber, setNextNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | invoice
  const [confirm, setConfirm] = useState(null); // { kind, invoice }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, next] = await Promise.all([
        api.get('/invoices'),
        api.get('/invoices/next-number'),
      ]);
      setInvoices(list);
      setNextNumber(next.invoice_number);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (values) => {
    if (editing === 'new') await api.post('/invoices', values);
    else await api.put(`/invoices/${editing.id}`, values);
    setEditing(null);
    await load();
    onDataChanged?.();
  };

  const openEdit = async (invoice) => {
    try {
      setEditing(await api.get(`/invoices/${invoice.id}`));
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const runConfirm = async () => {
    const { kind, invoice } = confirm;
    setBusy(true);
    try {
      if (kind === 'delete') await api.del(`/invoices/${invoice.id}`);
      if (kind === 'pay') await api.post(`/invoices/${invoice.id}/status`, { status: 'paid' });
      if (kind === 'unpay') await api.post(`/invoices/${invoice.id}/status`, { status: 'sent' });
      setConfirm(null);
      await load();
      onDataChanged?.();
    } catch (actionError) {
      setError(actionError.message);
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy = () => {
    if (!confirm) return {};
    const { kind, invoice } = confirm;
    if (kind === 'delete') {
      return {
        title: `Delete invoice ${invoice.invoice_number}?`,
        message: `The invoice for ${invoice.client_name} will be removed permanently.`,
        confirmLabel: 'Delete invoice',
      };
    }
    if (kind === 'pay') {
      return {
        title: `Mark ${invoice.invoice_number} as paid?`,
        message: `This records an income entry of ${formatMoney(invoice.total)} dated today.`,
        confirmLabel: 'Mark as paid',
      };
    }
    return {
      title: `Mark ${invoice.invoice_number} as unpaid?`,
      message: 'The income entry created when this invoice was paid will be removed.',
      confirmLabel: 'Mark as unpaid',
    };
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Invoices</h1>
          <p className="page-subtitle">
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
          </p>
        </div>
        <button type="button" className="button primary" onClick={() => setEditing('new')}>
          New invoice
        </button>
      </header>

      {error && <p className="form-error-banner">{error}</p>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Status</th>
              <th className="right">Total</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="empty">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No invoices yet. Use “New invoice” to create the first one.
                </td>
              </tr>
            )}
            {!loading &&
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td data-label="Number" className="mono">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoice_number}</Link>
                  </td>
                  <td data-label="Client">{invoice.client_name}</td>
                  <td data-label="Issued">{formatDate(invoice.date_issued)}</td>
                  <td data-label="Due">{formatDate(invoice.due_date)}</td>
                  <td data-label="Status">
                    <span className={`status status-${invoice.display_status}`}>
                      {STATUS_LABEL[invoice.display_status]}
                    </span>
                  </td>
                  <td data-label="Total" className="right mono">
                    {formatMoney(invoice.total)}
                  </td>
                  <td className="right nowrap actions-cell">
                    <Link className="link-button" to={`/invoices/${invoice.id}`}>
                      View
                    </Link>
                    {invoice.status !== 'paid' ? (
                      <>
                        <button type="button" className="link-button" onClick={() => openEdit(invoice)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setConfirm({ kind: 'pay', invoice })}
                        >
                          Mark paid
                        </button>
                        <button
                          type="button"
                          className="link-button danger"
                          onClick={() => setConfirm({ kind: 'delete', invoice })}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setConfirm({ kind: 'unpay', invoice })}
                      >
                        Mark unpaid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'New invoice' : `Edit ${editing.invoice_number}`}
          onClose={() => setEditing(null)}
          width={680}
        >
          <InvoiceForm
            initial={editing === 'new' ? null : editing}
            nextNumber={nextNumber}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          {...confirmCopy()}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
          busy={busy}
        />
      )}
    </section>
  );
}
