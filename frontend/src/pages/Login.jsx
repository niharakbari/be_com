import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await authApi.login({ identifier, password });
      login(res.data.data.user, res.data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
      <p className="text-gray-500 text-center mb-8">Enter your details to access your account.</p>
      
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
            className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
          className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm">
        Don't have an account? <Link to="/register" className="font-semibold hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
