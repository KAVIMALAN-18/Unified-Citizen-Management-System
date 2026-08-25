import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FileCheck, CheckCircle, XCircle } from 'lucide-react';

export const OfficerCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchCertificates = async () => {
    try {
      const data = await officerService.getAllCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenReview = (cert) => {
    setSelectedCert(cert);
    setRemarks(cert.officerRemarks || '');
    setModalOpen(true);
  };

  const handleReview = async (status) => {
    if (!selectedCert) return;
    setReviewing(true);

    try {
      await officerService.reviewCertificate(selectedCert.id, { status, remarks });
      setModalOpen(false);
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review certificate request');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="card">Loading Certificate Requests...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Certificate Requests Review</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Inspect citizen certificate applications and issue official registration references.
        </p>
      </div>

      <div className="card">
        {certificates.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No certificate requests pending review.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Citizen Name & Email</th>
                  <th>Type</th>
                  <th>Submitted Notes</th>
                  <th>Reference Code</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.requestId}</strong></td>
                    <td>
                      <div><strong>{c.citizenName}</strong></div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>{c.citizenEmail}</div>
                    </td>
                    <td><span className="badge badge-info">{c.certificateType}</span></td>
                    <td>{c.submittedInfo || 'N/A'}</td>
                    <td>{c.certificateReference || 'Pending'}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReview(c)}>
                        Review & Decision
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Review Request ${selectedCert?.requestId}`}>
        <div style={{ marginBottom: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>Applicant:</strong> {selectedCert?.citizenName} ({selectedCert?.citizenEmail})</div>
          <div><strong>Certificate Type:</strong> {selectedCert?.certificateType}</div>
          <div><strong>Submitted Purpose:</strong> {selectedCert?.submittedInfo}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Officer Remarks</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Enter verification notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
          <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleReview('APPROVED')} disabled={reviewing}>
            <CheckCircle size={16} /> Approve & Issue Code
          </button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReview('REJECTED')} disabled={reviewing}>
            <XCircle size={16} /> Reject Request
          </button>
        </div>
      </Modal>
    </div>
  );
};
