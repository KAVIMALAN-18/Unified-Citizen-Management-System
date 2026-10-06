import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schemeService } from '../../services/schemeService';
import { useAuth } from '../../context/AuthContext';
import { Award, CheckCircle2, XCircle, ArrowRight, Sparkles, AlertCircle, User, ShieldCheck } from 'lucide-react';

export const RecommendedSchemes = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'INELIGIBLE'

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await schemeService.getRecommendedSchemes();
        setSchemes(data);
      } catch (err) {
        console.error('Failed to load recommended schemes, falling back to all:', err);
        try {
          const fallback = await schemeService.getAllSchemes();
          setSchemes(fallback);
        } catch {
          // ignore fallback error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  if (loading) return <div className="card">Loading Personalized Welfare Scheme Recommendations...</div>;

  const eligibleSchemes = schemes.filter((s) => s.eligible === true);
  const ineligibleSchemes = schemes.filter((s) => s.eligible === false);

  const displayedSchemes = schemes.filter((scheme) => {
    if (filter === 'ELIGIBLE') return scheme.eligible === true;
    if (filter === 'INELIGIBLE') return scheme.eligible === false;
    return true;
  });

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles className="text-primary-600" size={24} style={{ color: 'var(--primary-600)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
            Personalized Scheme Recommendations
          </h2>
        </div>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Schemes automatically ranked and matched to your socio-economic citizen profile.
        </p>

        {/* Citizen Profile Attribute Pills */}
        {user && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              alignItems: 'center',
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              marginTop: '0.75rem',
              fontSize: '0.825rem',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} /> Profile Match Context:
            </span>
            <span className="badge badge-info" style={{ fontWeight: 600 }}>{user.fullName}</span>
            <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 600 }}>
              Income: ₹{Number(user.annualIncome || 0).toLocaleString('en-IN')}
            </span>
            <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
              Land: {user.landArea || 0} Acres
            </span>
            <span className="badge" style={{ background: user.farmerStatus ? '#dcfce7' : '#f1f5f9', color: user.farmerStatus ? '#166534' : '#475569', fontWeight: 600 }}>
              Farmer: {user.farmerStatus ? 'Verified' : 'No'}
            </span>
            <span className="badge" style={{ background: '#fce7f3', color: '#9d174d', fontWeight: 600 }}>
              Gender: {user.gender || 'N/A'}
            </span>
            <span className="badge" style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
              Village: {user.village || 'Keeranur'}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setFilter('ALL')}
          className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Schemes ({schemes.length})
        </button>
        <button
          onClick={() => setFilter('ELIGIBLE')}
          className={`btn btn-sm ${filter === 'ELIGIBLE' ? 'btn-primary' : 'btn-secondary'}`}
          style={filter === 'ELIGIBLE' ? { background: '#10b981', borderColor: '#10b981' } : {}}
        >
          <CheckCircle2 size={14} /> Recommended & Eligible ({eligibleSchemes.length})
        </button>
        <button
          onClick={() => setFilter('INELIGIBLE')}
          className={`btn btn-sm ${filter === 'INELIGIBLE' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Other Schemes ({ineligibleSchemes.length})
        </button>
      </div>

      {/* Scheme Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {displayedSchemes.map((scheme) => {
          const isEligible = scheme.eligible !== false;
          const score = scheme.matchScore ?? (isEligible ? 75 : 0);

          return (
            <div
              key={scheme.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isEligible && score >= 85 ? '2px solid #10b981' : '1px solid var(--slate-200)',
                boxShadow: isEligible && score >= 85 ? '0 4px 12px rgba(16, 185, 129, 0.12)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              <div>
                {/* Header Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={20} className="text-primary-600" />
                    <span className="badge badge-info">{scheme.schemeId}</span>
                  </div>

                  {/* Compatibility Match Badge */}
                  {isEligible ? (
                    <span
                      style={{
                        background: score >= 85 ? '#dcfce7' : '#e0e7ff',
                        color: score >= 85 ? '#15803d' : '#4338ca',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Sparkles size={13} /> {score}% High Match
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        fontWeight: 600,
                        fontSize: '0.775rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <XCircle size={13} /> Not Eligible
                    </span>
                  )}
                </div>

                <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{scheme.name}</h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  {scheme.description}
                </p>

                {/* Scheme Boundaries */}
                <div
                  style={{
                    background: 'var(--slate-50)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.85rem',
                    fontSize: '0.8rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.35rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Income Cap:</span>{' '}
                    <strong>₹{scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Age Range:</span>{' '}
                    <strong>{scheme.ageMin} - {scheme.ageMax} Yrs</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Land Ceiling:</span>{' '}
                    <strong>{scheme.landLimit ? `${scheme.landLimit} Acres` : 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Target Group:</span>{' '}
                    <strong>{scheme.schemeId === 'SCH002' ? 'Farmers' : scheme.schemeId === 'SCH005' ? 'Women' : scheme.schemeId === 'SCH001' ? 'Seniors' : 'Rural Citizens'}</strong>
                  </div>
                </div>

                {/* Profile Match Reasons / Criteria Evaluation */}
                {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                  <div
                    style={{
                      background: isEligible ? '#f0fdf4' : '#fff1f2',
                      border: isEligible ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      marginBottom: '0.85rem',
                      fontSize: '0.775rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: isEligible ? '#166534' : '#9f1239', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {isEligible ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                      {isEligible ? 'Why You Qualify:' : 'Criteria Check:'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: isEligible ? '#14532d' : '#881337', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {scheme.matchReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ fontSize: '0.775rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                  <strong>Required Credentials:</strong> {scheme.requiredDocuments || 'Aadhaar Card, Income Certificate'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Link to={`/citizen/schemes/${scheme.schemeId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  View Guidelines
                </Link>
                {isEligible ? (
                  <Link to={`/citizen/apply/${scheme.schemeId}`} className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    Apply Now <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed', color: 'var(--slate-400)' }}
                  >
                    Criteria Mismatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
