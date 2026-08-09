import { useState } from 'react';
import { todayIso } from '../format.js';

// Income and expense entries only differ by their optional field, so both
// forms share this component.
export default function TransactionForm({ kind, categories, initial, onSubmit, onCancel }) {
  const optionalField =
    kind === 'income'
      ? { name: 'reference', label: 'Reference number (optional)', placeholder: 'e.g. REC-1042' }
      : { name: 'receipt_note', label: 'Receipt note (optional)', placeholder: 'e.g. Receipt in folder B' };

  const [values, setValues] = useState({
    date: initial?.date ?? todayIso(),
    amount: initial?.amount != null ? String(initial.amount) : '',
    category_id: initial?.category_id ? String(initial.category_id) : '',
    description: initial?.description ?? '',
    [optionalField.name]: initial?.[optionalField.name] ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (!values.date) found.date = 'Choose a date.';
    const amount = Number(values.amount);
    if (values.amount === '' ) found.amount = 'Enter an amount.';
    else if (!Number.isFinite(amount)) found.amount = 'Amount must be a number.';
    else if (amount <= 0) found.amount = 'Amount must be greater than zero.';
    if (!values.category_id) found.category_id = 'Choose a category.';
    if (!values.description.trim()) found.description = 'Enter a description.';
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setBusy(true);
    try {
      await onSubmit({
        date: values.date,
        amount: Number(values.amount),
        category_id: Number(values.category_id),
        description: values.description.trim(),
        [optionalField.name]: values[optionalField.name].trim(),
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

      <div className="form-grid">
        <label className="field">
          <span>Date</span>
          <input type="date" value={values.date} onChange={(e) => setField('date', e.target.value)} />
          {errors.date && <em className="field-error">{errors.date}</em>}
        </label>

        <label className="field">
          <span>Amount</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            value={values.amount}
            onChange={(e) => setField('amount', e.target.value)}
          />
          {errors.amount && <em className="field-error">{errors.amount}</em>}
        </label>
      </div>

      <label className="field">
        <span>Category</span>
        <select value={values.category_id} onChange={(e) => setField('category_id', e.target.value)}>
          <option value="">Choose a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && <em className="field-error">{errors.category_id}</em>}
      </label>

      <label className="field">
        <span>Description</span>
        <input
          type="text"
          value={values.description}
          placeholder="What was this for?"
          onChange={(e) => setField('description', e.target.value)}
        />
        {errors.description && <em className="field-error">{errors.description}</em>}
      </label>

      <label className="field">
        <span>{optionalField.label}</span>
        <input
          type="text"
          value={values[optionalField.name]}
          placeholder={optionalField.placeholder}
          onChange={(e) => setField(optionalField.name, e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="button ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </form>
  );
}
