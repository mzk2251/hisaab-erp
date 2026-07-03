import React, { useEffect, useState } from 'react';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export default function CrudModal({ isOpen, onClose, title, fields, initialData, onSubmit }: CrudModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaults: any = {};
      fields.forEach((f) => {
        defaults[f.key] = f.type === 'number' ? '' : f.type === 'select' ? (f.options?.[0]?.value || '') : '';
      });
      setFormData(defaults);
    }
    setError('');
  }, [initialData, fields, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const dataToSubmit = { ...formData };
      // Cast numbers
      fields.forEach((f) => {
        if (f.type === 'number' && dataToSubmit[f.key] !== '') {
          dataToSubmit[f.key] = Number(dataToSubmit[f.key]);
        }
      });
      await onSubmit(dataToSubmit);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please verify input fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="panel" style={{ width: '480px', padding: '1.5rem', background: '#fff', borderRadius: 12, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted)' }}>&times;</button>
        </div>

        {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields.map((f) => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={formData[f.key] ?? ''}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.55rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  required={f.required}
                >
                  <option value="">-- Choose Option --</option>
                  {f.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={formData[f.key] ?? ''}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  required={f.required}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 2rem' }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
