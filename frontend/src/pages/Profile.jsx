import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { User, Mail, Phone, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    user_name: user?.user_name || '',
    mobile_no: user?.mobile_no || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const res = await authApi.updateProfile(formData);
      updateProfile(res.data.data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-8">Settings</h2>
      
      <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-50">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.user_name}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{user?.user_name}</h3>
            <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail size={16}/> {user?.email}</p>
          </div>
        </div>

        {message && <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 text-sm font-medium">{message}</div>}
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-700">
              <User size={16}/> Username
            </label>
            <input
              type="text"
              name="user_name"
              className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
              value={formData.user_name}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={10}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-700">
              <Phone size={16}/> Mobile Number
            </label>
            <input
              type="text"
              name="mobile_no"
              className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
              value={formData.mobile_no}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white rounded-full px-8 py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-2"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <button 
        onClick={logout}
        className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-600 transition-colors px-4 py-2"
      >
        <LogOut size={20} /> Log Out
      </button>
    </div>
  );
}
