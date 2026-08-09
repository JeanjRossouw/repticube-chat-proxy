import { useState } from 'react';
import { api } from '../api.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Settings({ settings, categories, onSettingsSaved, onCategoriesChanged }) {
  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Company details and categories</p>
        </div>
      </header>

      <CompanyForm settings={settings} onSaved={onSettingsSaved} />

      <div className="two-column">
        <CategoryPanel
          title="Income categories"
          type="income"
          categories={categories.filter((category) => category.type === 'income')}
          onChanged={onCategoriesChanged}
        />
        <CategoryPanel
          title="Expense categories"
          type="expense"
          categories={categories.filter((category) => category.type === 'expense')}
          onChanged={onCategoriesChanged}
        />
      </div>
    </section>
  );
}

function CompanyForm({ settings, onSaved }) {
  const [values, setValues] = useState(settings);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!values.company_name.trim()) found.company_name = 'Enter the company name.';
    if (values.company_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.company_email.trim())) {
      found.company_email = 'Enter a valid email address.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const saved = await api.put('/settings', values);
      onSaved(saved);
      setStatus('Saved.');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card padded">
      <div className="card-header">
        <h2>Company details</h2>
        <p className="muted small">These appear on printed invoices.</p>
      </div>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="form-error-banner">{errors.form}</p>}

        <label className="field">
          <span>Company name</span>
          <input
            type="text"
            value={values.company_name}
            onChange={(e) => setField('company_name', e.target.value)}
          />
          {errors.company_name && <em className="field-error">{errors.company_name}</em>}
        </label>

        <label className="field">
          <span>Address</span>
          <textarea
            rows={3}
            value={values.company_address}
            onChange={(e) => setField('company_address', e.target.value)}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={values.company_email}
            onChange={(e) => setField('company_email', e.target.value)}
          />
          {errors.company_email && <em className="field-error">{errors.company_email}</em>}
        </label>

        <div className="form-actions">
          {status && <span className="saved-note">{status}</span>}
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </form>
    </div>
  );
}

function CategoryPanel({ title, type, categories, onChanged }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const add = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/categories', { name: name.trim(), type });
      setName('');
      setError('');
      await onChanged();
    } catch (addError) {
      setError(addError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.del(`/categories/${deleting.id}`);
      setDeleting(null);
      setError('');
      await onChanged();
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card padded">
      <div className="card-header">
        <h2>{title}</h2>
      </div>

      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <button type="button" className="link-button danger" onClick={() => setDeleting(category)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <form className="inline-form" onSubmit={add}>
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
        />
        <button type="submit" className="button ghost" disabled={busy}>
          Add
        </button>
      </form>
      {error && <em className="field-error">{error}</em>}

      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.name}”?`}
          message="Categories already used by an entry cannot be deleted."
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
