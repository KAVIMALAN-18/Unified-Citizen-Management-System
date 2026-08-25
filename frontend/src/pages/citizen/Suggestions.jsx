import React, { useEffect, useState } from 'react';
import { suggestionService } from '../../services/suggestionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Lightbulb, Plus, CheckCircle } from 'lucide-react';

export const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Education');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    try {
      const data = await suggestionService.getMySuggestions();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await suggestionService.createSuggestion({ title, category, description });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading Suggestions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Village Suggestions</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Propose community projects, education facilities, or village improvements for panchayat review.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Propose Suggestion
        </button>
      </div>

      <div className="card">
        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No suggestions submitted yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Officer Remarks</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.suggestionId}</strong></td>
                    <td>{s.title}</td>
                    <td><span className="badge badge-info">{s.category}</span></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{s.officerRemarks || <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>In Review</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Village Improvement Suggestion">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Education">Education & Library</option>
              <option value="Health">Health Center & Sanitation</option>
              <option value="Agriculture">Farmer Market & Irrigation</option>
              <option value="Environment">Solar Energy & Greenery</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Suggestion Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Community Reading Room Setup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Implementation Idea</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Explain how this project will benefit the village..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
