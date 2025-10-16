import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Key, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordModal = ({ user, onClose, onSuccess }) => {
  const [mode, setMode] = useState('choose'); // 'choose', 'direct', 'generate', 'success'
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState(null);
  const [copied, setCopied] = useState({ url: false, token: false });
  const [error, setError] = useState('');

  const handleDirectReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/auth/admin/reset-user-password', {
        userId: user.id || user._id,
        newPassword: newPassword
      });

      toast.success(`Password reset successfully for ${user.username}!`);
      setMode('success');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Direct reset error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0b1120] rounded-lg shadow-2xl border border-gray-800 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <p className="text-sm text-gray-400">
                {user?.username} ({user?.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {mode === 'choose' && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-6">
                Choose how you want to reset the password:
              </p>

              <button
                onClick={() => setMode('direct')}
                className="w-full p-6 bg-[#070d1b] hover:bg-[#0a1428] border border-gray-700 hover:border-blue-500/50 rounded-lg transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Key className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      Set New Password Directly
                    </h3>
                    <p className="text-sm text-gray-400">
                      Set a new password immediately. The user can login right away.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === 'direct' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-[#070d1b] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Enter new password (min 6 characters)"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  The user will be able to login immediately with this password.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setMode('choose')}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleDirectReset}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading || !newPassword}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </div>
          )}

          {mode === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
              <p className="text-gray-400 mb-6">
                The password has been reset successfully. The user can now login with the new password.
              </p>
              <Button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;

