import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected booking for detailed side-panel
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Pod Submission Modal state
  const [podNotes, setPodNotes] = useState('');
  const [showPodModal, setShowPodModal] = useState(false);

  // Form states
  const [form, setForm] = useState({
    bookingNo: '',
    customerId: '',
    originAddress: '',
    destinationAddress: '',
    cargoDescription: '',
    cargoWeight: '',
    cargoVolume: '',
    estDeliveryDate: '',
    charges: '',
    status: 'QUOTATION', // Default is QUOTATION
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<any[]>('/bookings'),
      api<any[]>('/customers')
    ])
      .then(([b, c]) => {
        setBookings(b);
        setCustomers(c);
        // Refresh details of currently selected booking if any
        if (selectedBooking) {
          const fresh = b.find((x) => x.id === selectedBooking.id);
          setSelectedBooking(fresh || null);
        }
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
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          charges: Number(form.charges),
          cargoWeight: form.cargoWeight ? Number(form.cargoWeight) : null,
          cargoVolume: form.cargoVolume ? Number(form.cargoVolume) : null,
          estDeliveryDate: form.estDeliveryDate || null,
        }),
      });
      setSuccess('Shipment registered in system!');
      setForm({
        bookingNo: '',
        customerId: '',
        originAddress: '',
        destinationAddress: '',
        cargoDescription: '',
        cargoWeight: '',
        cargoVolume: '',
        estDeliveryDate: '',
        charges: '',
        status: 'QUOTATION',
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConvert = async (bookingId: string) => {
    setError('');
    setSuccess('');
    try {
      await api(`/bookings/${bookingId}/convert`, { method: 'POST' });
      setSuccess('Quotation successfully converted to Booking.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setError('');
    setSuccess('');
    try {
      await api(`/bookings/${selectedBooking.id}/pod`, {
        method: 'POST',
        body: JSON.stringify({ podNotes }),
      });
      setSuccess('Proof of Delivery (POD) logged. Shipment marked as delivered.');
      setPodNotes('');
      setShowPodModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInvoice = async (bookingId: string) => {
    setError('');
    setSuccess('');
    try {
      const updated = await api<any>(`/bookings/${bookingId}/invoice`, {
        method: 'POST',
      });
      setSuccess(`Voucher generated! Invoice reference: ${updated.invoice?.reference || ''}`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusStepperIndex = (status: string) => {
    const steps = ['QUOTATION', 'BOOKING', 'SHIPMENT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];
    return steps.indexOf(status);
  };

  const steps = ['Quotation', 'Booking', 'Shipment', 'Dispatched', 'Transit', 'Delivered'];

  return (
    <>
      <div className="page-header">
        <h2>Corporate Shipments & Bookings</h2>
        <p>Manage Quotation-to-POD workflows, track dispatch logs, and generate journal vouchers dynamically</p>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, fontWeight: 500, marginBottom: '1rem' }}>{success}</div>}

      {/* POD Submission Modal */}
      {showPodModal && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="panel" style={{ width: '450px', padding: '1.5rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Record Proof of Delivery</h3>
              <button onClick={() => setShowPodModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handlePodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Proof of Delivery / Receiver Notes</label>
                <textarea
                  placeholder="e.g. Received 50 boxes in perfect condition. Signed by Manager Zaid."
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Submit POD & Release Cargo</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Create Form */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-header" style={{ margin: '-1.25rem -1.25rem 1rem -1.25rem', borderBottom: '1px solid var(--border)' }}>Log Quotation or Booking</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Booking / Quote Ref</label>
              <input type="text" placeholder="e.g. QTE-789 (Auto-gen if empty)" value={form.bookingNo} onChange={(e) => setForm({ ...form, bookingNo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Customer</label>
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }} required>
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Origin Terminal</label>
              <input type="text" placeholder="e.g. Karachi Port Terminal 1" value={form.originAddress} onChange={(e) => setForm({ ...form, originAddress: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Destination Terminal</label>
              <input type="text" placeholder="e.g. ABC Warehouse Lahore" value={form.destinationAddress} onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Cargo Description</label>
              <input type="text" placeholder="e.g. 50 boxes electronics" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Weight (Tons)</label>
                <input type="number" step="0.1" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Volume (CBM)</label>
                <input type="number" step="0.1" value={form.cargoVolume} onChange={(e) => setForm({ ...form, cargoVolume: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label>Freight Rate (PKR)</label>
                <input type="number" placeholder="Charges" value={form.charges} onChange={(e) => setForm({ ...form, charges: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Initial Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option value="QUOTATION">Quotation (Draft)</option>
                  <option value="BOOKING">Confirmed Booking</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Shipment</button>
          </form>
        </div>

        {/* Right Side: Listings and Progress Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Detail Overlay / Audit Trail Stepper */}
          {selectedBooking && (
            <div className="panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Shipment Workflow Stepper: <strong>{selectedBooking.bookingNo}</strong></h3>
                <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {/* Progress Stepper UI */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '1.5rem 0' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: 0, right: 0, height: '4px',
                  background: '#e2e8f0', zIndex: 1, transform: 'translateY(-50%)'
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: 0,
                  width: `${(getStatusStepperIndex(selectedBooking.status) / 5) * 100}%`,
                  height: '4px', background: 'var(--primary)', zIndex: 2, transform: 'translateY(-50%)',
                  transition: 'width 0.3s ease'
                }} />

                {steps.map((step, idx) => {
                  const currentIdx = getStatusStepperIndex(selectedBooking.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: isDone ? 'var(--primary)' : '#fff',
                        border: `2px solid ${isDone ? 'var(--primary)' : '#cbd5e1'}`,
                        color: isDone ? '#fff' : '#475569',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '0.8rem', fontWeight: 700
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: isDone ? 600 : 400 }}>{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Triggers */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                {selectedBooking.status === 'QUOTATION' && (
                  <button onClick={() => handleConvert(selectedBooking.id)} className="btn-primary">
                    Convert to Booking
                  </button>
                )}
                {selectedBooking.status === 'IN_TRANSIT' && (
                  <button onClick={() => setShowPodModal(true)} className="btn-primary" style={{ background: '#d97706' }}>
                    Log Delivery (POD)
                  </button>
                )}
                {selectedBooking.status === 'DELIVERED' && !selectedBooking.invoiceId && (
                  <button onClick={() => handleInvoice(selectedBooking.id)} className="btn-primary" style={{ background: 'var(--success)' }}>
                    Generate Corporate Invoice
                  </button>
                )}
                {selectedBooking.invoiceId && (
                  <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✓ Posted to General Ledger (Invoice Ref: {selectedBooking.invoice?.reference})
                  </span>
                )}
                {selectedBooking.status === 'SHIPMENT' && (
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Currently waiting for Trip Dispatch Board scheduling.</span>
                )}
                {selectedBooking.status === 'DISPATCHED' && (
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Cargo loaded and vehicle dispatched. Waiting for arrival odometer log.</span>
                )}
              </div>

              {/* Audit trail details */}
              <div style={{ marginTop: '1rem' }}>
                <strong>Lifecycle Logs:</strong>
                <div style={{ maxHeight: '100px', overflowY: 'auto', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem', marginTop: '0.35rem' }}>
                  {selectedBooking.auditTrail ? (
                    JSON.parse(selectedBooking.auditTrail).map((t: any, i: number) => (
                      <div key={i} style={{ fontSize: '0.75rem', marginBottom: '0.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.2rem' }}>
                        <code>{new Date(t.timestamp).toLocaleTimeString()}</code> - Changed state to <strong>{t.status}</strong> by <strong>{t.user}</strong>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>No audit logs recorded.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking List */}
          <div className="panel">
            <div className="panel-header">Shipments & Quotation Registry</div>
            {loading ? (
              <div className="empty-state">Loading registry...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">No shipments registered yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment Ref</th>
                    <th>Customer</th>
                    <th>Addresses</th>
                    <th>Freight Charges</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      style={{ cursor: 'pointer', background: selectedBooking?.id === b.id ? '#f1f5f9' : 'none' }}
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td>
                        <strong>{b.bookingNo}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {new Date(b.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>{b.customer?.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div><strong>From:</strong> {b.originAddress}</div>
                        <div><strong>To:</strong> {b.destinationAddress}</div>
                      </td>
                      <td><strong>Rs.{Number(b.charges).toLocaleString()}</strong></td>
                      <td>
                        <span className="badge" style={{
                          background: b.status === 'QUOTATION' ? '#f1f5f9' : b.status === 'DELIVERED' ? '#dcfce7' : '#eff6ff',
                          color: b.status === 'QUOTATION' ? '#475569' : b.status === 'DELIVERED' ? '#166534' : '#1d4ed8'
                        }}>
                          {b.status}
                        </span>
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
