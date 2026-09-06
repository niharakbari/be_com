import React, { useState } from 'react';
import { useNavigate, useLocation, useOutletContext, Navigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { setIsAuthLoading } = useOutletContext();

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsAuthLoading(true);
    
    try {
      await authApi.resetPassword({ email, otp, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
      setIsAuthLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2 text-text-main">New Password</h1>
      <p className="text-text-muted text-center mb-8">Enter the OTP sent to <br/><span className="font-medium text-text-main">{email}</span> and your new password.</p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Verification Code</label>
          <input
            type="text"
            className="w-full bg-page text-text-main placeholder-text-muted border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            required
            maxLength={6}
            placeholder="------"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full bg-page text-text-main placeholder-text-muted border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || otp.length !== 6 || password.length < 8}
          className="w-full bg-[var(--color-primary)] text-black rounded-full py-4 font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-70 transition-colors mt-2"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
