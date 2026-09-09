import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import {
  setAccessToken,
  clearAccessToken
} from '../api/axios';

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

        

        const refreshRes =
          await authApi.refreshToken();

        const newToken =
          refreshRes.data?.data?.accessToken;


        if (!newToken) {
          throw new Error("Access token was not returned");
        }


        setAccessToken(newToken);


        /*
         * Access token is now available in memory.
         */

        const [profileRes, settingsRes] =
          await Promise.all([

            authApi.getProfile(),

            settingsApi
              .getSettings()
              .catch(() => ({
                data: {
                  data: {
                    onboarding_completed: false,
                    budget_mode: 'monthly'
                  }
                }
              }))

          ]);


        setUser(profileRes.data.data);

        setSettings(
          settingsRes.data.data || {
            onboarding_completed: false,
            budget_mode: 'monthly'
          }
        );


      } catch (error) {

        clearAccessToken();

        setUser(null);

        setSettings(null);

      } finally {

        setLoading(false);

      }

    };


    initAuth();


    const handleUnauthorized = () => {

      clearAccessToken();

      setUser(null);

      setSettings(null);

    };


    window.addEventListener(
      'auth:unauthorized',
      handleUnauthorized
    );


    return () => {

      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized
      );

    };

  }, []);


  const login = async (userData, accessToken) => {

    /*
     * Store access token only in memory.
     */

    setAccessToken(accessToken);


    try {

      const res =
        await settingsApi.getSettings();

      setSettings(
        res.data?.data || {
          onboarding_completed: false,
          budget_mode: 'monthly'
        }
      );

    } catch (err) {

      setSettings({
        onboarding_completed: false,
        budget_mode: 'monthly'
      });

    }


    setUser(userData);

  };


  const logout = async () => {

    try {

      await authApi.logout();

    } catch (e) {

      // Ignore logout API errors.

    }


    clearAccessToken();

    setUser(null);

    setSettings(null);

  };


  const updateProfile = (data) => {

    setUser(prev => ({
      ...prev,
      ...data
    }));

  };


  const updateUserSettings = async (data) => {

    try {

      const res =
        await settingsApi.updateSettings(data);

      setSettings(prev => ({
        ...prev,
        ...(res.data.data || data)
      }));

      return res.data.data;

    } catch (err) {

      console.error(
        'Failed to update settings',
        err
      );

      throw err;

    }

  };


  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        loading,
        settings,
        setSettings,
        updateUserSettings
      }}
    >

      {!loading && children}

    </AuthContext.Provider>

  );

};


export const useAuth = () =>
  useContext(AuthContext);