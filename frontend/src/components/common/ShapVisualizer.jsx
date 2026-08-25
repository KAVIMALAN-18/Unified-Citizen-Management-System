import React from 'react';
import { HelpCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export const ShapVisualizer = ({ explanation }) => {
  if (!explanation) return null;

  const { top_factors = [], human_readable_explanation = '' } = explanation;

  // Calculate max absolute SHAP value for scaling bar width
  const maxShap = Math.max(
    ...top_factors.map((f) => Math.abs(f.shap_value || 0)),
    0.01
  );

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HelpCircle size={20} className="text-primary-600" />
        SHAP Explainability Report (Dynamic Feature Attributions)
      </h3>

      {human_readable_explanation && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <div>
            <strong>AI Assessment Explanation:</strong>
            <p style={{ marginTop: '0.25rem' }}>{human_readable_explanation}</p>
          </div>
        </div>
      )}

      <h4 style={{ fontSize: '0.9rem', color: 'var(--slate-700)', marginBottom: '0.75rem', fontWeight: 600 }}>
        Top Model Decision Drivers (Feature Impact Breakdown):
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {top_factors.map((factor, idx) => {
          const isPositive = (factor.shap_value || 0) > 0;
          const absVal = Math.abs(factor.shap_value || 0);
          const widthPct = Math.min((absVal / maxShap) * 100, 100);

          return (
            <div key={idx} className="shap-factor-row">
              <div className="shap-factor-header">
                <span>
                  {factor.feature} (Observed: <strong>{factor.observed_value}</strong>)
                </span>
                <span style={{ color: isPositive ? 'var(--danger-text)' : 'var(--info-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{factor.shap_value?.toFixed(4)}
                </span>
              </div>

              <div className="shap-bar-bg">
                <div
                  className={isPositive ? 'shap-bar-fill-positive' : 'shap-bar-fill-negative'}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              {factor.explanation && (
                <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                  {factor.explanation}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
