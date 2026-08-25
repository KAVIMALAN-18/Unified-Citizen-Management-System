import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileText, Eye } from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div className="card">Loading Applications List...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>My Welfare Applications</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Track application status, submitted details, and administrative officer decisions.
        </p>
      </div>

      <div className="card">
        {applications.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No applications found. Explore schemes to submit a request.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Welfare Scheme</th>
                  <th>Submitted Date</th>
                  <th>Declared Income</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td><strong>{app.applicationId}</strong></td>
                    <td>{app.schemeName || app.schemeId}</td>
                    <td>{app.applicationDate}</td>
                    <td>₹{app.declaredIncome ? Number(app.declaredIncome).toLocaleString('en-IN') : '0'}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Link to={`/citizen/applications/${app.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
