import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api.js';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InvoiceView from './pages/InvoiceView.jsx';
import Invoices from './pages/Invoices.jsx';
import Ledger from './pages/Ledger.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

const EMPTY_SETTINGS = { company_name: '', company_address: '', company_email: '' };

export default function App() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  // Bumped whenever a ledger entry or invoice changes, so the dashboard and
  // reports refetch instead of showing stale totals.
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCategories = useCallback(async () => {
    setCategories(await api.get('/categories'));
  }, []);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/settings')])
      .then(([categoryList, savedSettings]) => {
        setCategories(categoryList);
        setSettings({ ...EMPTY_SETTINGS, ...savedSettings });
      })
      .catch((loadError) =>
        setError(
          `${loadError.message} Is the server running? Start both parts with "npm start".`
        )
      )
      .finally(() => setReady(true));
  }, []);

  const onDataChanged = useCallback(() => setRefreshKey((key) => key + 1), []);

  if (!ready) return <p className="boot">Loading…</p>;
  if (error) return <p className="boot form-error-banner">{error}</p>;

  return (
    <Routes>
      <Route element={<Layout companyName={settings.company_name} />}>
        <Route index element={<Dashboard refreshKey={refreshKey} />} />
        <Route
          path="income"
          element={<Ledger kind="income" categories={categories} onDataChanged={onDataChanged} />}
        />
        <Route
          path="expenses"
          element={<Ledger kind="expense" categories={categories} onDataChanged={onDataChanged} />}
        />
        <Route path="invoices" element={<Invoices onDataChanged={onDataChanged} />} />
        <Route path="invoices/:id" element={<InvoiceView settings={settings} />} />
        <Route path="reports" element={<Reports refreshKey={refreshKey} />} />
        <Route
          path="settings"
          element={
            <Settings
              settings={settings}
              categories={categories}
              onSettingsSaved={setSettings}
              onCategoriesChanged={loadCategories}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
