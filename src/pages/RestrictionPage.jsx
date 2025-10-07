import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorModal } from "../components/ui/ErrorModal";
import { api } from "../services/api";

export function RestrictionPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    action: null,
    user: null
  });
  const [successModal, setSuccessModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '' 
  });
  const [loadingModal, setLoadingModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '' 
  });

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

  const getStatusBadge = (user) => {
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5";
    if (!user.isVerified) {
      return (
        <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          Suspended
        </span>
      );
    } else if (user.role === 'restricted') {
      return (
        <span className={`${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/30`}>
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          Restricted
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`}>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Active
        </span>
      );
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full capitalize";
    if (role === 'restricted') {
      return <span className={`${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/30`}>Restricted</span>;
    } else {
      return <span className={`${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`}>Active</span>;
    }
  };

  // Add plan mapping
  const planNumberToName = { 1: 'basic', 2: 'premium', 3: 'premiumPlus'};

  const handleRestrict = async (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm User Restriction",
      message: `Are you sure you want to restrict ${user.username}?`,
      details: "This will limit the user's access to certain features and functionality.",
      action: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoadingModal({
          isOpen: true,
          title: "Restricting User",
          message: `Applying restrictions to ${user.username}...`
        });
        
        try {
          await api.patch(`/users/${user._id}/restrict`);
          
          // Refresh users list
          const response = await api.get("/users");
          setUsers(response.data);
          
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "User Restricted Successfully",
            message: `${user.username} has been restricted and their access has been limited.`,
            details: "The user will now have limited functionality until restrictions are lifted."
          });
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "Failed to Restrict User",
            message: `Unable to restrict ${user.username}. Please try again.`,
            details: `Error: ${errorMessage}`,
            type: "error"
          });
          console.error("Error restricting user:", err);
        }
      },
      user: user
    });
  };

  const handleSuspend = async (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm User Suspension",
      message: `Are you sure you want to suspend ${user.username}?`,
      details: "This will temporarily disable the user's account and prevent them from accessing the system.",
      action: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoadingModal({
          isOpen: true,
          title: "Suspending User",
          message: `Suspending ${user.username}...`
        });
        
        try {
          await api.patch(`/users/${user._id}/suspend`);
          
          // Refresh users list
          const response = await api.get("/users");
          setUsers(response.data);
          
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "User Suspended Successfully",
            message: `${user.username} has been suspended and cannot access the system.`,
            details: "The user account is now inactive and will need to be reactivated to regain access."
          });
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "Failed to Suspend User",
            message: `Unable to suspend ${user.username}. Please try again.`,
            details: `Error: ${errorMessage}`,
            type: "error"
          });
          console.error("Error suspending user:", err);
        }
      },
      user: user
    });
  };

  const handleActivate = async (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm User Activation",
      message: `Are you sure you want to activate ${user.username}?`,
      details: "This will restore the user's full access to the system and remove any restrictions.",
      action: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoadingModal({
          isOpen: true,
          title: "Activating User",
          message: `Restoring access for ${user.username}...`
        });
        
        try {
          await api.patch(`/users/${user._id}/activate`);
          
          // Refresh users list
          const response = await api.get("/users");
          setUsers(response.data);
          
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "User Activated Successfully",
            message: `${user.username} has been activated and now has full system access.`,
            details: "All restrictions have been lifted and the user can now use all features."
          });
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "Failed to Activate User",
            message: `Unable to activate ${user.username}. Please try again.`,
            details: `Error: ${errorMessage}`,
            type: "error"
          });
          console.error("Error activating user:", err);
        }
      },
      user: user
    });
  };

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
    <div className="p-6 max-w-9xl mx-auto space-y-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-blue-200">Manage user restrictions and account status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-sm text-blue-200">Total Users</div>
          </div>
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
        <div className="p-6 border-b border-slate-600/50 bg-slate-700/30">
          <h2 className="text-xl font-semibold text-white">User Accounts</h2>
          <p className="text-blue-200 text-sm mt-1">View and manage all user accounts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600/50 text-sm text-left text-white">
            <thead className="bg-slate-700/40">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wide text-blue-200">User</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wide text-blue-200">Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wide text-blue-200">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wide text-blue-200">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wide text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30 bg-slate-800/20">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex 
                        items-center justify-center text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="text-xs text-blue-300">{user.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                    bg-slate-600/50 text-blue-200 capitalize">
                      {planNumberToName[user.plan] || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 
                        border-orange-500/30 hover:border-orange-500/50 transition-all duration-200"
                        onClick={() => handleRestrict(user)}
                      >
                        Restrict
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 
                        border-red-500/30 hover:border-red-500/50 transition-all duration-200"
                        onClick={() => handleSuspend(user)}
                      >
                        Suspend
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 
                        border-green-500/30 hover:border-green-500/50 transition-all duration-200"
                        onClick={() => handleActivate(user)}
                      >
                        Activate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      </Card>
      
      {/* Loading Modal */}
      <ErrorModal
        isOpen={loadingModal.isOpen}
        onClose={() => {}} // Prevent closing during loading
        title={loadingModal.title}
        message={loadingModal.message}
        type="info"
        buttonText=""
        showButton={false}
      />
      
      {/* Confirmation Modal */}
      <ErrorModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        type="warning"
        buttonText="Confirm"
        details={confirmModal.details}
        onButtonClick={confirmModal.action}
      />
      
      {/* Success/Error Modal */}
      <ErrorModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type || "success"}
        buttonText="Great!"
        details={successModal.details}
      />
    </div>
  );
}