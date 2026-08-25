import React, { useEffect, useState } from 'react';
import { certificateService } from '../../services/certificateService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FileCheck, Download, Plus, CheckCircle } from 'lucide-react';

export const Certificates = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [certificateType, setCertificateType] = useState('INCOME');
  const [submittedInfo, setSubmittedInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await certificateService.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await certificateService.createRequest({ certificateType, submittedInfo });
      setModalOpen(false);
      setSubmittedInfo('');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit certificate request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (id, refCode) => {
    try {
      const content = await certificateService.downloadCertificate(id);
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${refCode || 'certificate'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      alert(err.response?.data?.message || 'Certificate is not ready for download.');
    }
  };

  if (loading) return <div className="card">Loading Certificate Requests...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Official Certificates</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Request official village certificates (Income, Residence, Caste) and download approved documents.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Request Certificate
        </button>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No certificate requests submitted yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Certificate Type</th>
                  <th>Submitted Details</th>
                  <th>Reference Code</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.requestId}</strong></td>
                    <td><span className="badge badge-info">{req.certificateType}</span></td>
                    <td>{req.submittedInfo || 'N/A'}</td>
                    <td>{req.certificateReference || 'Pending Approval'}</td>
                    <td><StatusBadge status={req.status} /></td>
                    <td>
                      {req.status === 'APPROVED' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleDownload(req.id, req.certificateReference)}
                        >
                          <Download size={14} /> Download
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>In Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Official Certificate"
      >
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Certificate Type</label>
            <select className="form-control" value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
              <option value="INCOME">Income Certificate</option>
              <option value="RESIDENCE">Residence / Domicile Certificate</option>
              <option value="CASTE">Caste / Community Certificate</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Submitted Notes</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Required for welfare scheme application and college admission"
              value={submittedInfo}
              onChange={(e) => setSubmittedInfo(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
