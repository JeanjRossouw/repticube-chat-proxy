import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/income', label: 'Income' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout({ companyName }) {
  const nav = useRef(null);
  const { pathname } = useLocation();

  // On a phone the navigation scrolls sideways, so keep the current section
  // visible when the page changes.
  useEffect(() => {
    const active = nav.current?.querySelector('.is-active');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">£</span>
          <span className="sidebar-brand-text">{companyName || 'Bookkeeping'}</span>
        </div>
        <nav ref={nav}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
