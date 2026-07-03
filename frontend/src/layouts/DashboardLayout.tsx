import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    title: 'Overview',
    links: [{ to: '/', label: 'Dashboard' }],
  },
  {
    title: 'Logistics Operations',
    links: [
      { to: '/bookings', label: 'Bookings & Jobs' },
      { to: '/trips', label: 'Trip Dispatch Board' },
      { to: '/logistics-reports', label: 'Operations Reports' },
    ],
  },
  {
    title: 'Fleet Management',
    links: [
      { to: '/vehicles', label: 'Vehicle Registry' },
      { to: '/drivers', label: 'Driver Directory' },
      { to: '/routes', label: 'Route Network' },
      { to: '/maintenance', label: 'Vehicle Maintenance' },
    ],
  },
  {
    title: 'Sales & CRM',
    links: [
      { to: '/customers', label: 'Customers' },
      { to: '/sales-orders', label: 'Sales Orders' },
      { to: '/sales-invoices', label: 'Sales Invoices' },
      { to: '/leads', label: 'CRM / Leads' },
    ],
  },
  {
    title: 'Purchases',
    links: [
      { to: '/suppliers', label: 'Suppliers' },
      { to: '/purchase-orders', label: 'Purchase Orders' },
      { to: '/purchase-invoices', label: 'Purchase Invoices' },
    ],
  },
  {
    title: 'Banking & Treasury',
    links: [
      { to: '/banking', label: 'Bank Accounts' },
      { to: '/journal-entries', label: 'Journal Entries' },
    ],
  },
  {
    title: 'Inventory & Fixed Assets',
    links: [
      { to: '/items', label: 'Items & Inventory' },
      { to: '/locations', label: 'Stock Locations' },
      { to: '/stock-transfers', label: 'Stock Transfers' },
      { to: '/fixed-assets', label: 'Fixed Assets' },
    ],
  },
  {
    title: 'Accounting & HR',
    links: [
      { to: '/accounts', label: 'Chart of Accounts' },
      { to: '/cost-centers', label: 'Cost Centers' },
      { to: '/payroll', label: 'Payroll / HR' },
      { to: '/manufacturing', label: 'Manufacturing' },
      { to: '/documents', label: 'Documents' },
      { to: '/settings/accounts', label: 'Integration Settings' },
      { to: '/settings/company', label: 'Company Settings' },
      { to: '/reports', label: 'Financial Reports' },
    ],
  },
];

export default function DashboardLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Hisaab ERP</h1>
          <p>{session?.company.name}</p>
        </div>
        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <strong>{session?.user.name}</strong>
            <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{session?.user.role}</span>
          </div>
          <button onClick={logout} style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 8, padding: '0.45rem 0.85rem' }}>
            Logout
          </button>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
