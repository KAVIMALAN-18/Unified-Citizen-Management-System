import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { UserPlus, Building2 } from 'lucide-react';

export const CitizenRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '9876543210',
    password: '',
    confirmPassword: '',
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

    // Client-side validations
    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        annualIncome: parseFloat(formData.annualIncome) || 0,
        landArea: parseFloat(formData.landArea) || 0,
      };

      const res = await authService.registerCitizen(payload);
      login(res.token, res.citizen);
      navigate('/citizen/dashboard');
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const errorMessages = Object.entries(responseData.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(' | ');
        setError(`Validation Failed: ${errorMessages}`);
      } else {
        setError(responseData?.message || 'Registration failed. Check your input details.');
      }
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

      {error && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. citizen@ucms.gov.in"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number (10 digits)</label>
          <input
            type="text"
            className="form-control"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Password (Min 8 Chars)</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
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
