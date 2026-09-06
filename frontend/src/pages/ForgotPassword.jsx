import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthLoading } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsAuthLoading(true);
    
    try {
      await authApi.forgotPassword({ email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
      setIsAuthLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2 text-text-main">Reset Password</h1>
      <p className="text-text-muted text-center mb-8">Enter your email to receive an OTP.</p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full bg-page text-text-main placeholder-text-muted border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[var(--color-primary)] text-black rounded-full py-4 font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-70 transition-colors mt-2"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm text-text-main">
        Remembered your password? <Link to="/login" className="font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
