import { useState } from 'react';
import { formatMoney, todayIso } from '../format.js';

function defaultDueDate(issued) {
  const [year, month, day] = issued.split('-').map(Number);
  const due = new Date(year, month - 1, day + 30);
  const pad = (n) => String(n).padStart(2, '0');
  return `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`;
}

export default function InvoiceForm({ initial, nextNumber, onSubmit, onCancel }) {
  const issuedDefault = initial?.date_issued ?? todayIso();
  const [values, setValues] = useState({
    client_name: initial?.client_name ?? '',
    client_email: initial?.client_email ?? '',
    date_issued: issuedDefault,
    due_date: initial?.due_date ?? defaultDueDate(issuedDefault),
    status: initial?.status ?? 'draft',
    notes: initial?.notes ?? '',
  });
  const [items, setItems] = useState(
    initial?.items?.length
      ? initial.items.map((item) => ({ description: item.description, amount: String(item.amount) }))
      : [{ description: '', amount: '' }]
  );
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const setItem = (index, name, value) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [name]: value } : item)));
    setItemErrors((current) => ({ ...current, [`${index}-${name}`]: undefined }));
  };

  const total = items.reduce((sum, item) => {
    const amount = Number(item.amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const validate = () => {
    const found = {};
    const foundItems = {};

    if (!values.client_name.trim()) found.client_name = 'Enter the client name.';
    if (values.client_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.client_email.trim())) {
      found.client_email = 'Enter a valid email address.';
    }
    if (!values.date_issued) found.date_issued = 'Choose the date issued.';
    if (!values.due_date) found.due_date = 'Choose a due date.';
    if (values.date_issued && values.due_date && values.due_date < values.date_issued) {
      found.due_date = 'Due date cannot be before the date issued.';
    }

    items.forEach((item, index) => {
      if (!item.description.trim()) foundItems[`${index}-description`] = 'Required';
      const amount = Number(item.amount);
      if (item.amount === '') foundItems[`${index}-amount`] = 'Required';
      else if (!Number.isFinite(amount) || amount <= 0) foundItems[`${index}-amount`] = 'Must be above 0';
    });

    setErrors(found);
    setItemErrors(foundItems);
    return Object.keys(found).length === 0 && Object.keys(foundItems).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setBusy(true);
    try {
      await onSubmit({
        client_name: values.client_name.trim(),
        client_email: values.client_email.trim(),
        date_issued: values.date_issued,
        due_date: values.due_date,
        status: values.status,
        notes: values.notes.trim(),
        items: items.map((item) => ({
          description: item.description.trim(),
          amount: Number(item.amount),
        })),
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError && <p className="form-error-banner">{submitError}</p>}

      <p className="muted small">
        Invoice number <strong>{initial?.invoice_number ?? nextNumber ?? '…'}</strong> (assigned automatically)
      </p>

      <div className="form-grid pairs">
        <label className="field">
          <span>Client name</span>
          <input
            type="text"
            value={values.client_name}
            onChange={(e) => setField('client_name', e.target.value)}
          />
          {errors.client_name && <em className="field-error">{errors.client_name}</em>}
        </label>

        <label className="field">
          <span>Client email (optional)</span>
          <input
            type="email"
            value={values.client_email}
            onChange={(e) => setField('client_email', e.target.value)}
          />
          {errors.client_email && <em className="field-error">{errors.client_email}</em>}
        </label>

        <label className="field">
          <span>Date issued</span>
          <input
            type="date"
            value={values.date_issued}
            onChange={(e) => setField('date_issued', e.target.value)}
          />
          {errors.date_issued && <em className="field-error">{errors.date_issued}</em>}
        </label>

        <label className="field">
          <span>Due date</span>
          <input type="date" value={values.due_date} onChange={(e) => setField('due_date', e.target.value)} />
          {errors.due_date && <em className="field-error">{errors.due_date}</em>}
        </label>
      </div>

      <label className="field">
        <span>Status</span>
        <select value={values.status} onChange={(e) => setField('status', e.target.value)}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
        </select>
        <em className="field-hint">Use “Mark as paid” on the invoice list to record payment.</em>
      </label>

      <div className="line-items">
        <div className="line-items-header">
          <span>Line items</span>
          <button
            type="button"
            className="link-button"
            onClick={() => setItems((current) => [...current, { description: '', amount: '' }])}
          >
            + Add line
          </button>
        </div>

        {items.map((item, index) => (
          <div className="line-item" key={index}>
            <div className="field">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => setItem(index, 'description', e.target.value)}
              />
              {itemErrors[`${index}-description`] && (
                <em className="field-error">{itemErrors[`${index}-description`]}</em>
              )}
            </div>
            <div className="field line-item-amount">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={item.amount}
                onChange={(e) => setItem(index, 'amount', e.target.value)}
              />
              {itemErrors[`${index}-amount`] && (
                <em className="field-error">{itemErrors[`${index}-amount`]}</em>
              )}
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove line ${index + 1}`}
              disabled={items.length === 1}
              onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}

        <div className="line-items-total">
          <span>Total</span>
          <strong className="mono">{formatMoney(total)}</strong>
        </div>
      </div>

      <label className="field">
        <span>Notes (optional)</span>
        <textarea rows={2} value={values.notes} onChange={(e) => setField('notes', e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="button" className="button ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save invoice'}
        </button>
      </div>
    </form>
  );
}
