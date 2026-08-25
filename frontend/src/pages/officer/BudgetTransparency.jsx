import React, { useEffect, useState } from 'react';
import { officerService } from '../../services/officerService';
import { PieChart, Save, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';

export const BudgetTransparency = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [totalAllocation, setTotalAllocation] = useState('5000000');
  const [allocatedAmount, setAllocatedAmount] = useState('4200000');
  const [spentAmount, setSpentAmount] = useState('2150000');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBudget = async () => {
    try {
      const data = await officerService.getLatestBudget();
      setBudget(data);
      if (data) {
        setFinancialYear(data.financialYear || '2025-2026');
        setTotalAllocation(data.totalAllocation?.toString() || '5000000');
        setAllocatedAmount(data.allocatedAmount?.toString() || '4200000');
        setSpentAmount(data.spentAmount?.toString() || '2150000');
      }
    } catch (err) {
      console.error('Failed to load budget record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await officerService.updateBudget({
        financialYear,
        totalAllocation: parseFloat(totalAllocation),
        allocatedAmount: parseFloat(allocatedAmount),
        spentAmount: parseFloat(spentAmount),
      });
      setBudget(updated);
      setMessage('Village Budget updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget. Ensure spent amount does not exceed allocation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading Financial Budget...</div>;

  const total = parseFloat(totalAllocation) || 0;
  const allocated = parseFloat(allocatedAmount) || 0;
  const spent = parseFloat(spentAmount) || 0;
  const remaining = allocated - spent;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>Panchayat Village Budget & Financial Transparency</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Financial year allocation tracking and public transparency management.
        </p>
      </div>

      {message && <div className="alert alert-success"><CheckCircle size={18} /> {message}</div>}
      {error && <div className="alert alert-danger"><AlertCircle size={18} /> {error}</div>}

      {/* Financial Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Allocation</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>₹{total.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Allocated Fund</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--primary-800)' }}>₹{allocated.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Amount Spent</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--warning-text)' }}>₹{spent.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Remaining Balance</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success-text)' }}>₹{remaining.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Budget Form */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart className="text-primary-600" /> Financial Year Budget Parameters
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Financial Year</label>
              <input
                type="text"
                className="form-control"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Treasury Grant (₹)</label>
              <input
                type="number"
                className="form-control"
                value={totalAllocation}
                onChange={(e) => setTotalAllocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Allocated Project Funds (₹)</label>
              <input
                type="number"
                className="form-control"
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expenditure to Date (₹)</label>
              <input
                type="number"
                className="form-control"
                value={spentAmount}
                onChange={(e) => setSpentAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            <strong>Calculated Remaining Balance:</strong>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-text)', marginLeft: '0.5rem' }}>
              ₹{remaining.toLocaleString('en-IN')}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Updating Budget...' : 'Save Financial Budget'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
