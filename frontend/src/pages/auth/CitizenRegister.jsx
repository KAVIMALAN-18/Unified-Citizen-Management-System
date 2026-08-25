import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { UserPlus, Building2 } from 'lucide-react';

export const CitizenRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    dateOfBirth: '1990-01-01',
    gender: 'MALE',
    address: '123 Main Street',
    village: 'Keeranur',
    occupation: 'Worker',
    annualIncome: '75000',
    landArea: '0.5',
    farmerStatus: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.registerCitizen(formData);
      login(res.token, res.citizen);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Building2 size={36} className="text-primary-600" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-600)' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Citizen Registration</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Register to access village welfare schemes and services</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-control" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Annual Income (₹)</label>
            <input type="number" className="form-control" name="annualIncome" value={formData.annualIncome} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Land Holding (Acres)</label>
            <input type="number" step="0.1" className="form-control" name="landArea" value={formData.landArea} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          <UserPlus size={18} />
          <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
        </button>
      </form>

      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
      </div>
    </div>
  );
};
