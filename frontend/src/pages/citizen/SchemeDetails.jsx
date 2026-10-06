import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeService } from '../../services/schemeService';
import { Award, ArrowLeft, ArrowRight, FileCheck, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const SchemeDetails = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        // Fetch recommended schemes to get evaluated profile eligibility and reasons
        let found = null;
        try {
          const recommended = await schemeService.getRecommendedSchemes();
          if (Array.isArray(recommended)) {
            found = recommended.find((s) => s.schemeId === id || String(s.id) === String(id));
          }
        } catch (recErr) {
          console.warn('Could not fetch recommended schemes list:', recErr);
        }

        if (found) {
          setScheme(found);
        } else {
          const data = await schemeService.getSchemeById(id);
          setScheme(data);
        }
      } catch (err) {
        console.error('Error loading scheme details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  if (loading) return <div className="card">Loading Scheme Specifications...</div>;
  if (!scheme) return <div className="card">Welfare scheme not found.</div>;

  const isEligible = scheme.eligible !== false;
  const matchScore = scheme.matchScore ?? (isEligible ? 85 : 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/citizen/schemes" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Back to Schemes
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={32} className="text-primary-600" />
            <div>
              <span className="badge badge-info">{scheme.schemeId}</span>
              <h2 className="card-title" style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>{scheme.name}</h2>
            </div>
          </div>

          {/* Profile Compatibility Badge */}
          {scheme.eligible !== undefined && (
            <div>
              {isEligible ? (
                <span
                  style={{
                    background: matchScore >= 85 ? '#dcfce7' : '#e0e7ff',
                    color: matchScore >= 85 ? '#15803d' : '#4338ca',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={16} /> Eligible ({matchScore}% Match)
                </span>
              ) : (
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <XCircle size={16} /> Profile Ineligible
                </span>
              )}
            </div>
          )}
        </div>

        <p style={{ color: 'var(--slate-600)', margin: '1rem 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {scheme.description}
        </p>

        {/* Profile Evaluation Criteria Breakdown */}
        {scheme.matchReasons && scheme.matchReasons.length > 0 && (
          <div
            style={{
              background: isEligible ? '#f0fdf4' : '#fff1f2',
              border: isEligible ? '1px solid #bbf7d0' : '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1.25rem 0',
            }}
          >
            <div style={{ fontWeight: 700, color: isEligible ? '#166534' : '#9f1239', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              {isEligible ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
              {isEligible ? 'Why Your Profile Qualifies:' : 'Eligibility Criteria Mismatch:'}
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: isEligible ? '#14532d' : '#881337', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem' }}>
              {scheme.matchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Eligibility Criteria & Boundaries:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Max Annual Income</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              ₹{scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'Unlimited'}
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Target Age Range</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              {scheme.ageMin} - {scheme.ageMax} Years
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Land Holding Limit</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              {scheme.landLimit ? `${scheme.landLimit} Acres` : 'No Limit'}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Required Supporting Documents:</h3>
        <div style={{ background: 'var(--info-bg)', color: 'var(--info-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileCheck size={24} />
          <div>{scheme.requiredDocuments || 'Aadhaar Card, Income Certificate, Village Residency Proof'}</div>
        </div>

        {/* Application Action Button with Eligibility Guard */}
        {isEligible ? (
          <Link to={`/citizen/apply/${scheme.schemeId}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Proceed to Scheme Application <ArrowRight size={18} />
          </Link>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', margin: 0 }}>
              <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Application Disabled: Ineligible Scheme</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                  Your verified socio-economic profile does not meet the necessary criteria to apply for this scheme.
                </p>
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
              className="btn btn-primary btn-sm"
              style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={14} /> View Your Eligible & Recommended Schemes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
