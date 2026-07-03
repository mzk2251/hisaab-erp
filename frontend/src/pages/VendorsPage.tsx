import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selection
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'ledger'>('profile');

  // Form states
  const [form, setForm] = useState({
    code: '', name: '', email: '', phone: '', address: '', ntn: '',
    paymentTerms: '30', vendorType: 'GENERAL'
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError('');
    api<any[]>('/suppliers')
      .then(setVendors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectVendor = (v: any) => {
    setSelectedVendor(v);
    setForm({
      code: v.code, name: v.name, email: v.email || '', phone: v.phone || '',
      address: v.address || '', ntn: v.ntn || '', paymentTerms: String(v.paymentTerms || 30),
      vendorType: v.vendorType || 'GENERAL'
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setIsEditing(false);
    setSelectedVendor(null);
    setForm({
      code: '', name: '', email: '', phone: '', address: '', ntn: '',
      paymentTerms: '30', vendorType: 'GENERAL'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isEditing && selectedVendor) {
        await api(`/suppliers/${selectedVendor.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...form,
            paymentTerms: Number(form.paymentTerms),
          }),
        });
        setSuccess('Vendor profile updated successfully.');
      } else {
        await api('/suppliers', {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            paymentTerms: Number(form.paymentTerms),
          }),
        });
        setSuccess('New Vendor registered.');
      }
      handleReset();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete vendor profile?')) return;
    setError('');
    try {
      await api(`/suppliers/${id}`, { method: 'DELETE' });
      setSuccess('Vendor deleted.');
      handleReset();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Vendor Management Portal</h2>
        <p>Manage transport, fuel, maintenance/repair partners, configure payment terms, and audit vendor statement vouchers</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Form Panel */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>
            {isEditing ? 'Modify Vendor Profile' : 'Register Vendor Partner'}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Vendor Code</label>
                <input type="text" placeholder="e.g. VEND-01" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={isEditing} />
              </div>
              <div className="form-group">
                <label>Vendor Type</label>
                <select value={form.vendorType} onChange={(e) => setForm({ ...form, vendorType: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="GENERAL">General Supplier</option>
                  <option value="TRANSPORT">Market Transporter</option>
                  <option value="FUEL">Fuel Vendor</option>
                  <option value="REPAIR">Repair Workshop</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Vendor / Company Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="billing@vendor.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Payment Terms (Days)</label>
                <input type="number" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>NTN Tax Code</label>
                <input type="text" placeholder="e.g. 5555555-1" value={form.ntn} onChange={(e) => setForm({ ...form, ntn: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                {isEditing ? 'Update Vendor' : 'Register Vendor'}
              </button>
              {isEditing && (
                <>
                  <button type="button" onClick={() => handleDelete(selectedVendor.id)} style={{ flex: 1, padding: '0.65rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                  <button type="button" onClick={handleReset} style={{ flex: 1, padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer' }}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Directory and Statement lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Detailed Statement Panel if Vendor Selected */}
          {selectedVendor && (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Vendor Partner: <strong>{selectedVendor.name}</strong></h3>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => setActiveTab('profile')} className="btn-primary" style={{ background: activeTab === 'profile' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'profile' ? '#fff' : '#475569', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}>Profile</button>
                  <button onClick={() => setActiveTab('ledger')} className="btn-primary" style={{ background: activeTab === 'ledger' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'ledger' ? '#fff' : '#475569', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}>Ledger Statement</button>
                </div>
              </div>

              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div><strong>Code / ID:</strong> <code>{selectedVendor.code}</code></div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Partner Type:</strong> <span className="badge" style={{ background: '#f1f5f9' }}>{selectedVendor.vendorType}</span></div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Email:</strong> {selectedVendor.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div><strong>Payment Terms:</strong> Net {selectedVendor.paymentTerms} Days</div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Corporate NTN:</strong> {selectedVendor.ntn || 'N/A'}</div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Address:</strong> {selectedVendor.address || 'N/A'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'ledger' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Dynamic liabilities statement log:</span>
                    <strong>Trade Status: <span style={{ color: 'var(--success)' }}>Active</span></strong>
                  </div>
                  <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Voucher Ref</th>
                        <th>Description</th>
                        <th>Credit (Purchases)</th>
                        <th>Debit (Cleared)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Seed default values if no custom entries */}
                      <tr>
                        <td>03/07/2026</td>
                        <td><code>OP-BAL-001</code></td>
                        <td>Opening vendor balance</td>
                        <td>Rs.{Number(selectedVendor.balance || 0).toLocaleString()}</td>
                        <td>Rs.0</td>
                      </tr>
                      <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                        <td colSpan={3}>Outstanding AP Balance</td>
                        <td colSpan={2} style={{ textAlign: 'right', color: 'var(--danger)' }}>
                          Rs.{Number(selectedVendor.balance || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Vendors list */}
          <div className="panel">
            <div className="panel-header">Registered Vendor Partners Directory</div>
            {loading ? (
              <div className="empty-state">Loading registry...</div>
            ) : vendors.length === 0 ? (
              <div className="empty-state">No vendor profiles recorded. Register on the left.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Type</th>
                    <th>Email / Phone</th>
                    <th>Payment Terms</th>
                    <th>Outstanding AP</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => handleSelectVendor(v)}
                      style={{ cursor: 'pointer', background: selectedVendor?.id === v.id ? '#f1f5f9' : 'none' }}
                    >
                      <td>
                        <strong>{v.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Code: {v.code} | NTN: {v.ntn || 'N/A'}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>
                          {v.vendorType}
                        </span>
                      </td>
                      <td>
                        <div>{v.email || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{v.phone || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>Net {v.paymentTerms} Days</td>
                      <td>
                        <strong style={{ color: v.balance > 0 ? 'var(--danger)' : 'inherit' }}>
                          Rs.{Number(v.balance || 0).toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
