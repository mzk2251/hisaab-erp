import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sub-forms states
  const [newBranch, setNewBranch] = useState({ code: '', name: '' });
  const [newDept, setNewDept] = useState({ code: '', name: '' });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any>('/auth/me'), // to fetch current company ID via user session
      api<any[]>('/cost-centers')
    ])
      .then(([me, cc]) => {
        setCompany(me.company);
        setBranches(cc.filter((x) => x.type === 'BRANCH'));
        setDepartments(cc.filter((x) => x.type === 'DEPARTMENT'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api(`/companies/${company.id}`, {
        method: 'PUT',
        body: JSON.stringify(company),
      });
      setSuccess('Company configuration updated successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/cost-centers', {
        method: 'POST',
        body: JSON.stringify({ ...newBranch, type: 'BRANCH' }),
      });
      setNewBranch({ code: '', name: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/cost-centers', {
        method: 'POST',
        body: JSON.stringify({ ...newDept, type: 'DEPARTMENT' }),
      });
      setNewDept({ code: '', name: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCostCenter = async (id: string) => {
    if (!window.confirm('Delete branch/department?')) return;
    setError('');
    try {
      await api(`/cost-centers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="empty-state">Loading company configuration...</div>;

  return (
    <>
      <div className="page-header">
        <h2>Company Organization Settings</h2>
        <p>Configure corporate profile settings, register branch terminals, departments, and specify local currency tax parameters</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Company Settings */}
        {company && (
          <div className="panel" style={{ padding: '1.25rem' }}>
            <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Company Profile</div>
            <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Company Code</label>
                  <input type="text" value={company.code} disabled />
                </div>
                <div className="form-group">
                  <label>Corporate Currency</label>
                  <input type="text" value={company.currency || 'PKR'} onChange={(e) => setCompany({ ...company, currency: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Tax NTN</label>
                  <input type="text" value={company.ntn || ''} onChange={(e) => setCompany({ ...company, ntn: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sales Tax GST (%)</label>
                  <input type="text" value={company.gst || ''} onChange={(e) => setCompany({ ...company, gst: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={company.email || ''} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={company.phone || ''} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Headquarters Address</label>
                <input type="text" value={company.address || ''} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Profile Configuration</button>
            </form>
          </div>
        )}

        {/* Branches Panel */}
        <div className="panel" style={{ padding: '1rem' }}>
          <div className="panel-header" style={{ margin: '-1rem -1rem 1rem -1rem', borderBottom: '1px solid var(--border)' }}>Branch Terminals</div>
          <form onSubmit={handleAddBranch} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Branch Code (e.g. LHR)" value={newBranch.code} onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })} required />
            <input type="text" placeholder="Branch Name" value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} required />
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem', fontSize: '0.85rem' }}>+ Add Branch</button>
          </form>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {branches.map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <div><strong>{b.code}</strong> - {b.name}</div>
                <button onClick={() => handleDeleteCostCenter(b.id)} style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Panel */}
        <div className="panel" style={{ padding: '1rem' }}>
          <div className="panel-header" style={{ margin: '-1rem -1rem 1rem -1rem', borderBottom: '1px solid var(--border)' }}>Departments</div>
          <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Dept Code (e.g. HR)" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value })} required />
            <input type="text" placeholder="Dept Name" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} required />
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem', fontSize: '0.85rem' }}>+ Add Dept</button>
          </form>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {departments.map((d) => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <div><strong>{d.code}</strong> - {d.name}</div>
                <button onClick={() => handleDeleteCostCenter(d.id)} style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
