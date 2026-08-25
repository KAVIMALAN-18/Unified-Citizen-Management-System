import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schemeService } from '../../services/schemeService';
import { Award, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export const RecommendedSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await schemeService.getAllSchemes();
        setSchemes(data);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  if (loading) return <div className="card">Loading Active Welfare Schemes...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Active Welfare Schemes</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Explore government welfare programs designed for rural empowerment and economic support.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {schemes.map((scheme) => (
          <div key={scheme.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={22} className="text-primary-600" />
                <span className="badge badge-info">{scheme.schemeId}</span>
              </div>

              <h3 className="card-title">{scheme.name}</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>{scheme.description}</p>

              <div style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.825rem' }}>
                <div><strong>Max Income Limit:</strong> ₹{scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'None'}</div>
                <div><strong>Age Limit:</strong> {scheme.ageMin} - {scheme.ageMax} Years</div>
                <div><strong>Land Limit:</strong> {scheme.landLimit ? `${scheme.landLimit} Acres` : 'No Limit'}</div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '1rem' }}>
                <strong>Required Documents:</strong> {scheme.requiredDocuments || 'Aadhaar, Income Certificate'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to={`/citizen/schemes/${scheme.schemeId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                View Requirements
              </Link>
              <Link to={`/citizen/apply/${scheme.schemeId}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
