// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define logout function without dependencies first
  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
  }, []);

  // Now fetchUserProfile can depend on logout
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Token likely invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);  // Add logout as dependency

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile to validate token and get updated user data
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);  // fetchUserProfile as a dependency

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      
      // Save token and user data to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};