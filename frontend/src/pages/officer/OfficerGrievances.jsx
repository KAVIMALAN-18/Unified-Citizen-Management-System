import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { MessageSquare, CheckCircle } from 'lucide-react';

export const OfficerGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrv, setSelectedGrv] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  const fetchGrievances = async () => {
    try {
      const data = await officerService.getAllGrievances();
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleOpenRespond = (grv) => {
    setSelectedGrv(grv);
    setResponse(grv.officerResponse || '');
    setStatus(grv.status === 'SUBMITTED' ? 'RESOLVED' : grv.status);
    setModalOpen(true);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!selectedGrv) return;
    setSubmitting(true);

    try {
      await officerService.respondGrievance(selectedGrv.id, { status, response });
      setModalOpen(false);
      fetchGrievances();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to grievance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading Grievances...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Civic Grievances Lifecycle Management</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Inspect citizen complaints, assign status, and post administrative resolution responses.
        </p>
      </div>

      <div className="card">
        {grievances.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No grievances logged.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id}>
                    <td><strong>{g.grievanceId}</strong></td>
                    <td>{g.citizenName || g.citizenEmail}</td>
                    <td><span className="badge badge-info">{g.category}</span></td>
                    <td>{g.subject}</td>
                    <td><StatusBadge status={g.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenRespond(g)}>
                        Respond & Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Respond to Grievance ${selectedGrv?.grievanceId}`}>
        <div style={{ marginBottom: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>Subject:</strong> {selectedGrv?.subject}</div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>{selectedGrv?.description}</div>
        </div>

        <form onSubmit={handleRespond}>
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Officer Response Details</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Enter resolution notes, actions taken, or maintenance schedule..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Post Resolution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
