import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Lightbulb, CheckCircle } from 'lucide-react';

export const OfficerSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSug, setSelectedSug] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('ACCEPTED');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const data = await officerService.getAllSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleOpenReview = (sug) => {
    setSelectedSug(sug);
    setRemarks(sug.officerRemarks || '');
    setStatus(sug.status === 'SUBMITTED' ? 'ACCEPTED' : sug.status);
    setModalOpen(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!selectedSug) return;
    setSubmitting(true);

    try {
      await officerService.reviewSuggestion(selectedSug.id, { status, remarks });
      setModalOpen(false);
      fetchSuggestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading Suggestions...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Village Suggestions Review</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Evaluate citizen proposals for village development and mark implementations.
        </p>
      </div>

      <div className="card">
        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No suggestions logged.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Citizen</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.suggestionId}</strong></td>
                    <td>{s.title}</td>
                    <td><span className="badge badge-info">{s.category}</span></td>
                    <td>{s.citizenName || s.citizenEmail}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReview(s)}>
                        Review & Set Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Review Suggestion ${selectedSug?.suggestionId}`}>
        <div style={{ marginBottom: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>Title:</strong> {selectedSug?.title}</div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>{selectedSug?.description}</div>
        </div>

        <form onSubmit={handleReview}>
          <div className="form-group">
            <label className="form-label">Suggestion Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="IMPLEMENTED">IMPLEMENTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Officer Remarks</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Enter remarks regarding proposal feasibility..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
