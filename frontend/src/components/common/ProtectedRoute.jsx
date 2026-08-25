import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="btn btn-secondary disabled">Loading Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <div className="page-body">
        <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
          <ShieldAlert size={48} className="text-danger" style={{ color: 'var(--danger-text)', margin: '0 auto 1rem' }} />
          <h2 className="card-title">Access Denied (403 Forbidden)</h2>
          <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
            You are logged in as <strong>{role}</strong> and do not have administrative permission to access officer-only pages.
          </p>
          <Navigate to={role === 'CITIZEN' ? '/citizen/dashboard' : '/officer/dashboard'} replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};
