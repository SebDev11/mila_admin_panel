import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Don't show toast for profile fetch errors to avoid spam
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('admin_token', token);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 403) {
          if (data.message?.includes('suspended')) {
            errorMessage = 'Account is suspended. Please contact administrator.';
          } else if (data.message?.includes('Admin privileges')) {
            errorMessage = 'Access denied. Admin privileges required.';
          } else {
            errorMessage = 'Access denied';
          }
        } else if (status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(err => err.msg).join(', ');
          } else {
            errorMessage = data.message || 'Invalid input';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data.message || 'Login failed';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      const { token, user: newUser } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('admin_token', token);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(err => err.msg).join(', ');
          } else if (data.message?.includes('already exists')) {
            errorMessage = 'User with this email or username already exists';
          } else {
            errorMessage = data.message || 'Invalid input';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data.message || 'Registration failed';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('admin_token');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
