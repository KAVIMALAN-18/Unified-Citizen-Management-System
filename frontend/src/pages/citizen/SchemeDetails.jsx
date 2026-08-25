import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeService } from '../../services/schemeService';
import { Award, ArrowLeft, ArrowRight, FileCheck } from 'lucide-react';

export const SchemeDetails = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const data = await schemeService.getSchemeById(id);
        setScheme(data);
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/citizen/schemes" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Back to Schemes
      </Link>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Award size={32} className="text-primary-600" />
          <div>
            <span className="badge badge-info">{scheme.schemeId}</span>
            <h2 className="card-title" style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>{scheme.name}</h2>
          </div>
        </div>

        <p style={{ color: 'var(--slate-600)', margin: '1rem 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {scheme.description}
        </p>

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

        <Link to={`/citizen/apply/${scheme.schemeId}`} className="btn btn-primary" style={{ width: '100%' }}>
          Proceed to Scheme Application <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
