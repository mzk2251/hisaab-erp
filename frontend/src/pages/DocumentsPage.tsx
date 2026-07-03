import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'LICENSE',
    entityType: 'VEHICLE',
    entityId: '',
    description: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any[]>('/documents'),
      api<any[]>('/vehicles'),
      api<any[]>('/drivers')
    ])
      .then(([doc, veh, drv]) => {
        setDocuments(doc);
        setVehicles(veh);
        setDrivers(drv);
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
      await api('/documents', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess('Document registered in Document Management System.');
      setForm({ title: '', category: 'LICENSE', entityType: 'VEHICLE', entityId: '', description: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getEntityName = (doc: any) => {
    if (doc.entityType === 'VEHICLE') {
      const v = vehicles.find((x) => x.id === doc.entityId);
      return v ? `Vehicle: ${v.plateNumber} (${v.make})` : `Vehicle ID: ${doc.entityId}`;
    } else if (doc.entityType === 'DRIVER') {
      const d = drivers.find((x) => x.id === doc.entityId);
      return d ? `Driver: ${d.name}` : `Driver ID: ${doc.entityId}`;
    }
    return `ID: ${doc.entityId}`;
  };

  return (
    <>
      <div className="page-header">
        <h2>Document Management Center</h2>
        <p>Upload and manage permits, vehicle fitness certificates, driver licenses, route passage files, and corporate insurance policies</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Document Register Form */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Register Document</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Document Title</label>
              <input type="text" placeholder="e.g. Route Permit FY 26/27" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="LICENSE">Driver License</option>
                  <option value="REGISTRATION">Vehicle Registration</option>
                  <option value="INSURANCE">Insurance Policy</option>
                  <option value="PERMIT">Route Route Permit</option>
                  <option value="FITNESS">Fitness Certificate</option>
                  <option value="OTHER">Other Documents</option>
                </select>
              </div>
              <div className="form-group">
                <label>Entity Link Type</label>
                <select value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value, entityId: '' })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="VEHICLE">Fleet Vehicle</option>
                  <option value="DRIVER">Fleet Driver</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Select Associated {form.entityType === 'VEHICLE' ? 'Vehicle' : 'Driver'}</label>
              <select value={form.entityId} onChange={(e) => setForm({ ...form, entityId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Choose Profile --</option>
                {form.entityType === 'VEHICLE'
                  ? vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} ({v.make})</option>)
                  : drivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Description / Metadata</label>
              <input type="text" placeholder="e.g. Expires on June 30, 2027" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Link Document</button>
          </form>
        </div>

        {/* Document Center List */}
        <div className="panel">
          <div className="panel-header">Linked Corporate Documents</div>
          {loading ? (
            <div className="empty-state">Loading document vault...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">No documents uploaded to center.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title & Description</th>
                  <th>Assigned Entity</th>
                  <th>Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#1e293b', fontWeight: 600 }}>
                        {d.category}
                      </span>
                    </td>
                    <td>
                      <strong>{d.title}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{d.description || 'No description'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}><strong>{getEntityName(d)}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
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
