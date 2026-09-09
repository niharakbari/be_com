import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { settingsApi } from '../api/settingsApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Always attempt to fetch profile. 
        // If there's no access token (or it's expired), the axios interceptor 
        // will automatically attempt to use the refresh token cookie to get a new one.
        const [profileRes, settingsRes] = await Promise.all([
          authApi.getProfile(),
          settingsApi.getSettings().catch(() => ({ data: { data: { onboarding_completed: false, budget_mode: 'monthly' } } }))
        ]);
        setUser(profileRes.data.data);
        setSettings(settingsRes.data.data || { onboarding_completed: false, budget_mode: 'monthly' });
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    setSettings(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (userData, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    try {
      const res = await settingsApi.getSettings();
      setSettings(res.data?.data || { onboarding_completed: false, budget_mode: 'monthly' });
    } catch (err) {
      setSettings({ onboarding_completed: false, budget_mode: 'monthly' });
    }
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const updateProfile = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const updateUserSettings = async (data) => {
    try {
      const res = await settingsApi.updateSettings(data);
      setSettings(prev => ({ ...prev, ...(res.data.data || data) }));
      return res.data.data;
    } catch (err) {
      console.error('Failed to update settings', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading, settings, setSettings, updateUserSettings }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
