import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profileData = await authApi.getMe();
        setProfile(profileData);
        setUser(profileData.user);
      } catch (err) {
        console.error('Failed to load authenticated user profile:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    // Fetch complete profile
    try {
      const profileData = await authApi.getMe();
      setProfile(profileData);
    } catch (e) {
      console.warn('Profile fetch after login skipped:', e);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    try {
      const profileData = await authApi.getMe();
      setProfile(profileData);
    } catch (e) {
      console.warn('Profile fetch after register skipped:', e);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const profileData = await authApi.getMe();
      setProfile(profileData);
      setUser(profileData.user);
      return profileData;
    } catch (err) {
      console.error('Profile refresh failed:', err);
    }
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
