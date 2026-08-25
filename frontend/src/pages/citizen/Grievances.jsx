import React, { useEffect, useState } from 'react';
import { grievanceService } from '../../services/grievanceService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { MessageSquare, Plus, CheckCircle } from 'lucide-react';

export const Grievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Infrastructure');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchGrievances = async () => {
    try {
      const data = await grievanceService.getMyGrievances();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await grievanceService.createGrievance({ category, subject, description });
      setModalOpen(false);
      setSubject('');
      setDescription('');
      fetchGrievances();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log grievance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading Grievances...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Civic Grievances</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Submit complaints regarding village infrastructure, sanitation, water, or welfare delivery.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Submit Grievance
        </button>
      </div>

      <div className="card">
        {grievances.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No grievances logged yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Grievance ID</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Officer Response</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id}>
                    <td><strong>{g.grievanceId}</strong></td>
                    <td><span className="badge badge-info">{g.category}</span></td>
                    <td>{g.subject}</td>
                    <td>{g.createdAt ? g.createdAt.substring(0, 10) : 'Today'}</td>
                    <td><StatusBadge status={g.status} /></td>
                    <td>{g.officerResponse || <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Pending Response</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Civic Grievance">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Infrastructure">Roads & Street Lights</option>
              <option value="Water Supply">Drinking Water & Sanitation</option>
              <option value="Scheme Disbursement">Welfare Allowance Delay</option>
              <option value="General Admin">Panchayat Administration</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe the issue, location, and details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Log Grievance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
