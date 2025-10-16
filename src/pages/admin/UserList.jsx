import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import ResetPasswordModal from "../../components/admin/ResetPasswordModal";
import { useAuth } from "../../contexts/AuthContext";

function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getStatusBadge = (isVerified) => {
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5";
    return isVerified
      ? (
          <span className={`${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`}>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Active
          </span>
        )
      : (
          <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Inactive
          </span>
        );
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full capitalize";
    const roleColors = {
      'admin': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'active': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'restricted': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'default': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    const colorClass = roleColors[role] || roleColors['default'];
    return <span className={`${baseClasses} ${colorClass}`}>{role || 'Not set'}</span>;
  };

  // Add plan mapping
  const planNumberToName = { 1: 'basic', 2: 'premium', 3: 'premiumPlus'};

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
          <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-blue-200">Loading users...</div>
        </Card>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      <Card className="p-8 text-center bg-red-900/20 border-red-500/30 backdrop-blur-sm shadow-xl">
        <div className="text-red-400 text-lg font-semibold mb-2">Error</div>
        <div className="text-red-300">{error}</div>
      </Card>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-9xl mx-auto space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-blue-200 text-sm sm:text-base">View and manage all user accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-white">{users.length}</div>
            <div className="text-xs sm:text-sm text-blue-200">Total Users</div>
          </div>
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-600/50 bg-slate-700/30">
          <h2 className="text-lg sm:text-xl font-semibold text-white">User Accounts</h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">Browse and manage user information</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600/50 text-sm text-left text-white">
            <thead className="bg-slate-700/40">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Username</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Email</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Role</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Plan</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Status</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold uppercase tracking-wide text-blue-200 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30 bg-slate-800/20">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors duration-200">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-white text-xs sm:text-sm">{user.username}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-blue-200 text-xs sm:text-sm">{user.email}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-slate-600/50 text-blue-200 capitalize">
                      {planNumberToName[user.plan] || 'Free'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(user.isVerified)}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/user/${user._id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </Link>
                      {currentUser && user._id === currentUser.id && (
                        <Button 
                          onClick={() => setSelectedUser(user)}
                          size="sm" 
                          className="text-xs px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-200"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                          </svg>
                          <span className="hidden lg:inline ml-1">Reset</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reset Password Modal */}
      {selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            // Optionally refresh user list
          }}
        />
      )}
    </div>
  );
}
export default UserList;
