import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.verifyOTP({ email, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Verify Email</h1>
      <p className="text-gray-500 text-center mb-8">Enter the 6-digit code sent to <br/><span className="font-medium text-black">{email}</span></p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            required
            maxLength={6}
            placeholder="------"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-2"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
