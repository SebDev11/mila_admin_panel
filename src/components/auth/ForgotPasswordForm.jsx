import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email!', {
        duration: 5000,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(err => err.msg).join(', ');
          } else {
            errorMessage = data.message || 'Invalid email';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data.message || 'Failed to send reset email';
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
  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#0b1120] p-8 rounded-lg shadow-xl border border-gray-800">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              If an account exists with <strong className="text-white">{email}</strong>, 
              you will receive a password reset link shortly.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm leading-relaxed">
              <strong>📧 Next Steps:</strong>
              <br />
              • Check your email inbox (and spam folder)
              <br />
              • Click the reset link within 1 hour
              <br />
              • Create a new password
            </p>
          </div>

          <Button
            onClick={onBackToLogin}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>

          <div className="mt-4 text-center">
            <button
              onClick={() => setEmailSent(false)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#0b1120] p-8 rounded-lg shadow-xl border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-gray-400 text-sm">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-[#070d1b] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your email"
                disabled={loading}
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

