import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Always attempt to fetch profile. 
        // If there's no access token (or it's expired), the axios interceptor 
        // will automatically attempt to use the refresh token cookie to get a new one.
        const res = await authApi.getProfile();
        setUser(res.data.data);
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
