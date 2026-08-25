import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Award,
  FileText,
  FileCheck,
  MessageSquare,
  Lightbulb,
  Building,
  Hammer,
  PieChart,
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const citizenNavItems = [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/profile', label: 'My Profile', icon: User },
    { to: '/citizen/schemes', label: 'Welfare Schemes', icon: Award },
    { to: '/citizen/applications', label: 'My Applications', icon: FileText },
    { to: '/citizen/certificates', label: 'Certificates', icon: FileCheck },
    { to: '/citizen/grievances', label: 'Grievances', icon: MessageSquare },
    { to: '/citizen/suggestions', label: 'Suggestions', icon: Lightbulb },
  ];

  const officerNavItems = [
    { to: '/officer/dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
    { to: '/officer/applications', label: 'Applications & AI Review', icon: FileText },
    { to: '/officer/certificates', label: 'Certificate Requests', icon: FileCheck },
    { to: '/officer/grievances', label: 'Grievances', icon: MessageSquare },
    { to: '/officer/suggestions', label: 'Suggestions', icon: Lightbulb },
    { to: '/officer/village', label: 'Village Statistics', icon: Building },
    { to: '/officer/development-works', label: 'Development Works', icon: Hammer },
    { to: '/officer/budget', label: 'Budget & Transparency', icon: PieChart },
  ];

  const navItems = role === 'OFFICER' ? officerNavItems : citizenNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--slate-400)' }}>
          {role === 'OFFICER' ? 'Officer Portal' : 'Citizen Workspace'}
        </h3>
      </div>
      <ul className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="sidebar-item">
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
