import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, FileText, CheckCircle, AlertTriangle, FileCheck, MessageSquare, Hammer, PieChart, ArrowRight } from 'lucide-react';

export const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await officerService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load officer dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="card">Loading Administrative Dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Village Administrative Officer Dashboard</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Overview of citizen applications, welfare scheme eligibility, AI fraud evaluations, civic grievances, and village budget allocation.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Citizens</div>
            <div className="stat-value">{stats?.totalCitizens || 0}</div>
          </div>
          <Users size={32} className="text-primary-600" />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Applications</div>
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

        <div className="stat-card">
          <div>
            <div className="stat-label">Remaining Village Budget</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              ₹{stats?.remainingBudget ? Number(stats.remainingBudget).toLocaleString('en-IN') : '0'}
            </div>
          </div>
          <PieChart size={32} style={{ color: 'var(--info-text)' }} />
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText className="text-primary-600" /> Scheme Applications & AI Review
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Inspect applications, trigger Decision Tree ML fraud evaluation, examine SHAP explanations, and make approval decisions.
            </p>
          </div>
          <Link to="/officer/applications" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Review Applications <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck style={{ color: 'var(--success-text)' }} /> Certificate Requests
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Review citizen requests for Income, Residence, and Caste certificates and issue reference codes.
            </p>
          </div>
          <Link to="/officer/certificates" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
            Manage Certificates <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hammer style={{ color: 'var(--warning-text)' }} /> Development Works & Budget
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Track ongoing road, water, and infrastructure projects and maintain financial year budget allocations.
            </p>
          </div>
          <Link to="/officer/development-works" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
            Infrastructure Works <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
