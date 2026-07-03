import { useEffect, useState } from 'react';
import { api } from '../api/client';
import CrudModal, { FieldConfig } from '../components/CrudModal';

interface ModulePageProps {
  title: string;
  description: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  fields?: FieldConfig[];
}

export default function ModulePage({ title, description, endpoint, columns, fields }: ModulePageProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const fetchRows = () => {
    setLoading(true);
    api<any[]>(endpoint)
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRows();
    setSelectedRow(null);
    setIsModalOpen(false);
  }, [endpoint]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (selectedRow) {
        // Update
        await api(`${endpoint}/${selectedRow.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        // Create
        await api(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      fetchRows();
    } catch (err: any) {
      throw new Error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setError('');
    try {
      await api(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      fetchRows();
    } catch (err: any) {
      setError(err.message || 'Delete operation failed.');
    }
  };

  // Filter rows based on search query
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Client side CSV Export
  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = columns.map((col) => col.label).join(',');
    const csvRows = filteredRows.map((row) =>
      columns.map((col) => {
        const val = row[col.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const blob = new Blob([[headers, ...csvRows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    a.click();
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCSV} style={{ padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Export CSV
          </button>
          <button onClick={() => window.print()} style={{ padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Print Page
          </button>
          {fields && (
            <button
              onClick={() => {
                setSelectedRow(null);
                setIsModalOpen(true);
              }}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
            >
              + Add {title.slice(-1) === 's' ? title.slice(0, -1) : 'Record'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-text" style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

      <div className="panel">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <strong>{title} Directory</strong>
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '250px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem' }}
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading registry records...</div>
        ) : filteredRows.length === 0 ? (
          <div className="empty-state">No matching records found. Create entries to populate this view.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {fields && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={String(row.id)}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                    {fields && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => {
                              setSelectedRow(row);
                              setIsModalOpen(true);
                            }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#eff6ff', border: 'none', color: '#1d4ed8', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#fef2f2', border: 'none', color: '#b91c1c', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {fields && (
        <CrudModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
          title={selectedRow ? `Edit ${title.slice(-1) === 's' ? title.slice(0, -1) : 'Record'}` : `Add New ${title.slice(-1) === 's' ? title.slice(0, -1) : 'Record'}`}
          fields={fields}
          initialData={selectedRow}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </>
  );
}
