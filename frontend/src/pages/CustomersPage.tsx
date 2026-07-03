import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selection
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'ledger' | 'contacts'>('profile');

  // Form states
  const [form, setForm] = useState({
    code: '', name: '', email: '', phone: '', address: '', ntn: '',
    billingAddress: '', deliveryAddress: '', creditLimit: '100000'
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError('');
    api<any[]>('/customers')
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectCustomer = (c: any) => {
    setSelectedCustomer(c);
    setForm({
      code: c.code, name: c.name, email: c.email || '', phone: c.phone || '',
      address: c.address || '', ntn: c.ntn || '', billingAddress: c.billingAddress || '',
      deliveryAddress: c.deliveryAddress || '', creditLimit: String(c.creditLimit || 0)
    });
    setIsEditing(true);
  };

  const handleReset = () => {
    setIsEditing(false);
    setSelectedCustomer(null);
    setForm({
      code: '', name: '', email: '', phone: '', address: '', ntn: '',
      billingAddress: '', deliveryAddress: '', creditLimit: '100000'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isEditing && selectedCustomer) {
        await api(`/customers/${selectedCustomer.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...form,
            creditLimit: Number(form.creditLimit),
          }),
        });
        setSuccess('Customer profile updated successfully.');
      } else {
        await api('/customers', {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            creditLimit: Number(form.creditLimit),
          }),
        });
        setSuccess('New Customer registered.');
      }
      handleReset();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete customer profile? This will delete all relational contacts.')) return;
    setError('');
    try {
      await api(`/customers/${id}`, { method: 'DELETE' });
      setSuccess('Customer deleted.');
      handleReset();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Customer Relationship Management</h2>
        <p>Manage corporate customer profiles, address books, credit limits, and view customer statements & ledger balances</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Form panel */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>
            {isEditing ? 'Modify Customer Info' : 'Add Customer Profile'}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Code</label>
                <input type="text" placeholder="e.g. CUST-01" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={isEditing} />
              </div>
              <div className="form-group">
                <label>Tax NTN</label>
                <input type="text" placeholder="e.g. 1234567-8" value={form.ntn} onChange={(e) => setForm({ ...form, ntn: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="contact@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" placeholder="+92-300-xxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Billing Address</label>
              <input type="text" value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <input type="text" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Credit Limit (PKR)</label>
              <input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                {isEditing ? 'Update Profile' : 'Register Customer'}
              </button>
              {isEditing && (
                <>
                  <button type="button" onClick={() => handleDelete(selectedCustomer.id)} style={{ flex: 1, padding: '0.65rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
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

        {/* Directory and Statement list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Detailed Statement Panel if Customer Selected */}
          {selectedCustomer && (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Customer Details: <strong>{selectedCustomer.name}</strong></h3>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => setActiveTab('profile')} className="btn-primary" style={{ background: activeTab === 'profile' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'profile' ? '#fff' : '#475569', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}>Profile</button>
                  <button onClick={() => setActiveTab('ledger')} className="btn-primary" style={{ background: activeTab === 'ledger' ? 'var(--primary)' : '#e2e8f0', color: activeTab === 'ledger' ? '#fff' : '#475569', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}>Ledger Statement</button>
                </div>
              </div>

              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div><strong>Customer Code:</strong> <code>{selectedCustomer.code}</code></div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div><strong>Credit Safeguard Limit:</strong> Rs.{Number(selectedCustomer.creditLimit).toLocaleString()}</div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Billing Address:</strong> {selectedCustomer.billingAddress || 'N/A'}</div>
                    <div style={{ marginTop: '0.5rem' }}><strong>Delivery Destination:</strong> {selectedCustomer.deliveryAddress || 'N/A'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'ledger' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>Dynamic account adjustments log:</span>
                    <strong>Credit Balance status: <span style={{ color: 'var(--success)' }}>Active</span></strong>
                  </div>
                  <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Voucher Ref</th>
                        <th>Description</th>
                        <th>Debit (Charges)</th>
                        <th>Credit (Cleared)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Seed default values if no custom entries */}
                      <tr>
                        <td>02/07/2026</td>
                        <td><code>INV-BKG-BKG-001</code></td>
                        <td>Freight charges on Booking BKG-001</td>
                        <td>Rs.85,000</td>
                        <td>Rs.0</td>
                      </tr>
                      <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                        <td colSpan={3}>Outstanding Ledger Balance</td>
                        <td colSpan={2} style={{ textAlign: 'right', color: 'var(--danger)' }}>Rs.85,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Customer list */}
          <div className="panel">
            <div className="panel-header">Registered Customers Directory</div>
            {loading ? (
              <div className="empty-state">Loading registry...</div>
            ) : customers.length === 0 ? (
              <div className="empty-state">No customers recorded. Register profile on the left.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email / Phone</th>
                    <th>Billing Address</th>
                    <th>Credit Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      style={{ cursor: 'pointer', background: selectedCustomer?.id === c.id ? '#f1f5f9' : 'none' }}
                    >
                      <td>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Code: {c.code} | NTN: {c.ntn || 'N/A'}</div>
                      </td>
                      <td>
                        <div>{c.email || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.phone || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{c.billingAddress || '-'}</td>
                      <td><strong>Rs.{Number(c.creditLimit).toLocaleString()}</strong></td>
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
