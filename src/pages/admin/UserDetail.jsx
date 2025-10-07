import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // day, week, month

  const planNumberToName = { 1: 'basic', 2: 'premium', 3: 'premiumPlus'};

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true);
        const response = await api.get(`/stats/user/${id}?period=${period}`);
        setUserStats(response.data);
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (id) {
      fetchUserStats();
    }
  }, [id, period]);

  const getStatusBadge = (isVerified) => {
    const baseClasses = "px-3 py-1.5 text-sm font-semibold rounded-full flex items-center gap-2";
    if (isVerified) {
      return (
        <span className={`${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`}>
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Active
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          Inactive
        </span>
      );
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-3 py-1.5 text-sm font-semibold rounded-full flex items-center gap-2";
    const roleColors = {
      'admin': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'active': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'restricted': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'default': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    const colorClass = roleColors[role] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    const dotColors = {
      'admin': 'bg-purple-400',
      'active': 'bg-blue-400',
      'restricted': 'bg-orange-400',
      'default': 'bg-gray-400'
    };
    const dotColor = dotColors[role] || 'bg-gray-400';
    return (
      <span className={`${baseClasses} ${colorClass}`}>
        <span className={`w-2 h-2 ${dotColor} rounded-full`}></span>
        {role || 'Not set'}
      </span>
    );
  };

  const getActivityTypeBadge = (type) => {
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-2";
    const typeColors = {
      'sent': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'reply': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'ai-reply': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'manual-reply': 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    };
    const colorClass = typeColors[type] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    const dotColors = {
      'sent': 'bg-blue-400',
      'reply': 'bg-green-400',
      'ai-reply': 'bg-purple-400',
      'manual-reply': 'bg-orange-400'
    };
    const dotColor = dotColors[type] || 'bg-gray-400';
    return (
      <span className={`${baseClasses} ${colorClass}`}>
        <span className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></span>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <div className="text-blue-200 text-lg font-medium">Loading user details...</div>
            <div className="text-blue-300/70 text-sm mt-2">Please wait while we fetch the information</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="text-red-400 text-lg font-semibold mb-2">Error Loading User</div>
            <div className="text-red-300/70 text-sm">{error || "User not found"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-9xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
            <p className="text-blue-200 text-lg">View and manage user information</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-blue-300 text-sm">User ID: {user._id}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-300 text-sm">Member since {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main User Info */}
        <div className="lg:col-span-2">
          <Card className="p-8 bg-slate-800/40 border-slate-600/30 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{user.username?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Basic Information</h2>
                <p className="text-blue-200">User account details and settings</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">Username</span>
                </div>
                <span className="text-white font-bold text-lg">{user.username}</span>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">Email Address</span>
                </div>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">Account Status</span>
                </div>
                <div>{getStatusBadge(user.isVerified)}</div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">User Role</span>
                </div>
                <div>{getRoleBadge(user.role)}</div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">Subscription Plan</span>
                </div>
                <span className="text-white font-semibold bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600/50">
                  {planNumberToName[user.plan] || user.plan || 'Free'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-blue-200 font-semibold">Registration Date</span>
                </div>
                <span className="text-white font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not available'}
                </span>
              </div>
            </div>
          </Card>

          {/* User Statistics */}
          <Card className="p-8 mt-8 bg-slate-800/40 border-slate-600/30 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Activity Statistics</h2>
                <p className="text-blue-200">User engagement and performance metrics</p>
              </div>
              <div className="flex space-x-2">
                {['day', 'week', 'month'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-4 py-2 font-semibold transition-all duration-200 ${
                      period === p 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30' 
                        : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {statsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <div className="text-blue-200 text-lg font-medium">Loading statistics...</div>
                <div className="text-blue-300/70 text-sm mt-2">Fetching user activity data</div>
              </div>
            ) : userStats ? (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="text-blue-200 text-sm font-semibold">Sent Emails</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{userStats.sentEmailsCount}</div>
                    <div className="text-blue-300/70 text-xs">This {period}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="text-green-200 text-sm font-semibold">Created Campaigns</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{userStats.createdCampaignsCount}</div>
                    <div className="text-green-300/70 text-xs">This {period}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl p-6 border border-purple-500/30 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div className="text-purple-200 text-sm font-semibold">Total Activities</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{userStats.totalActivities}</div>
                    <div className="text-purple-300/70 text-xs">This {period}</div>
                  </div>
                </div>

                {/* Activities by Type */}
                {userStats.activitiesByType && userStats.activitiesByType.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Activities by Type
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {userStats.activitiesByType.map((activity) => (
                        <div key={activity._id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:bg-slate-600/50 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div>{getActivityTypeBadge(activity._id)}</div>
                            <div className="text-xl font-bold text-white">{activity.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities by Day */}
                {userStats.activitiesByDay && userStats.activitiesByDay.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      Daily Activity
                    </h3>
                    <div className="space-y-3">
                      {userStats.activitiesByDay.map((day) => (
                        <div key={day._id} className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:bg-slate-600/50 transition-all duration-200">
                          <div className="text-white font-semibold">
                            {new Date(day._id).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold text-lg">{day.count}</span>
                            <span className="text-blue-300 text-sm">activities</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaigns by Status */}
                {userStats.campaignsByStatus && userStats.campaignsByStatus.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Campaigns by Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {userStats.campaignsByStatus.map((campaign) => (
                        <div key={campaign._id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:bg-slate-600/50 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="text-blue-200 text-sm font-semibold">{campaign._id || 'No Status'}</div>
                            <div className="text-xl font-bold text-white">{campaign.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div className="text-slate-300 text-lg font-medium mb-2">No Activity Data</div>
                <div className="text-slate-400 text-sm">No activity data available for this period</div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Additional Info */}
          <Card className="p-6 bg-slate-800/40 border-slate-600/30 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Additional Details</h3>
                <p className="text-blue-200 text-sm">Account metadata and settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {user.provider && (
                <div className="flex items-center justify-between py-3 border-b border-slate-600/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-blue-200 text-sm font-semibold">Login Provider</span>
                  </div>
                  <span className="text-white text-sm font-medium bg-slate-700/50 px-3 py-1 rounded-lg">{user.provider}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-blue-200 text-sm font-semibold">Last Updated</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not available'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-slate-800/40 border-slate-600/30 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                <p className="text-blue-200 text-sm">Manage user settings and permissions</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
                onClick={() => navigate(`/restrictions`)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Manage Restrictions
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700/50 text-white hover:bg-slate-600/50 transition-all duration-200"
                onClick={() => navigate(`/billing`)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                View Billing
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 