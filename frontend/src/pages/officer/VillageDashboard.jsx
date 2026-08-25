import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { Users, FileText, CheckCircle, AlertTriangle, FileCheck, MessageSquare, Lightbulb, Hammer, PieChart } from 'lucide-react';

export const VillageDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await officerService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load village stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="card">Loading Village Dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Panchayat Village Demographics & Statistical Overview</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Aggregated transparency metrics for Keeranur Village administration.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Registered Citizens</div>
            <div className="stat-value">{stats?.totalCitizens || 0}</div>
          </div>
          <Users size={32} className="text-primary-600" />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Applications</div>
            <div className="stat-value">{stats?.totalApplications || 0}</div>
          </div>
          <FileText size={32} style={{ color: 'var(--info-text)' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-value" style={{ color: 'var(--warning-text)' }}>{stats?.pendingApplications || 0}</div>
          </div>
          <AlertTriangle size={32} style={{ color: 'var(--warning-text)' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Approved Applications</div>
            <div className="stat-value" style={{ color: 'var(--success-text)' }}>{stats?.approvedApplications || 0}</div>
          </div>
          <CheckCircle size={32} style={{ color: 'var(--success-text)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck className="text-primary-600" /> Certificate Requests Summary
          </h3>
          <div style={{ marginTop: '1rem', fontSize: '1rem' }}>
            <div>Pending Requests: <strong>{stats?.pendingCertificateRequests || 0}</strong></div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare style={{ color: 'var(--warning-text)' }} /> Civic Grievances Breakdown
          </h3>
          <div style={{ marginTop: '1rem', fontSize: '1rem' }}>
            <div>Open Grievances: <strong>{stats?.openGrievances || 0}</strong></div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hammer style={{ color: 'var(--success-text)' }} /> Development Projects Summary
          </h3>
          <div style={{ marginTop: '1rem', fontSize: '1rem' }}>
            <div>Total Projects: <strong>{stats?.developmentWorks || 0}</strong></div>
            <div>Completed Projects: <strong>{stats?.completedWorks || 0}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
