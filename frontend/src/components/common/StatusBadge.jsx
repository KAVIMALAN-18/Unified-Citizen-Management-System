import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toString().toUpperCase();

  let badgeClass = 'badge-info';
  if (['APPROVED', 'RESOLVED', 'ACCEPTED', 'IMPLEMENTED', 'COMPLETED'].includes(normalized)) {
    badgeClass = 'badge-success';
  } else if (['REJECTED'].includes(normalized)) {
    badgeClass = 'badge-danger';
  } else if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_OFFICER_REVIEW', 'IN_PROGRESS', 'PLANNED'].includes(normalized)) {
    badgeClass = 'badge-warning';
  }

  const label = normalized.replace(/_/g, ' ');

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

export const AiRiskBadge = ({ riskLevel, requirement }) => {
  if (!riskLevel) return null;

  const level = riskLevel.toString().toUpperCase();

  let riskClass = 'badge-risk-low';
  if (level === 'MEDIUM') riskClass = 'badge-risk-medium';
  if (level === 'HIGH') riskClass = 'badge-risk-high';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
      <span className={`badge ${riskClass}`}>Fraud Risk Level: {level}</span>
      {requirement && (
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 500 }}>
          {requirement}
        </span>
      )}
    </div>
  );
};
