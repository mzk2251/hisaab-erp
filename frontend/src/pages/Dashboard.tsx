import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

interface DashboardSummary {
  customers: number;
  suppliers: number;
  items: number;
  openSalesOrders: number;
  openPurchaseOrders: number;
  pendingInvoices: number;

  bookings: number;
  activeVehicles: number;
  activeDrivers: number;
  completedTrips: number;
  logisticsRevenue: number;
  logisticsCost: number;
  logisticsProfit: number;

  outstandingAR: number;
  outstandingAP: number;
  bankBalance: number;
  recentBookings: Array<{
    id: string;
    bookingNo: string;
    status: string;
    charges: number;
    customer: { name: string };
    originAddress: string;
    destinationAddress: string;
  }>;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  QUOTATION:  { bg: '#f1f5f9', color: '#475569' },
  BOOKING:    { bg: '#eff6ff', color: '#1d4ed8' },
  SHIPMENT:   { bg: '#fef9c3', color: '#854d0e' },
  PICKUP:     { bg: '#fef3c7', color: '#92400e' },
  DISPATCHED: { bg: '#fef9c3', color: '#854d0e' },
  IN_TRANSIT: { bg: '#dbeafe', color: '#1e40af' },
  DELIVERED:  { bg: '#dcfce7', color: '#166534' },
  CANCELLED:  { bg: '#fee2e2', color: '#991b1b' },
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardSummary>('/dashboard/summary')
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="error-text" style={{ padding: '1.5rem' }}>{error}</div>;
  if (!summary) return <div className="empty-state">Loading dashboard analytics...</div>;

  const marginPct = summary.logisticsRevenue > 0
    ? Math.round((summary.logisticsProfit / summary.logisticsRevenue) * 100)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Logistics ERP Dashboard</h2>
          <p>Real-time analytics for cargo shipments, fleet operations, and corporate accounts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/bookings" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>
            + Book Shipment
          </Link>
          <Link to="/trips" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#d97706', display: 'inline-flex', alignItems: 'center' }}>
            + Plan Trip
          </Link>
        </div>
      </div>

      {/* Profitability Banner */}
      <div className="panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
          Operations Profitability Overview
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipment Revenue</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#10b981' }}>
              Rs.{summary.logisticsRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Accrued from booking charges</span>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fleet Operating Cost</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#ef4444' }}>
              Rs.{summary.logisticsCost.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fuel & trip expenses</span>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Profit</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#3b82f6' }}>
              Rs.{summary.logisticsProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: summary.logisticsProfit >= 0 ? '#10b981' : '#ef4444' }}>
              Margin: {marginPct}%
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#a78bfa' }}>
              Rs.{summary.bankBalance.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all accounts</span>
          </div>
        </div>
      </div>

      {/* AR / AP Financial Position */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accounts Receivable (AR)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                Rs.{summary.outstandingAR.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{summary.pendingInvoices} posted invoice(s) outstanding</div>
            </div>
            <Link to="/sales-invoices" style={{ padding: '0.5rem 0.85rem', background: '#dcfce7', color: '#166534', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              View Invoices →
            </Link>
          </div>
        </div>
        <div className="panel" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accounts Payable (AP)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>
                Rs.{summary.outstandingAP.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{summary.openPurchaseOrders} open purchase order(s)</div>
            </div>
            <Link to="/purchase-invoices" style={{ padding: '0.5rem 0.85rem', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              View Bills →
            </Link>
          </div>
        </div>
      </div>

      {/* Logistics KPIs */}
      <h3 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Fleet & Operations KPIs</h3>
      <div className="card-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="label">Cargo Bookings</div>
          <div className="value">{summary.bookings}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Total jobs registered</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Vehicles</div>
          <div className="value" style={{ color: '#10b981' }}>{summary.activeVehicles}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Ready for dispatch</div>
        </div>
        <div className="stat-card">
          <div className="label">Available Drivers</div>
          <div className="value" style={{ color: '#3b82f6' }}>{summary.activeDrivers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>On standby</div>
        </div>
        <div className="stat-card">
          <div className="label">Completed Trips</div>
          <div className="value" style={{ color: '#a78bfa' }}>{summary.completedTrips}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Successfully delivered</div>
        </div>
      </div>

      {/* Business KPIs */}
      <h3 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Business Registry</h3>
      <div className="card-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="label">Customers</div>
          <div className="value">{summary.customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Vendors</div>
          <div className="value">{summary.suppliers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Inventory Items</div>
          <div className="value">{summary.items}</div>
        </div>
        <div className="stat-card">
          <div className="label">Open Sales Orders</div>
          <div className="value">{summary.openSalesOrders}</div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      {summary.recentBookings && summary.recentBookings.length > 0 && (
        <div className="panel" style={{ marginBottom: '1.5rem' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Shipment Bookings</span>
            <Link to="/bookings" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Charges</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentBookings.map((b) => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS['QUOTATION'];
                return (
                  <tr key={b.id}>
                    <td><code style={{ fontSize: '0.8rem' }}>{b.bookingNo}</code></td>
                    <td><strong>{b.customer?.name || '-'}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>
                      {b.originAddress?.split(',')[0]} → {b.destinationAddress?.split(',')[0]}
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      Rs.{Number(b.charges).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Start Guide */}
      <div className="panel">
        <div className="panel-header">System Integration Guide</div>
        <div style={{ padding: '1.25rem' }}>
          <p style={{ marginTop: 0, color: 'var(--muted)' }}>
            All modules are interconnected. Data entered once propagates automatically:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {[
              { icon: '📦', title: 'Book Shipment', desc: 'Creates booking → generate invoice → posts AR in GL' },
              { icon: '🚛', title: 'Dispatch Trip', desc: 'Assigns vehicle + driver → updates fleet availability' },
              { icon: '⛽', title: 'Log Fuel', desc: 'Fuel logs → trip expense → debits GL automatically' },
              { icon: '🔧', title: 'Maintenance', desc: 'Repair records → vehicle health → GL expense voucher' },
            ].map((item) => (
              <div key={item.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
