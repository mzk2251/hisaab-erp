import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AccountMappingsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Local state for configuration edits
  const [editingType, setEditingType] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');

  const transactionTypes = [
    { type: 'BOOKING_INVOICE', name: 'Shipment Booking Invoice', desc: 'Accrued revenue from customer bookings.' },
    { type: 'CUSTOMER_PAYMENT', name: 'Customer Invoice Receipt', desc: 'Customer cash clearing of accounts receivable.' },
    { type: 'VENDOR_PAYMENT', name: 'Supplier Bill Payment', desc: 'Clearing trade payables to external vendors.' },
    { type: 'FUEL_EXPENSE', name: 'Fleet Fuel Vouchers', desc: 'Operating diesel/petrol purchases for active trips.' },
    { type: 'VEHICLE_MAINTENANCE', name: 'Vehicle Service Tickets', desc: 'Mechanic and routine maintenance shop expenses.' },
    { type: 'PAYROLL', name: 'Driver Base Salaries', desc: 'Monthly payroll payout entries.' },
    { type: 'DRIVER_ADVANCE', name: 'Driver Cash Advances', desc: 'Temporary fuel/personal advances deduction pool.' },
  ];

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api<any[]>('/accounts'),
      api<any[]>('/settings/account-mappings')
    ])
      .then(([accts, maps]) => {
        setAccounts(accts);
        setMappings(maps);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/settings/account-mappings', {
        method: 'POST',
        body: JSON.stringify({
          transactionType: editingType,
          debitAccountId,
          creditAccountId,
        }),
      });
      setSuccess('Account mapping configuration updated successfully.');
      setEditingType('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getMappingForType = (type: string) => {
    return mappings.find((m) => m.transactionType === type);
  };

  return (
    <>
      <div className="page-header">
        <h2>Accounting Integration Settings</h2>
        <p>Configure dynamic debit and credit Chart of Accounts mappings for automated ledger vouchers</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Mapping Overview List */}
        <div className="panel">
          <div className="panel-header">Default Transaction Mapping Profiles</div>
          {loading ? (
            <div className="empty-state">Loading mappings...</div>
          ) : (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactionTypes.map((t) => {
                const map = getMappingForType(t.type);
                return (
                  <div
                    key={t.type}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setEditingType(t.type);
                      setDebitAccountId(map?.debitAccountId || '');
                      setCreditAccountId(map?.creditAccountId || '');
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{t.name}</strong>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{t.desc}</p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Debit: </span>
                          <strong>{map ? `${map.debitAccount.code} - ${map.debitAccount.name}` : <span style={{ color: 'var(--danger)' }}>Unmapped</span>}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Credit: </span>
                          <strong>{map ? `${map.creditAccount.code} - ${map.creditAccount.name}` : <span style={{ color: 'var(--danger)' }}>Unmapped</span>}</strong>
                        </div>
                      </div>
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Configure
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Configuration Detail / Form */}
        <div>
          {editingType ? (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)' }}>
              <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>
                Configure {transactionTypes.find((t) => t.type === editingType)?.name}
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Debit Account</label>
                  <select value={debitAccountId} onChange={(e) => setDebitAccountId(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                    <option value="">-- Select GL Account --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Credit Account</label>
                  <select value={creditAccountId} onChange={(e) => setCreditAccountId(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                    <option value="">-- Select GL Account --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Mapping</button>
                  <button type="button" onClick={() => setEditingType('')} style={{ flex: 1, padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="panel" style={{ padding: '1.25rem', background: '#f8fafc', color: 'var(--muted)', textAlign: 'center' }}>
              Select a transaction profile from the left to customize its debit & credit ledger accounts.
            </div>
          )}
        </div>

      </div>
    </>
  );
}
