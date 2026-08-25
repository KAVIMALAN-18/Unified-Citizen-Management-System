import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileText, Search, Eye, Cpu } from 'lucide-react';

export const OfficerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await officerService.getAllApplications();
        setApplications(data);
        setFilteredApps(data);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    let result = applications;

    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.applicationId?.toLowerCase().includes(term) ||
          a.citizenEmail?.toLowerCase().includes(term) ||
          a.citizenName?.toLowerCase().includes(term) ||
          a.schemeId?.toLowerCase().includes(term)
      );
    }

    setFilteredApps(result);
  }, [searchTerm, statusFilter, applications]);

  if (loading) return <div className="card">Loading Applications...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Applications Review & AI Verification</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Evaluate submitted welfare scheme applications using Decision Tree ML predictions and dynamic SHAP feature attributions.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Application ID, Citizen Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>

              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        {filteredApps.length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No applications found matching search criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Citizen Name & Email</th>
                  <th>Scheme</th>
                  <th>Declared Income</th>
                  <th>AI Analysis Status</th>
                  <th>Application Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td><strong>{app.applicationId}</strong></td>
                    <td>
                      <div><strong>{app.citizenName}</strong></div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>{app.citizenEmail}</div>
                    </td>
                    <td>{app.schemeName || app.schemeId}</td>
                    <td>₹{app.declaredIncome ? Number(app.declaredIncome).toLocaleString('en-IN') : '0'}</td>
                    <td>
                      {app.aiAnalysisStatus === 'COMPLETED' || app.aiAnalysisStatus === 'PENDING_OFFICER_REVIEW' ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Cpu size={12} /> Evaluated
                        </span>
                      ) : (
                        <span className="badge badge-warning">Not Analyzed</span>
                      )}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Link to={`/officer/applications/${app.id}`} className="btn btn-primary btn-sm">
                        <Eye size={14} /> Review & AI Analysis
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
