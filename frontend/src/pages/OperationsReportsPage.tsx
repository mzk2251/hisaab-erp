import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function OperationsReportsPage() {
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [utilization, setUtilization] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any>('/logistics-reports/profit-loss'),
      api<any>('/logistics-reports/fleet-utilization'),
      api<any[]>('/logistics-reports/driver-performance')
    ])
      .then(([pl, ut, drv]) => {
        setProfitLoss(pl);
        setUtilization(ut);
        setDrivers(drv);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading) return <div className="empty-state">Compiling corporate reports...</div>;
  if (error) return <div className="error-text" style={{ padding: '1rem' }}>{error}</div>;

  return (
    <>
      <div className="page-header">
        <h2>Logistics Operations Reports</h2>
        <p>Analyze fleet utilization, driver ratings, and overall operational profitability</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* P&L Statement Panel */}
        <div className="panel">
          <div className="panel-header">Profit & Loss Summary</div>
          <div style={{ padding: '1.25rem' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td><strong>Gross Logistics Revenue</strong></td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                    <strong>Rs.{Number(profitLoss?.revenue).toLocaleString()}</strong>
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan={2}><strong>Operating Expenses</strong></td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '1.5rem' }}>Fleet Fuel Costs</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    Rs.{Number(profitLoss?.expenses?.fuel).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '1.5rem' }}>Vehicle Maintenance & Servicing</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    Rs.{Number(profitLoss?.expenses?.maintenance).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '1.5rem' }}>Driver Payroll Expense</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    Rs.{Number(profitLoss?.expenses?.salaries).toLocaleString()}
                  </td>
                </tr>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td><strong>Total Operating Expenses</strong></td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    <strong>Rs.{Number(profitLoss?.expenses?.total).toLocaleString()}</strong>
                  </td>
                </tr>
                <tr style={{ borderTop: '2px double #1e293b', background: '#f0fdf4' }}>
                  <td><strong style={{ fontSize: '1.1rem' }}>Net Profit</strong></td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontSize: '1.1rem' }}>
                    <strong>Rs.{Number(profitLoss?.netProfit).toLocaleString()}</strong>
                  </td>
                </tr>
                <tr>
                  <td><strong>Operating Profit Margin</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>
                      {profitLoss?.revenue > 0 ? `${Math.round((profitLoss.netProfit / profitLoss.revenue) * 100)}%` : '0%'}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Utilization Panel */}
        <div className="panel">
          <div className="panel-header">Fleet Status & Utilization</div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Fleet Size</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>{utilization?.total}</div>
              </div>
              <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: 8, border: '1px solid #d1fae5' }}>
                <span style={{ fontSize: '0.8rem', color: '#047857', textTransform: 'uppercase' }}>Active</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#065f46', marginTop: '0.25rem' }}>{utilization?.active}</div>
              </div>
              <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: 8, border: '1px solid #fef3c7' }}>
                <span style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase' }}>In Shop</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#92400e', marginTop: '0.25rem' }}>{utilization?.maintenance}</div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Idle</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>{utilization?.idle}</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', background: '#f8fafc', marginTop: '0.5rem' }}>
              <strong>Utilization Summary:</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
                Currently, <strong>{utilization?.active} out of {utilization?.total}</strong> vehicles are dispatched on routes.
                Fleet utilization stands at <strong>{utilization?.total > 0 ? Math.round((utilization.active / utilization.total) * 100) : 0}%</strong>.
                {utilization?.maintenance > 0 && ` There are currently ${utilization.maintenance} vehicles in the maintenance yard.`}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Driver Performance Panel */}
      <div className="panel">
        <div className="panel-header">Driver Performance Ledger</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>License Number</th>
              <th>Trips Completed</th>
              <th>Outstanding Advances</th>
              <th>Basic Salary</th>
              <th>Driver Rating</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td><code>{d.license}</code></td>
                <td>{d.tripsCompleted} completed</td>
                <td style={{ color: d.advances > 0 ? 'var(--danger)' : 'inherit' }}>
                  <strong>Rs.{Number(d.advances).toLocaleString()}</strong>
                </td>
                <td>Rs.{Number(d.salary).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>★</span>
                    <strong>{d.rating.toFixed(1)} / 5.0</strong>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
