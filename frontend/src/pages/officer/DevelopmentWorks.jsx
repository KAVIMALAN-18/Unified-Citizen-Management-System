import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Hammer, Plus, Edit3, CheckCircle } from 'lucide-react';

export const DevelopmentWorks = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads',
    location: 'Keeranur Main Street',
    estimatedCost: '1000000',
    allocatedAmount: '1000000',
    spentAmount: '500000',
    progressPercentage: 50,
    status: 'IN_PROGRESS',
    startDate: '2025-01-01',
    expectedCompletionDate: '2025-12-31',
  });

  const fetchWorks = async () => {
    try {
      const data = await officerService.getAllDevelopmentWorks();
      setWorks(data);
    } catch (err) {
      console.error('Failed to load development works:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      category: 'Roads',
      location: 'Keeranur Main Street',
      estimatedCost: '1000000',
      allocatedAmount: '1000000',
      spentAmount: '0',
      progressPercentage: 0,
      status: 'PLANNED',
      startDate: '2025-01-01',
      expectedCompletionDate: '2025-12-31',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setIsEditing(true);
    setSelectedWorkId(w.id);
    setFormData({
      title: w.title,
      description: w.description || '',
      category: w.category,
      location: w.location,
      estimatedCost: w.estimatedCost?.toString() || '0',
      allocatedAmount: w.allocatedAmount?.toString() || '0',
      spentAmount: w.spentAmount?.toString() || '0',
      progressPercentage: w.progressPercentage || 0,
      status: w.status,
      startDate: w.startDate || '2025-01-01',
      expectedCompletionDate: w.expectedCompletionDate || '2025-12-31',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        allocatedAmount: parseFloat(formData.allocatedAmount),
        spentAmount: parseFloat(formData.spentAmount),
        progressPercentage: parseInt(formData.progressPercentage),
      };

      if (isEditing) {
        await officerService.updateDevelopmentWork(selectedWorkId, payload);
      } else {
        await officerService.createDevelopmentWork(payload);
      }

      setModalOpen(false);
      fetchWorks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save development work');
    }
  };

  if (loading) return <div className="card">Loading Development Works...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Village Infrastructure Development Works</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Officer portal for creating, updating progress, and tracking expenditure of village development projects.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Add Development Work
        </button>
      </div>

      <div className="card">
        {works.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No development works recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Work ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Allocated Cost</th>
                  <th>Spent Amount</th>
                  <th>Progress (%)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {works.map((w) => (
                  <tr key={w.id}>
                    <td><strong>{w.workId}</strong></td>
                    <td>
                      <div><strong>{w.title}</strong></div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>{w.location}</div>
                    </td>
                    <td><span className="badge badge-info">{w.category}</span></td>
                    <td>₹{w.allocatedAmount ? Number(w.allocatedAmount).toLocaleString('en-IN') : '0'}</td>
                    <td>₹{w.spentAmount ? Number(w.spentAmount).toLocaleString('en-IN') : '0'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: 'var(--slate-200)', height: '6px', borderRadius: '3px' }}>
                          <div style={{ width: `${w.progressPercentage || 0}%`, background: 'var(--primary-600)', height: '100%', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{w.progressPercentage}%</span>
                      </div>
                    </td>
                    <td><StatusBadge status={w.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(w)}>
                        <Edit3 size={14} /> Update Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Update Development Work' : 'Add Development Work'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="Roads">Roads & Tarring</option>
                <option value="Water Supply">Drinking Water & Tanks</option>
                <option value="Sanitation">Sanitation & Drainage</option>
                <option value="Solar Energy">Solar Street Lights</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Allocated Budget (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.allocatedAmount}
                onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spent Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.spentAmount}
                onChange={(e) => setFormData({ ...formData, spentAmount: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Progress Percentage ({formData.progressPercentage}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                className="form-control"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="PLANNED">PLANNED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ON_HOLD">ON HOLD</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
