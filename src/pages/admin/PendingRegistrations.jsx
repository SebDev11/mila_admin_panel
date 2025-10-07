import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Clock, CheckCircle, XCircle, Mail, User, Calendar, Key, RefreshCw,
  Search, Filter, AlertCircle, Download, Trash2, Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const PendingRegistrations = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpired, setFilterExpired] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPendingRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/pending-registrations');
      setPendingUsers(response.data.pendingUsers || []);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load pending registrations');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRegistrations();
  }, [fetchPendingRegistrations]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchPendingRegistrations();
        toast.success('List refreshed', { duration: 1000, icon: '🔄' });
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchPendingRegistrations]);

  useEffect(() => {
    let filtered = pendingUsers;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterExpired) {
      filtered = filtered.filter(user => !isCodeExpired(user.codeExpires));
    }
    setFilteredUsers(filtered);
  }, [pendingUsers, searchTerm, filterExpired]);

  const isCodeExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedUser) return;

    try {
      setApproving(selectedUser.id);
      setShowConfirmModal(false);

      await api.post('/auth/verify-registration', {
        email: selectedUser.email,
        verificationCode: selectedUser.verificationCode
      });

      toast.success(`${selectedUser.username} approved successfully!`, { duration: 4000, icon: '✅' });
      fetchPendingRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve registration';
      toast.error(errorMessage);
    } finally {
      setApproving(null);
      setSelectedUser(null);
    }
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = filteredUsers.map(user => ({
      Username: user.username,
      Email: user.email,
      'Registration Date': formatDate(user.createdAt),
      'Verification Code': user.verificationCode,
      'Code Expires': formatDate(user.codeExpires),
      Status: isCodeExpired(user.codeExpires) ? 'Expired' : 'Pending'
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported to CSV', { icon: '📥' });
  };

  const expiredCount = pendingUsers.filter(user => isCodeExpired(user.codeExpires)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-300 text-lg font-medium">Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      
      {/* Enhanced Header with Icon - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
            Pending Approvals
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Review and approve new admin panel registration requests
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards with Gradient Borders - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Pending */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm border-blue-500/30 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <p className="text-blue-300 text-xs sm:text-sm font-semibold mb-1">Total Pending</p>
              <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">{pendingUsers.length}</p>
            </div>
            <div className="bg-blue-500/20 p-3 sm:p-4 rounded-lg sm:rounded-xl">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-300" />
            </div>
          </div>
        </Card>

        {/* Valid Codes */}
        <Card className="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm border-green-500/30 hover:border-green-400 transition-all">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <p className="text-green-300 text-xs sm:text-sm font-semibold mb-1">Valid Codes</p>
              <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">{pendingUsers.length - expiredCount}</p>
            </div>
            <div className="bg-green-500/20 p-3 sm:p-4 rounded-lg sm:rounded-xl">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-300" />
            </div>
          </div>
        </Card>

        {/* Expired Codes */}
        <Card className="bg-gradient-to-br from-red-600/20 to-red-700/20 backdrop-blur-sm border-red-500/30 hover:border-red-400 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1 min-w-0">
              <p className="text-red-300 text-xs sm:text-sm font-semibold mb-1">Expired Codes</p>
              <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">{expiredCount}</p>
            </div>
            <div className="bg-red-500/20 p-3 sm:p-4 rounded-lg sm:rounded-xl">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-red-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Toolbar - Responsive */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700">
        <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              onClick={() => setFilterExpired(!filterExpired)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                filterExpired 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{filterExpired ? 'Show All' : 'Hide Expired'}</span>
              <span className="sm:hidden">{filterExpired ? 'All' : 'Hide'}</span>
            </Button>

            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Auto-Refresh</span>
              <span className="sm:hidden">Auto</span>
            </Button>

            {filteredUsers.length > 0 && (
              <Button
                onClick={handleExport}
                className="flex items-center gap-2 bg-purple-600/80 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
            )}

            {expiredCount > 0 && (
              <Button
                onClick={() => {
                  if (window.confirm(`Delete ${expiredCount} expired registration(s)?`)) {
                    toast.success('Feature coming soon');
                  }
                }}
                className="flex items-center gap-2 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Expired</span>
              </Button>
            )}

            <Button
              onClick={fetchPendingRegistrations}
              className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Filter Info */}
          {(searchTerm || filterExpired) && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">
                Showing <span className="font-bold text-white">{filteredUsers.length}</span> of <span className="font-bold text-white">{pendingUsers.length}</span> registrations
                {searchTerm && <span> matching "<span className="text-yellow-300">{searchTerm}</span>"</span>}
                {filterExpired && <span className="text-green-300"> (expired hidden)</span>}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pending Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700">
          <div className="text-center py-16">
            {pendingUsers.length === 0 ? (
              <>
                <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Pending Registrations
                </h3>
                <p className="text-gray-300">
                  All registration requests have been processed. Great work!
                </p>
              </>
            ) : (
              <>
                <div className="bg-gray-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-300">
                  Try adjusting your search or filters.
                </p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredUsers.map((user) => {
            const expired = isCodeExpired(user.codeExpires);
            const timeUntilExpiry = new Date(user.codeExpires) - new Date();
            const hoursLeft = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
            const isExpiringSoon = hoursLeft < 6 && hoursLeft >= 0;

            return (
              <Card 
                key={user.id} 
                className={`bg-gray-800/40 backdrop-blur-sm transition-all hover:shadow-xl ${
                  expired 
                    ? 'border-red-500/40 opacity-70' 
                    : isExpiringSoon
                    ? 'border-yellow-500/50 hover:border-yellow-400'
                    : 'border-gray-700 hover:border-blue-500'
                } ${approving === user.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                    
                    {/* User Info Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className={`p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl ${
                          expired 
                            ? 'bg-gray-700' 
                            : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg'
                        }`}>
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Status Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {user.username}
                            </h3>
                            {isExpiringSoon && !expired && (
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 bg-yellow-600/30 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/50">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">{hoursLeft}h left</span>
                                <span className="sm:hidden">{hoursLeft}h</span>
                              </span>
                            )}
                            {expired && (
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 bg-red-600/30 text-red-300 text-xs font-semibold rounded-full border border-red-500/50">
                                <XCircle className="w-3 h-3 mr-1" />
                                Expired
                              </span>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-lg">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                              </div>
                              <span className="text-xs sm:text-sm truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="bg-purple-500/20 p-1.5 sm:p-2 rounded-lg">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                              </div>
                              <span className="text-xs sm:text-sm">{formatDate(user.createdAt)}</span>
                            </div>
                          </div>

                          {/* Verification Code Card */}
                          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 ${
                            expired 
                              ? 'bg-gray-800/50 border border-gray-700' 
                              : 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/40'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Key className={`w-3 h-3 sm:w-4 sm:h-4 ${expired ? 'text-gray-500' : 'text-yellow-400'}`} />
                                <span className={`text-xs font-semibold uppercase ${expired ? 'text-gray-500' : 'text-yellow-300'}`}>
                                  Verification Code
                                </span>
                              </div>
                              {!expired && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.verificationCode);
                                    toast.success('Code copied!', { duration: 1500, icon: '📋' });
                                  }}
                                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md sm:rounded-lg transition-all"
                                >
                                  <span className="hidden sm:inline">Copy</span>
                                  <span className="sm:hidden">📋</span>
                                </button>
                              )}
                            </div>
                            <div className={`font-mono text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider mb-2 ${
                              expired ? 'text-gray-600' : 'text-white'
                            }`}>
                              {user.verificationCode}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs">
                              <span className={expired ? 'text-red-400 font-semibold' : 'text-gray-300'}>
                                {expired ? 'Expired' : 'Expires'}: {formatDate(user.codeExpires)}
                              </span>
                              {!expired && hoursLeft < 24 && (
                                <span className="font-semibold text-yellow-300">
                                  <span className="hidden sm:inline">{hoursLeft}h {minutesLeft}m left</span>
                                  <span className="sm:hidden">{hoursLeft}h left</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-center lg:justify-end">
                      <Button
                        onClick={() => handleApproveClick(user)}
                        disabled={approving === user.id || expired}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base ${
                          expired
                            ? 'bg-gray-700 cursor-not-allowed opacity-50 text-gray-400'
                            : approving === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {approving === user.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin inline mr-2" />
                            <span>Approving...</span>
                          </>
                        ) : expired ? (
                          <>
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            <span>Expired</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            <span className="hidden sm:inline">Approve User</span>
                            <span className="sm:hidden">Approve</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal - Responsive */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 max-w-sm sm:max-w-md w-full p-4 sm:p-6 lg:p-8">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-green-600/20 p-3 sm:p-4 rounded-full">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-3 sm:mb-4">
              Approve Registration?
            </h2>

            {/* User Info */}
            <div className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700">
              <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 text-center">
                You're about to approve:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 bg-blue-600/20 p-2 sm:p-3 rounded-lg">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-white font-semibold text-sm sm:text-base">{selectedUser.username}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-purple-600/20 p-2 sm:p-3 rounded-lg">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  <span className="text-gray-200 text-xs sm:text-sm truncate">{selectedUser.email}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
              <p className="text-yellow-200 text-xs sm:text-sm text-center">
                This user will gain immediate admin panel access
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl transition-all font-semibold text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveConfirm}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl transition-all font-semibold shadow-lg text-sm sm:text-base"
              >
                Approve Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRegistrations;
