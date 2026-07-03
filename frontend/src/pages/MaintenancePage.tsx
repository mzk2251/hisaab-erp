import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    date: '',
    type: 'Routine Service',
    cost: '',
    description: '',
    status: 'IN_PROGRESS',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any[]>('/maintenance'),
      api<any[]>('/vehicles')
    ])
      .then(([l, v]) => {
        setLogs(l);
        setVehicles(v);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          cost: Number(form.cost),
        }),
      });
      setSuccess('Vehicle maintenance logged and posted to General Ledger.');
      setForm({ vehicleId: '', date: '', type: 'Routine Service', cost: '', description: '', status: 'IN_PROGRESS' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleComplete = async (logId: string) => {
    setError('');
    setSuccess('');
    try {
      await api(`/maintenance/${logId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      setSuccess('Maintenance marked as completed. Vehicle returned to fleet.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Vehicle Maintenance Board</h2>
        <p>Log vehicle repairs, routine servicing, tyre rotations, and integrate maintenance costs with the General Ledger</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Log Maintenance */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Log Maintenance Ticket</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Vehicle</label>
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.make} - {v.model})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label>Service Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label>Cost (PKR)</label>
                <input type="number" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                <option value="Routine Service">Routine Mobil / Oil Change</option>
                <option value="Tyre Maintenance">Tyre Replacement / Alignment</option>
                <option value="Engine Repair">Engine Repair / Overhaul</option>
                <option value="Electrical Repair">Electrical Repair</option>
                <option value="Body work">Bodywork & Paint</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description of Work</label>
              <input type="text" placeholder="Detailed service description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Ticket Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                <option value="IN_PROGRESS">In Progress (Vehicle Busy)</option>
                <option value="COMPLETED">Completed (Release Vehicle)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Post Maintenance Log</button>
          </form>
        </div>

        {/* Maintenance Log Board */}
        <div className="panel">
          <div className="panel-header">Maintenance History & GL Integration</div>
          {loading ? (
            <div className="empty-state">Loading maintenance logs...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">No maintenance records logged.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Details</th>
                  <th>Cost (PKR)</th>
                  <th>Status</th>
                  <th>GL Ref</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.vehicle?.plateNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {l.vehicle?.make} ({l.vehicle?.type})
                      </div>
                    </td>
                    <td>
                      <strong>{l.type}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{l.description}</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Date: {new Date(l.date).toLocaleDateString()}</div>
                    </td>
                    <td><strong>Rs.{Number(l.cost).toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge ${l.status.toLowerCase()}`} style={{
                        background: l.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                        color: l.status === 'COMPLETED' ? '#166534' : '#92400e'
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.journalEntryId ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="badge posted" style={{ fontSize: '0.7rem' }}>POSTED</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      {l.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleComplete(l.id)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            color: '#fff',
                            background: 'var(--success)',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                        >
                          Complete
                        </button>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600 }}>CLOSED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}
