import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { schemeService } from '../../services/schemeService';
import { citizenService } from '../../services/citizenService';
import { applicationService } from '../../services/applicationService';
import { FileText, CheckCircle, ArrowLeft, AlertTriangle, XCircle } from 'lucide-react';

export const ApplyScheme = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [isEligible, setIsEligible] = useState(true);
  const [matchReasons, setMatchReasons] = useState([]);
  const [declaredIncome, setDeclaredIncome] = useState('');
  const [declaredLandArea, setDeclaredLandArea] = useState('');
  const [documentType, setDocumentType] = useState('Income Certificate');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        let schemeData = null;
        try {
          const recommended = await schemeService.getRecommendedSchemes();
          if (Array.isArray(recommended)) {
            schemeData = recommended.find((s) => s.schemeId === id || String(s.id) === String(id));
          }
        } catch (recErr) {
          console.warn('Could not fetch recommended schemes for eligibility check:', recErr);
        }

        if (!schemeData) {
          schemeData = await schemeService.getSchemeById(id);
        }

        setScheme(schemeData);
        if (schemeData && schemeData.eligible === false) {
          setIsEligible(false);
          setMatchReasons(schemeData.matchReasons || []);
        }

        const profileData = await citizenService.getProfile();
        if (profileData) {
          setDeclaredIncome(profileData.annualIncome || '75000');
          setDeclaredLandArea(profileData.landArea || '0.5');
        }
      } catch (err) {
        setError('Failed to load scheme or profile metadata');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEligible) {
      setError('Application Blocked: Your profile does not meet the eligibility prerequisites for this scheme.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // 1. Create Application
      const app = await applicationService.createApplication({
        schemeId: scheme.schemeId,
        declaredIncome: parseFloat(declaredIncome),
        declaredLandArea: parseFloat(declaredLandArea),
        documentCount: fileName ? 1 : 0,
      });

      // 2. Upload document metadata if provided
      if (fileName) {
        await applicationService.uploadDocument(
          app.id,
          documentType,
          fileName,
          `/uploads/docs/${fileName.replace(/\s+/g, '_')}`
        );
      }

      navigate(`/citizen/applications/${app.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit scheme application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card">Loading Application Form...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link to="/citizen/schemes" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Back to Schemes
      </Link>

      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText className="text-primary-600" />
          Application for {scheme?.name}
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Scheme Reference Code: <strong>{scheme?.schemeId}</strong>
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {!isEligible ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', margin: 0 }}>
              <AlertTriangle size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '1rem' }}>Application Blocked: Ineligible for this Scheme</strong>
                <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.875rem' }}>
                  Your verified citizen profile does not meet the eligibility prerequisites for <strong>{scheme?.name}</strong>:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {matchReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              disabled
              className="btn btn-secondary"
              style={{
                width: '100%',
                opacity: 0.65,
                cursor: 'not-allowed',
                background: 'var(--slate-200)',
                color: 'var(--slate-500)',
                border: '1px solid var(--slate-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                fontWeight: 600,
              }}
            >
              <XCircle size={18} color="#dc2626" /> Application Blocked - Profile Ineligible
            </button>

            <Link
              to="/citizen/schemes"
              className="btn btn-primary"
              style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.75rem' }}
            >
              <ArrowLeft size={16} /> Browse Eligible Schemes For Your Profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Declared Annual Income (₹)</label>
              <input
                type="number"
                className="form-control"
                value={declaredIncome}
                onChange={(e) => setDeclaredIncome(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>
                Prefilled from your citizen profile. Ensure accuracy against official certificates.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Declared Land Holding (Acres)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={declaredLandArea}
                onChange={(e) => setDeclaredLandArea(e.target.value)}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Attach Required Verification Document:</h3>

              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select className="form-control" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Land Chitta Proof">Land Chitta Proof</option>
                  <option value="Bank Passbook">Bank Passbook Copy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document File Name / Reference</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Income_Certificate_2026.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
              <CheckCircle size={18} />
              <span>{submitting ? 'Submitting Application...' : 'Submit Application for Review'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
