import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatMoney } from '../format.js';

const STATUS_LABEL = { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue' };

// Print-ready view: everything outside `.invoice-sheet` is hidden by the print
// stylesheet, so the browser's own "Save as PDF" produces a clean document.
export default function InvoiceView({ settings }) {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get(`/invoices/${id}`)
      .then((result) => active && setInvoice(result))
      .catch((loadError) => active && setError(loadError.message));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className="form-error-banner">{error}</p>;
  if (!invoice) return <p className="muted">Loading…</p>;

  return (
    <section>
      <header className="page-header no-print">
        <div>
          <Link className="back-link" to="/invoices">
            ← Back to invoices
          </Link>
          <h1>Invoice {invoice.invoice_number}</h1>
        </div>
        <button type="button" className="button primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </header>

      <div className="invoice-sheet">
        <div className="invoice-top">
          <div>
            <h2 className="invoice-company">{settings.company_name || 'Your company'}</h2>
            {settings.company_address && <p className="invoice-address">{settings.company_address}</p>}
            {settings.company_email && <p className="invoice-address">{settings.company_email}</p>}
          </div>
          <div className="invoice-meta">
            <h3>Invoice</h3>
            <p className="mono">{invoice.invoice_number}</p>
            <p>
              <span className="muted">Issued</span> {formatDate(invoice.date_issued)}
            </p>
            <p>
              <span className="muted">Due</span> {formatDate(invoice.due_date)}
            </p>
            <p className={`status status-${invoice.display_status}`}>
              {STATUS_LABEL[invoice.display_status]}
            </p>
          </div>
        </div>

        <div className="invoice-client">
          <span className="muted">Billed to</span>
          <strong>{invoice.client_name}</strong>
          {invoice.client_email && <span className="muted">{invoice.client_email}</span>}
        </div>

        <table className="table invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="right mono">{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="right">Total</th>
              <th className="right mono">{formatMoney(invoice.total)}</th>
            </tr>
          </tfoot>
        </table>

        {invoice.paid_date && (
          <p className="invoice-note">Paid on {formatDate(invoice.paid_date)}.</p>
        )}
        {invoice.notes && <p className="invoice-note">{invoice.notes}</p>}
      </div>
    </section>
  );
}
