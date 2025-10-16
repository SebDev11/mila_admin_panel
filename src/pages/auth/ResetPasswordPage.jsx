import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setTokenError(true);
      toast.error('Invalid or missing reset token');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      
      setResetSuccess(true);
      toast.success('Password reset successful! You can now login.', {
        duration: 5000,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message?.includes('expired') || data.message?.includes('Invalid')) {
            errorMessage = 'Reset link has expired or is invalid. Please request a new one.';
            setTokenError(true);
          } else if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(err => err.msg).join(', ');
          } else {
            errorMessage = data.message || 'Invalid input';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data.message || 'Failed to reset password';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-[#070d1b] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0b1120] p-8 rounded-lg shadow-xl border border-gray-800">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/10 p-3 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#070d1b] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0b1120] p-8 rounded-lg shadow-xl border border-gray-800">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/10 p-3 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
              <p className="text-gray-400 text-sm mb-6">
                This password reset link is invalid or has expired. Reset links are valid for 1 hour.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Request New Reset Link
                </Button>
                
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-[#070d1b] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0b1120] p-8 rounded-lg shadow-xl border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
            <p className="text-gray-400 text-sm">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-[#070d1b] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter new password"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                <p className="mt-1 text-sm text-yellow-400">Password should be at least 6 characters</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-[#070d1b] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-300 text-xs leading-relaxed">
                <strong>💡 Password Requirements:</strong>
                <br />
                • At least 6 characters long
                <br />
                • Make it unique and secure
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors duration-200"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

