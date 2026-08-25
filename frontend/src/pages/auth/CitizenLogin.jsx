import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { LogIn, Building2 } from 'lucide-react';

export const CitizenLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.loginCitizen({ email, password });
      login(res.token, res.citizen);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Building2 size={40} className="text-primary-600" style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>Citizen Login</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Access your Unified Citizen Management System workspace</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. citizen@ucms.gov.in"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          <LogIn size={18} />
          <span>{loading ? 'Authenticating...' : 'Sign In as Citizen'}</span>
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register Now</Link>
        <div style={{ marginTop: '0.75rem' }}>
          <Link to="/officer/login" style={{ color: 'var(--slate-500)', fontSize: '0.825rem' }}>Are you an Administrative Officer? Switch to Officer Login →</Link>
        </div>
      </div>
    </div>
  );
};

export const OfficerLogin = () => {
  const [email, setEmail] = useState('officer@ucms.gov.in');
  const [password, setPassword] = useState('Officer@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.loginOfficer({ email, password });
      login(res.token, res.citizen);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid officer credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Building2 size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--danger-text)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>Officer Login</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Administrative Officer Secure Access Portal</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Officer Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          <LogIn size={18} />
          <span>{loading ? 'Authenticating...' : 'Sign In as Officer'}</span>
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ color: 'var(--slate-600)' }}>← Switch back to Citizen Login</Link>
      </div>
    </div>
  );
};
