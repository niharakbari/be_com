import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    mobile_no: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.register(formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
      <p className="text-gray-500 text-center mb-8">Join to manage your finances easily.</p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="user_name"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={formData.user_name}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number</label>
          <input
            type="text"
            name="mobile_no"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={formData.mobile_no}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            title="10 digit mobile number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-2"
        >
          {loading ? 'Sending OTP...' : 'Sign Up'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm">
        Already have an account? <Link to="/login" className="font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
