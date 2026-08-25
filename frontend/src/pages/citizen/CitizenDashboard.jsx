import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { schemeService } from '../../services/schemeService';
import { certificateService } from '../../services/certificateService';
import { grievanceService } from '../../services/grievanceService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Award, FileText, FileCheck, MessageSquare, ArrowRight, UserCheck } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, schemesRes, certsRes, grvRes] = await Promise.allSettled([
          applicationService.getMyApplications(),
          schemeService.getAllSchemes(),
          certificateService.getMyRequests(),
          grievanceService.getMyGrievances(),
        ]);

        if (appsRes.status === 'fulfilled') setApplications(appsRes.value);
        if (schemesRes.status === 'fulfilled') setSchemes(schemesRes.value);
        if (certsRes.status === 'fulfilled') setCertificates(certsRes.value);
        if (grvRes.status === 'fulfilled') setGrievances(grvRes.value);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="card">Loading Dashboard Data...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-700), var(--primary-800))', color: '#ffffff', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome back, {user?.fullName}!</h2>
        <p style={{ opacity: 0.9, marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Village: <strong>{user?.village || 'Keeranur'}</strong> | Registered Citizen ID: <strong>{user?.email}</strong>
        </p>
      </div>

      {/* Summary Stat Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Active Applications</div>
            <div className="stat-value">{applications.length}</div>
          </div>
          <FileText size={32} className="text-primary-600" />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Certificate Requests</div>
            <div className="stat-value">{certificates.length}</div>
          </div>
          <FileCheck size={32} style={{ color: 'var(--success-text)' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Open Grievances</div>
            <div className="stat-value">{grievances.length}</div>
          </div>
          <MessageSquare size={32} style={{ color: 'var(--warning-text)' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Available Schemes</div>
            <div className="stat-value">{schemes.length}</div>
          </div>
          <Award size={32} style={{ color: 'var(--info-text)' }} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Active Applications Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>My Recent Applications</h3>
            <Link to="/citizen/applications" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No applications submitted yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 4).map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/citizen/applications/${app.id}`} style={{ fontWeight: 600 }}>
                          {app.applicationId}
                        </Link>
                      </td>
                      <td>{app.applicationDate}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommended Welfare Schemes Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Welfare Schemes Catalog</h3>
            <Link to="/citizen/schemes" className="btn btn-primary btn-sm">
              Explore Schemes <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {schemes.slice(0, 3).map((scheme) => (
              <div key={scheme.id} style={{ border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{scheme.name}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: '0.25rem 0' }}>{scheme.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.775rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    Income Limit: ₹{scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'N/A'}
                  </span>
                  <Link to={`/citizen/apply/${scheme.schemeId}`} className="btn btn-secondary btn-sm">
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
