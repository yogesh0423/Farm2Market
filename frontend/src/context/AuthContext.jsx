import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios'; // Adjust path to match your axios instance location

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  // Login handler
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  // Register handler (Hits Flask backend /api/v1/auth/register)
  const register = async (userData) => {
    // API.post automatically prepends your baseURL (e.g., http://localhost:5000/api/v1)
    const response = await API.post('/auth/register', userData);
    const data = response.data;

    // Retrieve token (handles 'token' or 'access_token')
    const userToken = data.token || data.access_token;
    
    if (userToken && data.user) {
      setToken(userToken);
      setUser(data.user);
    }

    return data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};