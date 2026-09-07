
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { StatusBadge, AiRiskBadge } from '../../components/common/StatusBadge';
import { ShapVisualizer } from '../../components/common/ShapVisualizer';
import { Modal } from '../../components/common/Modal';
import { ArrowLeft, Cpu, CheckCircle, XCircle, AlertTriangle, Paperclip, MessageSquare } from 'lucide-react';

export const OfficerApplicationDetails = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDetails = async () => {
    try {
      const data = await officerService.getAllApplications();
      const target = data.find((a) => a.id.toString() === id);
      setApp(target);
      if (target?.officerRemarks) {
        setRemarks(target.officerRemarks);
      }

      // If application already evaluated, automatically load saved AI analysis
      if (target && (target.aiAnalysisStatus === 'PENDING_OFFICER_REVIEW' || target.aiAnalysisStatus === 'COMPLETED')) {
        try {
          const aiData = await officerService.getAiAnalysis(id);
          setAiResult(aiData);
        } catch (aiErr) {
          console.warn('AI analysis record not found in database yet:', aiErr);
        }
      }
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleTriggerAi = async () => {
    setAnalyzing(true);
    setIsModalOpen(true); // Open the modal immediately to show the loading screen
    setError('');
    setSuccessMsg('');

    try {
      const res = await officerService.triggerAiAnalysis(id);
      setAiResult(res);
      setSuccessMsg('AI Evaluation & Dynamic SHAP analysis completed successfully!');
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to FastAPI AI Service.');
      setIsModalOpen(false); // Close the modal if it fails
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDecision = async (status) => {
    setReviewing(true);
    setError('');
    setSuccessMsg('');

    try {
      await officerService.reviewApplication(id, { status, remarks });
      setSuccessMsg(`Application status updated to ${status}!`);
      setIsModalOpen(false); // Close modal after decision is submitted
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit officer decision.');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="card">Loading Application Details...</div>;
  if (!app) return <div className="card">Application not found.</div>;

  const fraudAnalysis = aiResult?.fraud_analysis;
  const explanation = aiResult?.explanation;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/officer/applications" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Back to Applications List
      </Link>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-info">{app.applicationId}</span>
            <h2 className="card-title" style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>
              {app.schemeName || app.schemeId}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Applicant: <strong>{app.citizenName}</strong> ({app.citizenEmail})
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {successMsg && <div className="alert alert-success"><CheckCircle size={18} /> {successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Applicant Demographic & Declared Metrics */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Submitted Financial & Land Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
          <div><strong>Declared Annual Income:</strong> ₹{app.declaredIncome ? Number(app.declaredIncome).toLocaleString('en-IN') : '0'}</div>
          <div><strong>Declared Land Holding:</strong> {app.declaredLandArea} Acres</div>
          <div><strong>Application Date:</strong> {app.applicationDate}</div>
          <div><strong>Attached Documents:</strong> {app.documents?.length || app.documentCount || 0}</div>
        </div>
      </div>

      {/* Trigger AI Evaluation Section */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--slate-900), var(--primary-800))', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu className="text-accent-600" /> Random Forest ML & Explainable AI Verification
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
              Invokes FastAPI microservice to calculate Random Forest fraud probability and dynamic local SHAP attributions.
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleTriggerAi} disabled={analyzing}>
            <Cpu size={18} />
            <span>{app.aiAnalysisStatus === 'PENDING_OFFICER_REVIEW' || app.aiAnalysisStatus === 'COMPLETED' ? 'Re-run AI Audit' : 'Trigger AI Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Display AI Analysis Results Panel on main page if already evaluated */}
      {fraudAnalysis && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>AI Fraud & Eligibility Evaluation Results</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(true)}>
              <Cpu size={14} /> Open AI Audit Modal
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Fraud Probability</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {(fraudAnalysis.fraud_probability * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Evaluated Risk Level</div>
              <div style={{ marginTop: '0.25rem' }}>
                <AiRiskBadge riskLevel={fraudAnalysis.risk_level} requirement={fraudAnalysis.verification_requirement} />
              </div>
            </div>

            <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Required Verification Protocol</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', marginTop: '0.25rem' }}>
                {fraudAnalysis.verification_requirement}
              </div>
            </div>
          </div>

          {/* Dynamic SHAP Explanation Component */}
          {explanation && <ShapVisualizer explanation={explanation} />}
        </div>
      )}

      {/* Human Officer Final Decision Section on main page */}
      <div className="card" style={{ border: '2px solid var(--primary-600)' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare className="text-primary-600" /> Administrative Officer Final Decision
        </h3>

        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Advisory Protocol Enforcement:</strong>
            <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              The AI assessment is strictly advisory. The AI microservice NEVER auto-approves or auto-rejects applications. As the Administrative Officer, you must review the documents, verification protocols, and SHAP explanation before making the final decision.
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Administrative Officer Remarks / Reasons</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Enter justification for final approval or rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => handleDecision('APPROVED')}
            disabled={reviewing}
          >
            <CheckCircle size={18} /> Approve Application
          </button>

          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => handleDecision('REJECTED')}
            disabled={reviewing}
          >
            <XCircle size={18} /> Reject Application
          </button>
        </div>
      </div>

      {/* AI Evaluation Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Explainable AI Audit & Decision Workspace"
      >
        {analyzing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', gap: '1.25rem' }}>
            <div className="spinner-loader"></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '1.1rem' }}>Auditing Application Data...</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Executing Random Forest risk matrices & SHAP explanation calculations...
              </div>
            </div>
          </div>
        ) : (
          <div>
            {fraudAnalysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Risk Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Risk Class Evaluation</div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <AiRiskBadge riskLevel={fraudAnalysis.risk_level} requirement={fraudAnalysis.verification_requirement} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Calculated Fraud Probability</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                      {(fraudAnalysis.fraud_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Human Readable Explanation */}
                {explanation?.human_readable_explanation && (
                  <div className="alert alert-info" style={{ margin: 0, padding: '1rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>Explainable AI Audit Verdict:</strong>
                      <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {explanation.human_readable_explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* SHAP Chart */}
                {explanation && <ShapVisualizer explanation={explanation} />}

                {/* Officer Decision Section inside Modal */}
                <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--slate-200)', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <MessageSquare size={16} className="text-primary-600" /> Complete Officer Decision
                  </h4>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Decision Justification / Remarks</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Input decision remarks based on AI verification..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleDecision('APPROVED')}
                      disabled={reviewing}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleDecision('REJECTED')}
                      disabled={reviewing}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)' }}>
                No analysis data available. Please trigger the AI evaluation.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
