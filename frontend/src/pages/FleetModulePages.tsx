import { useEffect, useState } from 'react';
import { api } from '../api/client';

// Helper to determine compliance expiry status
function getExpiryAlert(expiryDateString: string | null) {
  if (!expiryDateString) return { text: 'Not Configured', style: { color: 'var(--muted)' } };
  
  const expiry = new Date(expiryDateString);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `EXPIRED (${Math.abs(diffDays)}d ago)`, style: { background: '#fee2e2', color: '#991b1b', fontWeight: 600 } };
  } else if (diffDays <= 30) {
    return { text: `EXPIRES IN ${diffDays}d`, style: { background: '#fef3c7', color: '#92400e', fontWeight: 600 } };
  }
  return { text: `Valid until ${expiry.toLocaleDateString()}`, style: { color: 'var(--success)' } };
}

// ─── Vehicles Page ───────────────────────────────────────────────────────────
export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Truck',
    category: 'Heavy Duty',
    ownershipType: 'OWNED',
    insuranceExpiry: '',
    fitnessExpiry: '',
    permitExpiry: '',
    taxExpiry: '',
    tyreCount: '10',
    batteryDetails: '',
    gpsDeviceId: '',
    status: 'ACTIVE',
  });

  const fetchVehicles = () => {
    setLoading(true);
    api<any[]>('/vehicles')
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          tyreCount: Number(form.tyreCount),
          insuranceExpiry: form.insuranceExpiry || null,
          fitnessExpiry: form.fitnessExpiry || null,
          permitExpiry: form.permitExpiry || null,
          taxExpiry: form.taxExpiry || null,
        }),
      });
      setForm({
        plateNumber: '', make: '', model: '', year: new Date().getFullYear(), type: 'Truck',
        category: 'Heavy Duty', ownershipType: 'OWNED', insuranceExpiry: '', fitnessExpiry: '',
        permitExpiry: '', taxExpiry: '', tyreCount: '10', batteryDetails: '', gpsDeviceId: '', status: 'ACTIVE'
      });
      fetchVehicles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Corporate Fleet Registry</h2>
        <p>Manage commercial trucks, registrations, ownership types, and track compliance document expiry alerts</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Form Panel */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Register Vehicle</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Plate Number</label>
              <input type="text" placeholder="e.g. LHR-7890" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Make</label>
                <input type="text" placeholder="Hino" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" placeholder="500 Series" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Ownership</label>
                <select value={form.ownershipType} onChange={(e) => setForm({ ...form, ownershipType: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="OWNED">Owned Asset</option>
                  <option value="LEASED">Leased Asset</option>
                  <option value="RENTED">Market Rented</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" placeholder="Heavy Duty" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>GPS Device ID</label>
                <input type="text" placeholder="GPS-123" value={form.gpsDeviceId} onChange={(e) => setForm({ ...form, gpsDeviceId: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tyre Count</label>
                <input type="number" value={form.tyreCount} onChange={(e) => setForm({ ...form, tyreCount: e.target.value })} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '0.85rem' }}>Compliance & Permit Expiries:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Insurance Expiry</label>
                  <input type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Fitness Expiry</label>
                  <input type="date" value={form.fitnessExpiry} onChange={(e) => setForm({ ...form, fitnessExpiry: e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Permit Expiry</label>
                  <input type="date" value={form.permitExpiry} onChange={(e) => setForm({ ...form, permitExpiry: e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Tax Expiry</label>
                  <input type="date" value={form.taxExpiry} onChange={(e) => setForm({ ...form, taxExpiry: e.target.value })} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Vehicle</button>
          </form>
        </div>

        {/* List Panel with alerts */}
        <div className="panel">
          <div className="panel-header">Fleet List & Compliance Board</div>
          {loading ? (
            <div className="empty-state">Loading fleet...</div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">No vehicles registered.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>GPS / Tyres</th>
                    <th>Permit / Tax Expiries</th>
                    <th>Fitness / Insurance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => {
                    const permitAlert = getExpiryAlert(v.permitExpiry);
                    const taxAlert = getExpiryAlert(v.taxExpiry);
                    const fitnessAlert = getExpiryAlert(v.fitnessExpiry);
                    const insAlert = getExpiryAlert(v.insuranceExpiry);

                    return (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.plateNumber}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {v.make} - {v.model} ({v.year})
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: 4 }}>
                            {v.ownershipType}
                          </span>
                        </td>
                        <td>
                          <div>ID: <code>{v.gpsDeviceId || 'N/A'}</code></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{v.tyreCount} Tyres</div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div>Permit: <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, ...permitAlert.style }}>{permitAlert.text}</span></div>
                          <div style={{ marginTop: '0.25rem' }}>Tax: <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, ...taxAlert.style }}>{taxAlert.text}</span></div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div>Fitness: <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, ...fitnessAlert.style }}>{fitnessAlert.text}</span></div>
                          <div style={{ marginTop: '0.25rem' }}>Insurance: <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, ...insAlert.style }}>{insAlert.text}</span></div>
                        </td>
                        <td>
                          <span className={`badge ${v.status.toLowerCase()}`}>{v.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Drivers Page ────────────────────────────────────────────────────────────
export function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Slider actions state
  const [activeDriverAction, setActiveDriverAction] = useState<{ type: 'advance' | 'payroll'; driverId: string } | null>(null);
  const [amount, setAmount] = useState('');

  const [form, setForm] = useState({
    name: '', licenseNumber: '', phone: '', status: 'AVAILABLE', employeeId: '',
    cnic: '', licenseExpiry: '', medicalDetails: '', emergencyContact: '', salary: ''
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api<any[]>('/drivers'),
      api<any[]>('/employees')
    ])
      .then(([drv, emp]) => {
        setDrivers(drv);
        setEmployees(emp);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/drivers', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
          employeeId: form.employeeId || null,
          licenseExpiry: form.licenseExpiry || null,
        }),
      });
      setForm({
        name: '', licenseNumber: '', phone: '', status: 'AVAILABLE', employeeId: '',
        cnic: '', licenseExpiry: '', medicalDetails: '', emergencyContact: '', salary: ''
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriverAction) return;
    setError('');
    setSuccess('');
    try {
      await api(`/drivers-operations/${activeDriverAction.driverId}/advances`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) }),
      });
      setSuccess('Advance recorded and posted to GL Ledger.');
      setAmount('');
      setActiveDriverAction(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePaySalary = async (driverId: string) => {
    setError('');
    setSuccess('');
    try {
      const resp = await api<any>(`/drivers-operations/${driverId}/pay-salary`, {
        method: 'POST',
      });
      setSuccess(`Salary paid! Net payable transfer: Rs.${resp.netPayable.toLocaleString()} (deductions resolved).`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Driver Management Board</h2>
        <p>Link driver profiles to HR profiles, issue advances, manage payroll expensing, and monitor licensing validity</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Create Form */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Register Driver</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>CNIC (National ID)</label>
                <input type="text" placeholder="e.g. 42101-xxx" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>License Number</label>
                <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>License Expiry</label>
                <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Base Salary (PKR)</label>
                <input type="number" placeholder="45000" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>HR Profile link</label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="">-- Contractor / Outsource --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Medical Comments</label>
              <input type="text" placeholder="Normal Vision / Blood Group" value={form.medicalDetails} onChange={(e) => setForm({ ...form, medicalDetails: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input type="text" placeholder="Brother Name - +92-xxx" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Driver</button>
          </form>
        </div>

        {/* Listings and Operational actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Sliders (Drawer modal) */}
          {activeDriverAction && (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Issue Cash Advance</h3>
                <button onClick={() => setActiveDriverAction(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <form onSubmit={handleAdvance} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Advance Amount (PKR)</label>
                  <input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 2rem' }}>Confirm Advance</button>
              </form>
            </div>
          )}

          <div className="panel">
            <div className="panel-header">Drivers Directory & Payroll Controls</div>
            {loading ? (
              <div className="empty-state">Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div className="empty-state">No drivers registered.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Driver Profile</th>
                    <th>License / CNIC</th>
                    <th>Outstanding Advances</th>
                    <th>Salary Scale</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => {
                    const licenseAlert = getExpiryAlert(d.licenseExpiry);
                    return (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{d.phone || 'No phone'}</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            Rating: <strong>{Number(d.rating).toFixed(1)} ★</strong>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>Lic: <code>{d.licenseNumber}</code></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            Expiry: <span style={{ padding: '0.05rem 0.25rem', borderRadius: 4, ...licenseAlert.style }}>{licenseAlert.text}</span>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: d.advances > 0 ? 'var(--danger)' : 'inherit' }}>
                            Rs.{Number(d.advances).toLocaleString()}
                          </strong>
                        </td>
                        <td>Rs.{Number(d.salary).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <button
                              onClick={() => setActiveDriverAction({ type: 'advance', driverId: d.id })}
                              style={{ padding: '0.35rem', fontSize: '0.75rem', background: '#d97706', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 600 }}
                            >
                              Log Advance
                            </button>
                            <button
                              onClick={() => handlePaySalary(d.id)}
                              style={{ padding: '0.35rem', fontSize: '0.75rem', background: 'var(--success)', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 600 }}
                            >
                              Pay Salary
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Routes Page ─────────────────────────────────────────────────────────────
export function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', origin: '', destination: '', distanceKm: '', estDurationHrs: '' });

  const fetchRoutes = () => {
    setLoading(true);
    api<any[]>('/routes')
      .then(setRoutes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/routes', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          distanceKm: Number(form.distanceKm),
          estDurationHrs: Number(form.estDurationHrs)
        }),
      });
      setForm({ name: '', origin: '', destination: '', distanceKm: '', estDurationHrs: '' });
      fetchRoutes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Route Network</h2>
        <p>Define origins, destinations, distances, and travel times for automated booking calculations</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Add New Route</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Route Identifier Name</label>
              <input type="text" placeholder="e.g. Karachi to Lahore" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Origin City</label>
              <input type="text" placeholder="e.g. Karachi" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Destination City</label>
              <input type="text" placeholder="e.g. Lahore" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label>Distance (km)</label>
                <input type="number" step="0.1" placeholder="1210" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} required />
              </div>
              <div>
                <label>Est. Duration (hrs)</label>
                <input type="number" step="0.1" placeholder="16.5" value={form.estDurationHrs} onChange={(e) => setForm({ ...form, estDurationHrs: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Route</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">Standard Corporate Routes</div>
          {loading ? (
            <div className="empty-state">Loading routes...</div>
          ) : routes.length === 0 ? (
            <div className="empty-state">No standard routes defined.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Distance (KM)</th>
                  <th>Est. Time (Hours)</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.origin}</td>
                    <td>{r.destination}</td>
                    <td>{Number(r.distanceKm).toLocaleString()} km</td>
                    <td>{Number(r.estDurationHrs)} hrs</td>
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
