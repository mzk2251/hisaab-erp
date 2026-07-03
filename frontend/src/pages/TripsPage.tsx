import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [unassignedBookings, setUnassignedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [form, setForm] = useState({
    tripNo: '',
    vehicleId: '',
    driverId: '',
    routeId: '',
    startOdometer: '',
    notes: '',
    bookingIds: [] as string[],
  });

  // Modal / Inline states
  const [activeTripAction, setActiveTripAction] = useState<{ type: 'fuel' | 'expense' | 'complete'; tripId: string } | null>(null);
  const [fuelForm, setFuelForm] = useState({ date: '', liters: '', pricePerLiter: '', odometer: '', station: '' });
  const [expenseForm, setExpenseForm] = useState({ expenseDate: '', category: 'TOLL', amount: '', description: '' });
  const [completeForm, setCompleteForm] = useState({ endOdometer: '' });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any[]>('/trips'),
      api<any[]>('/vehicles'),
      api<any[]>('/drivers'),
      api<any[]>('/routes'),
      api<any[]>('/bookings')
    ])
      .then(([t, v, d, r, b]) => {
        setTrips(t);
        setVehicles(v.filter((x: any) => x.status === 'ACTIVE'));
        setDrivers(d.filter((x: any) => x.status === 'AVAILABLE'));
        setRoutes(r);
        setUnassignedBookings(b.filter((x: any) => !x.tripId && x.status === 'BOOKED'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/trips', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          startOdometer: Number(form.startOdometer),
        }),
      });
      setSuccess('Trip planned successfully!');
      setForm({ tripNo: '', vehicleId: '', driverId: '', routeId: '', startOdometer: '', notes: '', bookingIds: [] });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDispatch = async (tripId: string) => {
    setError('');
    setSuccess('');
    try {
      await api(`/trips/${tripId}/dispatch`, { method: 'POST' });
      setSuccess('Trip dispatched! Vehicle, driver and bookings updated.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTripAction) return;
    setError('');
    setSuccess('');
    try {
      const totalCost = Number(fuelForm.liters) * Number(fuelForm.pricePerLiter);
      await api(`/trips/${activeTripAction.tripId}/fuel`, {
        method: 'POST',
        body: JSON.stringify({
          ...fuelForm,
          totalCost,
        }),
      });
      setSuccess('Fuel log registered and posted to GL.');
      setFuelForm({ date: '', liters: '', pricePerLiter: '', odometer: '', station: '' });
      setActiveTripAction(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTripAction) return;
    setError('');
    setSuccess('');
    try {
      await api(`/trips/${activeTripAction.tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseForm),
      });
      setSuccess('Expense logged and posted to General Ledger.');
      setExpenseForm({ expenseDate: '', category: 'TOLL', amount: '', description: '' });
      setActiveTripAction(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCompleteTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTripAction) return;
    setError('');
    setSuccess('');
    try {
      await api(`/trips/${activeTripAction.tripId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completeForm),
      });
      setSuccess('Trip completed! Vehicle and driver released.');
      setCompleteForm({ endOdometer: '' });
      setActiveTripAction(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const calculateTripFinancials = (trip: any) => {
    const revenue = trip.bookings.reduce((sum: number, b: any) => sum + Number(b.charges), 0);
    const fuelCost = trip.fuelLogs.reduce((sum: number, f: any) => sum + Number(f.totalCost), 0);
    const expenseCost = trip.expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const net = revenue - (fuelCost + expenseCost);
    return { revenue, cost: fuelCost + expenseCost, net };
  };

  return (
    <>
      <div className="page-header">
        <h2>Trip Dispatch Board</h2>
        <p>Plan vehicle routes, assign drivers, log fuel logs/expenses, and view trip profitability</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      {/* Main Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Panel: Plan Trip */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Plan New Trip</div>
          <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Trip Number (Optional)</label>
              <input type="text" placeholder="Auto-generated if left empty" value={form.tripNo} onChange={(e) => setForm({ ...form, tripNo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Select Route</label>
              <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Select Route --</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({Number(r.distanceKm)} KM)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Active Vehicle</label>
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.make} - {v.type})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Available Driver</label>
              <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Select Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Starting Odometer Reading</label>
              <input type="number" placeholder="Odometer in km" value={form.startOdometer} onChange={(e) => setForm({ ...form, startOdometer: e.target.value })} required />
            </div>
            
            <div className="form-group">
              <label>Assign Bookings (Select Multiple)</label>
              {unassignedBookings.length === 0 ? (
                <div style={{ padding: '0.5rem', background: '#f8fafc', color: 'var(--muted)', fontSize: '0.85rem', borderRadius: 8 }}>
                  No unassigned bookings found. Create bookings first.
                </div>
              ) : (
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem', background: '#f8fafc' }}>
                  {unassignedBookings.map((b) => (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.35rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.bookingIds.includes(b.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm({
                            ...form,
                            bookingIds: checked ? [...form.bookingIds, b.id] : form.bookingIds.filter(id => id !== b.id)
                          });
                        }}
                      />
                      {b.bookingNo} (Rs.{Number(b.charges).toLocaleString()} - to {b.destinationAddress.split(' ')[0]})
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <input type="text" placeholder="Route exceptions, cargo notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Plan Trip</button>
          </form>
        </div>

        {/* Right Panel: Trips Listing & Operational Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Action Form Overlay (Simulated Modal) */}
          {activeTripAction && (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {activeTripAction.type === 'fuel' ? 'Log Fuel Purchase' : activeTripAction.type === 'expense' ? 'Add Trip Expense' : 'Complete Trip'}
                </h3>
                <button onClick={() => setActiveTripAction(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {activeTripAction.type === 'fuel' && (
                <form onSubmit={handleLogFuel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', alignItems: 'end' }}>
                  <div className="form-group">
                    <label>Fueling Date</label>
                    <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Liters</label>
                    <input type="number" step="0.01" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Price/Liter</label>
                    <input type="number" step="0.01" placeholder="PKR / L" value={fuelForm.pricePerLiter} onChange={(e) => setFuelForm({ ...fuelForm, pricePerLiter: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Odometer Reading</label>
                    <input type="number" placeholder="Odometer" value={fuelForm.odometer} onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Fuel Station</label>
                    <input type="text" placeholder="PSO, Shell, Attock..." value={fuelForm.station} onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary">Save Fuel Log</button>
                </form>
              )}

              {activeTripAction.type === 'expense' && (
                <form onSubmit={handleLogExpense} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.85rem', alignItems: 'end' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <option value="TOLL">Toll Tax</option>
                      <option value="FOOD">Driver Food Allowance</option>
                      <option value="REPAIR">Emergency Repair</option>
                      <option value="POLICE">Challan / Police</option>
                      <option value="OTHERS">Others</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount (PKR)</label>
                    <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="e.g. M2 Salt Range Toll" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                  </div>
                  <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 2rem' }}>Save Expense</button>
                  </div>
                </form>
              )}

              {activeTripAction.type === 'complete' && (
                <form onSubmit={handleCompleteTrip} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Ending Odometer Reading (km)</label>
                    <input type="number" placeholder="Odometer on arrival" value={completeForm.endOdometer} onChange={(e) => setCompleteForm({ ...completeForm, endOdometer: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 2rem' }}>Complete Trip & Release Driver</button>
                </form>
              )}
            </div>
          )}

          {/* List panel */}
          <div className="panel">
            <div className="panel-header">Trips Directory & Profitability Analysis</div>
            {loading ? (
              <div className="empty-state">Loading trips...</div>
            ) : trips.length === 0 ? (
              <div className="empty-state">No trips planned yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Trip Ref</th>
                      <th>Dispatch Details</th>
                      <th>Cargo Revenue</th>
                      <th>Operating Costs</th>
                      <th>Trip Profit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((t) => {
                      const { revenue, cost, net } = calculateTripFinancials(t);
                      return (
                        <tr key={t.id}>
                          <td>
                            <strong>{t.tripNo}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {new Date(t.date).toLocaleDateString()}
                            </div>
                            <span className={`badge ${t.status.toLowerCase()}`} style={{
                              marginTop: '0.25rem',
                              background: t.status === 'PLANNED' ? '#f1f5f9' : t.status === 'DISPATCHED' ? '#eff6ff' : '#dcfce7',
                              color: t.status === 'PLANNED' ? '#475569' : t.status === 'DISPATCHED' ? '#1d4ed8' : '#166534'
                            }}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            <div><strong>Route:</strong> {t.route?.name}</div>
                            <div><strong>Vehicle:</strong> {t.vehicle?.plateNumber} ({t.vehicle?.make})</div>
                            <div><strong>Driver:</strong> {t.driver?.name}</div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--success)' }}>Rs.{Number(revenue).toLocaleString()}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t.bookings.length} assigned jobs</div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--danger)' }}>Rs.{Number(cost).toLocaleString()}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {t.fuelLogs.length} fuel logs | {t.expenses.length} expenses
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: net >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                              Rs.{Number(net).toLocaleString()}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              Margin: {revenue > 0 ? `${Math.round((net / revenue) * 100)}%` : '0%'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {t.status === 'PLANNED' && (
                                <button onClick={() => handleDispatch(t.id)} className="btn-primary" style={{ padding: '0.35rem', fontSize: '0.75rem' }}>
                                  Dispatch Trip
                                </button>
                              )}
                              {t.status === 'DISPATCHED' && (
                                <>
                                  <button onClick={() => setActiveTripAction({ type: 'fuel', tripId: t.id })} style={{ padding: '0.35rem', fontSize: '0.75rem', background: '#d97706', border: 'none', color: '#fff', borderRadius: 6 }}>
                                    + Log Fuel
                                  </button>
                                  <button onClick={() => setActiveTripAction({ type: 'expense', tripId: t.id })} style={{ padding: '0.35rem', fontSize: '0.75rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 6 }}>
                                    + Add Expense
                                  </button>
                                  <button onClick={() => setActiveTripAction({ type: 'complete', tripId: t.id })} className="btn-primary" style={{ padding: '0.35rem', fontSize: '0.75rem', background: 'var(--success)' }}>
                                    Complete Trip
                                  </button>
                                </>
                              )}
                              {t.status === 'COMPLETED' && (
                                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>ARCHIVED</span>
                              )}
                            </div>
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

      </div>
    </>
  );
}
