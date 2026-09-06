import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setIsAuthLoading } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsAuthLoading(true);
    
    try {
      const res = await authApi.login({ identifier, password });
      login(res.data.data.user, res.data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
      setIsAuthLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2 text-text-main">Welcome Back</h1>
      <p className="text-text-muted text-center mb-8">Please log in to your account.</p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email or Mobile</label>
          <input
            type="text"
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="john@example.com"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full bg-page text-text-main placeholder-text-muted border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium hover:underline">Forgot Password?</Link>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[var(--color-primary)] text-black rounded-full py-4 font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-70 transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm text-text-main">
        Don't have an account? <Link to="/register" className="font-semibold hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
