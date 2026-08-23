import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h2>Register</h2>
      {success ? (
        <p style={{ color: 'green' }}>Registered successfully! Redirecting to login...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label><br />
            <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Email</label><br />
            <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Password</label><br />
            <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Role</label><br />
            <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ padding: '8px 16px' }}>Register</button>
        </form>
      )}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}
