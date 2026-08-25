import React, { useEffect, useState } from 'react';
import { citizenService } from '../../services/citizenService';
import { useAuth } from '../../context/AuthContext';
import { User, Save, CheckCircle } from 'lucide-react';

export const MyProfile = () => {
  const { updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await citizenService.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile parameters');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await citizenService.updateProfile(profile);
      setProfile(updated);
      updateUserProfile(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading Citizen Profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User className="text-primary-600" />
          My Citizen Profile
        </h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          View and update your demographic profile data used for automated ML eligibility evaluation.
        </p>

        {message && <div className="alert alert-success"><CheckCircle size={18} /> {message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" name="fullName" value={profile.fullName || ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Identifier)</label>
              <input type="email" className="form-control" name="email" value={profile.email || ''} disabled style={{ background: 'var(--slate-100)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" name="phoneNumber" value={profile.phoneNumber || ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Village</label>
              <input type="text" className="form-control" name="village" value={profile.village || ''} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Occupation</label>
              <input type="text" className="form-control" name="occupation" value={profile.occupation || ''} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Income (₹)</label>
              <input type="number" className="form-control" name="annualIncome" value={profile.annualIncome || ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Land Holding (Acres)</label>
              <input type="number" step="0.1" className="form-control" name="landArea" value={profile.landArea || ''} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Family Size</label>
              <input type="number" className="form-control" name="familySize" value={profile.familySize || 4} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="form-control" name="educationLevel" value={profile.educationLevel || 'Primary'} onChange={handleChange}>
                <option value="Illiterate">Illiterate</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ration Card Type</label>
              <select className="form-control" name="rationCard" value={profile.rationCard || 'PHH'} onChange={handleChange}>
                <option value="PHH">PHH (Priority Household)</option>
                <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                <option value="NPHH">NPHH (Non-Priority Household)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Housing Condition</label>
              <select className="form-control" name="housingCondition" value={profile.housingCondition || 'Pucca'} onChange={handleChange}>
                <option value="Kutcha">Kutcha (Thatched/Mud)</option>
                <option value="Semi-Pucca">Semi-Pucca</option>
                <option value="Pucca">Pucca (Concrete)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select className="form-control" name="employmentStatus" value={profile.employmentStatus || 'Employed'} onChange={handleChange}>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <input type="checkbox" name="farmerStatus" checked={Boolean(profile.farmerStatus)} onChange={handleChange} />
              Registered Farmer
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <input type="checkbox" name="disabilityStatus" checked={Boolean(profile.disabilityStatus)} onChange={handleChange} />
              Person with Disability
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <input type="checkbox" name="aadhaarVerified" checked={Boolean(profile.aadhaarVerified)} onChange={handleChange} />
              Aadhaar Verified
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
