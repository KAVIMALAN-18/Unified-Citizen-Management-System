import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Building2 } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Building2 className="w-6 h-6 text-primary-600" size={26} />
        <div>
          <span>UCMS e-Governance Portal</span>
          <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--slate-500)', fontWeight: 400 }}>
            Unified Citizen Management System
          </span>
        </div>
      </div>

      {user && (
        <div className="navbar-user">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.fullName}</div>
            <span className={`badge ${role === 'OFFICER' ? 'badge-danger' : 'badge-info'}`}>
              {role === 'OFFICER' ? 'Administrative Officer' : 'Citizen'}
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
