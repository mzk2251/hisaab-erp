import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function BankingPage() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', accountType: 'BANK', bankName: '', iban: '',
    openingBalance: '0', currency: 'PKR'
  });

  // Transfer state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState({
    fromAccount: '', toAccount: '', amount: '', description: ''
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any[]>('/bank-accounts'),
      api<any[]>('/journal-entries'),
    ])
      .then(([banks, journals]) => {
        setBankAccounts(banks);
        setJournalEntries(journals);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedAccount(null);
    setIsEditing(false);
    setForm({ code: '', name: '', accountType: 'BANK', bankName: '', iban: '', openingBalance: '0', currency: 'PKR' });
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: any) => {
    setSelectedAccount(acc);
    setIsEditing(true);
    setForm({
      code: acc.code, name: acc.name, accountType: acc.accountType || 'BANK',
      bankName: acc.bankName || '', iban: acc.iban || '',
      openingBalance: String(acc.openingBalance || 0), currency: acc.currency || 'PKR'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isEditing && selectedAccount) {
        await api(`/bank-accounts/${selectedAccount.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, openingBalance: Number(form.openingBalance) }),
        });
        setSuccess('Bank account updated.');
      } else {
        await api('/bank-accounts', {
          method: 'POST',
          body: JSON.stringify({ ...form, openingBalance: Number(form.openingBalance) }),
        });
        setSuccess('Bank account registered.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this bank account?')) return;
    setError('');
    try {
      await api(`/bank-accounts/${id}`, { method: 'DELETE' });
      setSuccess('Account deleted.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/bank-accounts/transfer', {
        method: 'POST',
        body: JSON.stringify({ ...transfer, amount: Number(transfer.amount) }),
      });
      setSuccess(`Transfer of Rs.${Number(transfer.amount).toLocaleString()} completed successfully.`);
      setTransfer({ fromAccount: '', toAccount: '', amount: '', description: '' });
      setTransferOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalBank = bankAccounts
    .filter((a) => a.accountType === 'BANK')
    .reduce((sum, a) => sum + Number(a.openingBalance || 0), 0);
  const totalCash = bankAccounts
    .filter((a) => a.accountType === 'CASH')
    .reduce((sum, a) => sum + Number(a.openingBalance || 0), 0);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Banking & Treasury Management</h2>
          <p>Manage bank accounts, cash positions, inter-bank transfers, and daily reconciliations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setTransferOpen(true)} style={{ padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            ↔ Fund Transfer
          </button>
          <button onClick={handleOpenAdd} className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.5rem' }}>
            + Add Account
          </button>
        </div>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      {/* Treasury Position Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff' }}>
          <div className="label" style={{ color: '#94a3b8' }}>Total Bank Balance</div>
          <div className="value" style={{ color: '#10b981' }}>Rs.{totalBank.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
            {bankAccounts.filter((a) => a.accountType === 'BANK').length} bank account(s)
          </div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff' }}>
          <div className="label" style={{ color: '#94a3b8' }}>Cash in Hand</div>
          <div className="value" style={{ color: '#f59e0b' }}>Rs.{totalCash.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
            {bankAccounts.filter((a) => a.accountType === 'CASH').length} cash account(s)
          </div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff' }}>
          <div className="label" style={{ color: '#94a3b8' }}>Combined Treasury</div>
          <div className="value" style={{ color: '#3b82f6' }}>Rs.{(totalBank + totalCash).toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
            {bankAccounts.length} account(s) total
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header">Registered Bank & Cash Accounts</div>
        {loading ? (
          <div className="empty-state">Loading treasury accounts...</div>
        ) : bankAccounts.length === 0 ? (
          <div className="empty-state">No bank accounts registered. Add your first account above.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Bank / Institution</th>
                <th>IBAN</th>
                <th>Currency</th>
                <th>Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td><code>{acc.code}</code></td>
                  <td><strong>{acc.name}</strong></td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                      background: acc.accountType === 'BANK' ? '#eff6ff' : '#fef3c7',
                      color: acc.accountType === 'BANK' ? '#1d4ed8' : '#92400e'
                    }}>
                      {acc.accountType}
                    </span>
                  </td>
                  <td>{acc.bankName || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{acc.iban || '-'}</td>
                  <td>{acc.currency}</td>
                  <td><strong>Rs.{Number(acc.openingBalance || 0).toLocaleString()}</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button onClick={() => handleOpenEdit(acc)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#eff6ff', border: 'none', color: '#1d4ed8', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(acc.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fef2f2', border: 'none', color: '#b91c1c', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Transactions from GL */}
      <div className="panel">
        <div className="panel-header">Recent Journal Transactions</div>
        {journalEntries.length === 0 ? (
          <div className="empty-state">No journal entries posted yet.</div>
        ) : (
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.slice(0, 15).map((j) => (
                <tr key={j.id}>
                  <td><code>{j.reference}</code></td>
                  <td>{String(j.date).slice(0, 10)}</td>
                  <td>{j.description || '-'}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                      background: j.status === 'POSTED' ? '#ecfdf5' : '#fef9c3',
                      color: j.status === 'POSTED' ? '#065f46' : '#854d0e'
                    }}>
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '480px', padding: '1.5rem', background: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Account' : 'Register Bank Account'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Account Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={isEditing} />
                </div>
                <div className="form-group">
                  <label>Account Type</label>
                  <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <option value="BANK">Bank Account</option>
                    <option value="CASH">Cash Account</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Bank / Institution</label>
                  <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>IBAN / Account Number</label>
                <input type="text" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Opening Balance (PKR)</label>
                <input type="number" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>{isEditing ? 'Update Account' : 'Register Account'}</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '420px', padding: '1.5rem', background: '#fff', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Inter-Account Fund Transfer</h3>
              <button onClick={() => setTransferOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label>From Account</label>
                <select value={transfer.fromAccount} onChange={(e) => setTransfer({ ...transfer, fromAccount: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                  <option value="">-- Select Source Account --</option>
                  {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>To Account</label>
                <select value={transfer.toAccount} onChange={(e) => setTransfer({ ...transfer, toAccount: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                  <option value="">-- Select Destination Account --</option>
                  {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Transfer Amount (PKR)</label>
                <input type="number" value={transfer.amount} onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Transfer Description</label>
                <input type="text" placeholder="e.g. Fund transfer from main account to petty cash" value={transfer.description} onChange={(e) => setTransfer({ ...transfer, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Execute Transfer</button>
                <button type="button" onClick={() => setTransferOpen(false)} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
