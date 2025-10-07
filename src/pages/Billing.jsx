import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { ErrorModal } from "../components/ui/ErrorModal";
import { api } from "../services/api";

export function Billing() {
  const [billingData, setBillingData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planEdits, setPlanEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [newPlan, setNewPlan] = useState({ name: '', emailLimit: '', price: '', stripePriceId: '', description: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [removing, setRemoving] = useState({});
  const [errorModal, setErrorModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'error',
    details: '',
    action: null
  });
  const [successModal, setSuccessModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '',
    details: '',
    action: null
  });
  const [loadingModal, setLoadingModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '' 
  });

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const billingResponse = await api.get("/billing");
        setBillingData(billingResponse.data);
        // Fetch all plans for editing
        const plansResponse = await api.get("/billing/plans");
        setPlans(plansResponse.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
        setErrorModal({
          isOpen: true,
          title: "Failed to Load Billing Data",
          message: "Unable to fetch billing information from the server.",
          details: `Error: ${errorMessage}`,
          type: "error",
          action: () => {
            setErrorModal({ ...errorModal, isOpen: false });
            window.location.reload();
          }
        });
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillingData();
  }, []);

  const columns = [
    { key: "name", label: "User" },
    { key: "plan", label: "Plan", render: (row) => row.plan ? row.plan.charAt(0).toUpperCase() + row.plan.slice(1) : 'Free' },
    { key: "role", label: "Role", render: (row) => row.role || 'active' },
    { key: "emailLimit", label: "Email Limit", render: (row) => row.emailLimit ? row.emailLimit.toLocaleString() : 'Unlimited' },
    { key: "price", label: "Price", render: (row) => row.price ? `$${(row.price / 100).toFixed(2)}` : 'Free' },
    { key: "status", label: "Status" },
    { key: "expiry", label: "Expiry Date" }
  ];

  const handlePlanEdit = (planName, value) => {
    setPlanEdits(prev => ({ ...prev, [planName]: value }));
  };

  const handleSavePlan = async (planName) => {
    setSaving(prev => ({ ...prev, [planName]: true }));
    setLoadingModal({
      isOpen: true,
      title: "Updating Plan",
      message: `Saving changes to ${planName} plan...`
    });
    
    try {
      const emailLimit = Number(planEdits[planName]);
      await api.patch(`/billing/plan/${planName}`, { emailLimit });
      
      // Refresh plans
      const plansResponse = await api.get("/billing/plans");
      setPlans(plansResponse.data);
      setPlanEdits(prev => ({ ...prev, [planName]: undefined }));
      
      // Refresh billing data (top table)
      const billingResponse = await api.get("/billing");
      setBillingData(billingResponse.data);
      
      setLoadingModal({ isOpen: false, title: '', message: '' });
      setSuccessModal({
        isOpen: true,
        title: "Plan Updated Successfully",
        message: `The ${planName} plan has been updated with new email limit.`,
        details: `New email limit: ${emailLimit.toLocaleString()} emails per month`,
        action: null
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      setLoadingModal({ isOpen: false, title: '', message: '' });
      setErrorModal({
        isOpen: true,
        title: "Failed to Update Plan",
        message: `Unable to update the ${planName} plan. Please check your input and try again.`,
        details: `Error: ${errorMessage}`,
        type: "error",
        action: null
      });
    } finally {
      setSaving(prev => ({ ...prev, [planName]: false }));
    }
  };

  const handleNewPlanChange = (e) => {
    const { name, value } = e.target;
    setNewPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setLoadingModal({
      isOpen: true,
      title: "Creating New Plan",
      message: `Setting up ${newPlan.name} plan...`
    });
    
    try {
      const payload = {
        ...newPlan,
        emailLimit: Number(newPlan.emailLimit),
        price: Number(newPlan.price)
      };
      
      await api.post('/billing/plan', payload);
      
      // Refresh plans
      const plansResponse = await api.get("/billing/plans");
      setPlans(plansResponse.data);
      
      // Clear form
      setNewPlan({ name: '', emailLimit: '', price: '', stripePriceId: '', description: '' });
      
      setLoadingModal({ isOpen: false, title: '', message: '' });
      setSuccessModal({
        isOpen: true,
        title: "Plan Created Successfully",
        message: `The ${payload.name} plan has been created and is now available for users.`,
        details: `Email Limit: ${payload.emailLimit.toLocaleString()} emails/month | Price: $${(payload.price / 100).toFixed(2)}/month`,
        action: null
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      setLoadingModal({ isOpen: false, title: '', message: '' });
      setErrorModal({
        isOpen: true,
        title: "Failed to Create Plan",
        message: `Unable to create the ${newPlan.name} plan. Please check your input and try again.`,
        details: `Error: ${errorMessage}`,
        type: "error",
        action: null
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemovePlan = async (planName) => {
    // Show confirmation modal instead of browser confirm
    setErrorModal({
      isOpen: true,
      title: "Confirm Plan Removal",
      message: `Are you sure you want to remove the "${planName}" plan?`,
      details: "This action cannot be undone and will affect all users currently on this plan.",
      type: "warning",
      action: async () => {
        setErrorModal({ ...errorModal, isOpen: false });
        setRemoving(prev => ({ ...prev, [planName]: true }));
        setLoadingModal({
          isOpen: true,
          title: "Removing Plan",
          message: `Deleting ${planName} plan...`
        });
        
        try {
          await api.delete(`/billing/plan/${planName}`);
          
          // Refresh plans
          const plansResponse = await api.get("/billing/plans");
          setPlans(plansResponse.data);
          
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setSuccessModal({
            isOpen: true,
            title: "Plan Removed Successfully",
            message: `The ${planName} plan has been permanently removed from the system.`,
            details: "All users on this plan will need to be migrated to a different plan.",
            action: null
          });
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
          setLoadingModal({ isOpen: false, title: '', message: '' });
          setErrorModal({
            isOpen: true,
            title: "Failed to Remove Plan",
            message: `Unable to remove the ${planName} plan. Please try again.`,
            details: `Error: ${errorMessage}`,
            type: "error",
            action: null
          });
        } finally {
          setRemoving(prev => ({ ...prev, [planName]: false }));
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-blue-200">Loading billing data...</div>
          </Card>
      </div>
      </div>
    );
  }


  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-9xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Billing Management</h1>
          <p className="text-blue-200 text-sm sm:text-base">Manage user billing and subscription plans</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-white">{billingData.length}</div>
            <div className="text-xs sm:text-sm text-blue-200">Total Users</div>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-600/50 bg-gradient-to-r from-slate-700/40 to-slate-600/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">User Billing Overview</h2>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">View and manage user billing information and subscription details</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-600/30 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600/30">
                <thead className="bg-gradient-to-r from-slate-700/60 to-slate-600/50">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wide">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-600/30 bg-slate-800/20">
                {billingData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-slate-400 py-8 sm:py-12">
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="text-slate-300 text-base sm:text-lg font-medium mb-2">No User Data</div>
                          <div className="text-slate-400 text-xs sm:text-sm">No billing information available at the moment</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  billingData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-700/30 transition-all duration-200 group">
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          {col.key === 'name' ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs sm:text-sm">
                                  {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white font-semibold text-xs sm:text-sm truncate">{row.name || 'Unknown User'}</div>
                                <div className="text-slate-400 text-xs hidden sm:block">User ID: {row._id?.slice(-8) || 'N/A'}</div>
                              </div>
                            </div>
                          ) : col.key === 'plan' ? (
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              row.plan === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              row.plan === 'basic' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              row.plan === 'enterprise' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                                row.plan === 'premium' ? 'bg-purple-400' :
                                row.plan === 'basic' ? 'bg-blue-400' :
                                row.plan === 'enterprise' ? 'bg-yellow-400' :
                                'bg-slate-400'
                              }`}></span>
                              <span className="hidden sm:inline">{row.plan ? row.plan.charAt(0).toUpperCase() + row.plan.slice(1) : 'Free'}</span>
                              <span className="sm:hidden">{row.plan ? row.plan.charAt(0).toUpperCase() : 'F'}</span>
                            </span>
                          ) : col.key === 'role' ? (
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              row.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              row.role === 'moderator' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                                row.role === 'admin' ? 'bg-red-400' :
                                row.role === 'moderator' ? 'bg-orange-400' :
                                'bg-green-400'
                              }`}></span>
                              <span className="hidden sm:inline">{row.role || 'Active'}</span>
                              <span className="sm:hidden">{row.role ? row.role.charAt(0).toUpperCase() : 'A'}</span>
                            </span>
                          ) : col.key === 'emailLimit' ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-white font-semibold text-xs sm:text-sm">
                                {row.emailLimit ? row.emailLimit.toLocaleString() : 'Unlimited'}
                              </span>
                              <span className="text-slate-400 text-xs hidden sm:inline">emails</span>
                            </div>
                          ) : col.key === 'price' ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-white font-bold text-sm sm:text-lg">
                                {row.price ? `$${(row.price / 100).toFixed(2)}` : 'Free'}
                              </span>
                              <span className="text-slate-400 text-xs hidden sm:inline">/month</span>
                            </div>
                          ) : col.key === 'status' ? (
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              row.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              row.status === 'suspended' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              row.status === 'restricted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                                row.status === 'active' ? 'bg-green-400' :
                                row.status === 'suspended' ? 'bg-red-400' :
                                row.status === 'restricted' ? 'bg-yellow-400' :
                                'bg-slate-400'
                              }`}></span>
                              <span className="hidden sm:inline">{row.status || 'Active'}</span>
                              <span className="sm:hidden">{row.status ? row.status.charAt(0).toUpperCase() : 'A'}</span>
                            </span>
                          ) : col.key === 'expiry' ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span className="text-white font-medium text-xs sm:text-sm">
                                {row.expiry ? new Date(row.expiry).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white">{row[col.key]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        </Card>
      <Card className="p-0 overflow-hidden bg-slate-800/60 border-slate-600/50 backdrop-blur-sm shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-600/50 bg-gradient-to-r from-slate-700/40 to-slate-600/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Plan Management</h2>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">Create and manage subscription plans for your users</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleAddPlan} className="mb-6 sm:mb-8 bg-gradient-to-br from-slate-700/50 to-slate-600/40 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-slate-500/40 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Add New Plan</h3>
                  <p className="text-blue-200 text-xs sm:text-sm">Configure a new subscription plan with custom settings</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 items-stretch">
            <div className="space-y-3 group relative h-full flex flex-col">
              {/* Special Background Highlight */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-blue-500/10 rounded-2xl border border-blue-400/30 shadow-2xl shadow-blue-500/20"></div>
              
              <label className="block text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-white flex items-center gap-2 sm:gap-3 relative z-10">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 border-2 border-blue-400/50">
                  <span className="text-xs sm:text-sm font-black text-white">1</span>
                </div>
                <div>
                  <div className="text-white text-sm sm:text-base font-bold">Plan Name</div>
                  <div className="text-blue-300 text-xs font-medium">Primary Identifier</div>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                </div>
              </label>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="relative flex-1">
                  <input 
                    name="name" 
                    value={newPlan.name} 
                    onChange={handleNewPlanChange} 
                    required 
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 sm:border-3 border-blue-400/80 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-5 text-white text-sm sm:text-lg font-semibold placeholder-gray-300 focus:border-blue-400 focus:ring-4 sm:focus:ring-6 focus:ring-blue-400/30 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 group-hover:border-blue-400 group-hover:scale-[1.02] backdrop-blur-sm" 
                    placeholder="Enter plan name (e.g., basic, premium, enterprise)" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Helper Text */}
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 rounded-lg sm:rounded-xl border border-blue-400/40 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-blue-200 text-xs sm:text-sm font-semibold">Unique identifier for the plan</div>
                      <div className="text-blue-300/70 text-xs mt-1">This name will be used to identify the plan in the system</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 group relative h-full flex flex-col">
              {/* Special Background Highlight */}
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500/10 via-emerald-500/15 to-green-500/10 rounded-2xl border border-green-400/30 shadow-2xl shadow-green-500/20"></div>
              
              <label className="block text-sm font-bold mb-4 text-white flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 border-2 border-green-400/50">
                  <span className="text-sm font-black text-white">2</span>
                </div>
                <div>
                  <div className="text-white text-base font-bold">Email Limit</div>
                  <div className="text-green-300 text-xs font-medium">Critical Setting</div>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                </div>
              </label>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="relative flex-1">
                  <input 
                    name="emailLimit" 
                    type="number" 
                    min="0" 
                    value={newPlan.emailLimit} 
                    onChange={handleNewPlanChange} 
                    required 
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-3 border-green-400/80 rounded-2xl px-6 py-5 text-white text-lg font-semibold placeholder-gray-300 focus:border-green-400 focus:ring-6 focus:ring-green-400/30 transition-all duration-500 shadow-2xl hover:shadow-green-500/25 group-hover:border-green-400 group-hover:scale-[1.02] backdrop-blur-sm" 
                    placeholder="Max emails per month (e.g., 1000)" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Helper Text */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-xl border border-green-400/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-green-200 text-sm font-semibold">Maximum emails user can send per month</div>
                      <div className="text-green-300/70 text-xs mt-1">This setting controls the monthly email quota for this plan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 group relative h-full flex flex-col">
              {/* Special Background Highlight */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/10 via-orange-500/15 to-yellow-500/10 rounded-2xl border border-yellow-400/30 shadow-2xl shadow-yellow-500/20"></div>
              
              <label className="block text-sm font-bold mb-4 text-white flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30 border-2 border-yellow-400/50">
                  <span className="text-sm font-black text-white">3</span>
                </div>
                <div>
                  <div className="text-white text-base font-bold">Price (cents)</div>
                  <div className="text-yellow-300 text-xs font-medium">Billing Amount</div>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                </div>
              </label>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="relative flex-1">
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    value={newPlan.price} 
                    onChange={handleNewPlanChange} 
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-3 border-yellow-400/80 rounded-2xl px-6 py-5 text-white text-lg font-semibold placeholder-gray-300 focus:border-yellow-400 focus:ring-6 focus:ring-yellow-400/30 transition-all duration-500 shadow-2xl hover:shadow-yellow-500/25 group-hover:border-yellow-400 group-hover:scale-[1.02] backdrop-blur-sm" 
                    placeholder="Price in cents (e.g., 1999 = $19.99)" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Helper Text */}
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-xl border border-yellow-400/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-yellow-200 text-sm font-semibold">Monthly price in cents (1999 = $19.99)</div>
                      <div className="text-yellow-300/70 text-xs mt-1">Enter the price in cents for monthly billing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 group relative h-full flex flex-col">
              {/* Special Background Highlight */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 via-violet-500/15 to-purple-500/10 rounded-2xl border border-purple-400/30 shadow-2xl shadow-purple-500/20"></div>
              
              <label className="block text-sm font-bold mb-4 text-white flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 border-2 border-purple-400/50">
                  <span className="text-sm font-black text-white">4</span>
                </div>
                <div>
                  <div className="text-white text-base font-bold">Stripe Price ID</div>
                  <div className="text-purple-300 text-xs font-medium">Payment Integration</div>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                </div>
              </label>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="relative flex-1">
                  <input 
                    name="stripePriceId" 
                    value={newPlan.stripePriceId} 
                    onChange={handleNewPlanChange} 
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-3 border-purple-400/80 rounded-2xl px-6 py-5 text-white text-lg font-semibold placeholder-gray-300 focus:border-purple-400 focus:ring-6 focus:ring-purple-400/30 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 group-hover:border-purple-400 group-hover:scale-[1.02] backdrop-blur-sm" 
                    placeholder="Stripe price ID (e.g., price_1234567890)" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Helper Text */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-xl border border-purple-400/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-purple-200 text-sm font-semibold">Optional: Link to Stripe pricing</div>
                      <div className="text-purple-300/70 text-xs mt-1">Connect with Stripe for payment processing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 group relative h-full flex flex-col">
              {/* Special Background Highlight */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-blue-500/15 to-indigo-500/10 rounded-2xl border border-indigo-400/30 shadow-2xl shadow-indigo-500/20"></div>
              
              <label className="block text-sm font-bold mb-4 text-white flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30 border-2 border-indigo-400/50">
                  <span className="text-sm font-black text-white">5</span>
                </div>
                <div>
                  <div className="text-white text-base font-bold">Description</div>
                  <div className="text-indigo-300 text-xs font-medium">Plan Details</div>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50"></div>
                </div>
              </label>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="relative flex-1">
                  <input 
                    name="description" 
                    value={newPlan.description} 
                    onChange={handleNewPlanChange} 
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-3 border-indigo-400/80 rounded-2xl px-6 py-5 text-white text-lg font-semibold placeholder-gray-300 focus:border-indigo-400 focus:ring-6 focus:ring-indigo-400/30 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/25 group-hover:border-indigo-400 group-hover:scale-[1.02] backdrop-blur-sm" 
                    placeholder="Brief description of plan features" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Helper Text */}
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 rounded-xl border border-indigo-400/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-indigo-200 text-sm font-semibold">Optional: Describe what this plan includes</div>
                      <div className="text-indigo-300/70 text-xs mt-1">Provide details about plan features and benefits</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={addLoading} 
                className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group text-sm sm:text-base"
              >
                {addLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Creating Plan...</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Create New Plan</span>
                    <span className="sm:hidden">Create Plan</span>
                  </>
                )}
              </button>
            </div>
        </div>
          </form>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden rounded-xl sm:rounded-2xl border border-slate-600/30 shadow-xl">
          <table className="min-w-full divide-y divide-slate-600/30">
            <thead className="bg-gradient-to-r from-slate-700/60 to-slate-600/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Plan Name
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Email Limit
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Monthly Price
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800/20 divide-y divide-slate-600/30">
              {plans.map((plan, index) => (
                <tr key={plan.name} className="hover:bg-slate-700/30 transition-all duration-300 group">
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm sm:text-base capitalize">{plan.name}</div>
                        <div className="text-slate-400 text-xs">Subscription Plan</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={planEdits[plan.name] !== undefined ? planEdits[plan.name] : plan.emailLimit}
                            onChange={e => handlePlanEdit(plan.name, e.target.value)}
                            className="w-full bg-slate-800/70 border-2 border-slate-500/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm font-medium focus:border-green-400/80 focus:ring-4 focus:ring-green-400/20 transition-all duration-300 shadow-lg hover:shadow-green-500/10"
                            placeholder="Enter email limit"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 sm:mt-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-slate-400 text-xs font-medium">Maximum emails per month</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="text-green-400 font-bold text-sm sm:text-lg">
                          ${plan.price ? (plan.price / 100).toFixed(2) : '0.00'}
                        </div>
                        <div className="text-slate-400 text-xs">per month</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleSavePlan(plan.name)}
                        disabled={saving[plan.name]}
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-blue-500/20 group"
                      >
                        {saving[plan.name] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-400"></div>
                            <span className="hidden sm:inline">Saving...</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="hidden sm:inline">Save</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemovePlan(plan.name)}
                        disabled={removing[plan.name]}
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-red-500/20 group"
                      >
                        {removing[plan.name] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-400"></div>
                            <span className="hidden sm:inline">Removing...</span>
                            <span className="sm:hidden">Del</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            <span className="hidden sm:inline">Remove</span>
                            <span className="sm:hidden">×</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {plans.map((plan, index) => (
            <div key={plan.name} className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 sm:p-6 hover:bg-slate-700/30 transition-colors duration-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                    <span className="text-white text-sm sm:text-base font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-white capitalize">{plan.name}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Subscription Plan</div>
                  </div>
                </div>
              </div>

              {/* Email Limit */}
              <div className="mb-4">
                <div className="text-xs sm:text-sm text-slate-400 mb-2">Email Limit</div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={planEdits[plan.name] !== undefined ? planEdits[plan.name] : plan.emailLimit}
                    onChange={e => handlePlanEdit(plan.name, e.target.value)}
                    className="w-full bg-slate-800/70 border-2 border-slate-500/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm font-medium focus:border-green-400/80 focus:ring-4 focus:ring-green-400/20 transition-all duration-300 shadow-lg hover:shadow-green-500/10"
                    placeholder="Enter email limit"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-slate-400 text-xs font-medium">Maximum emails per month</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-xs sm:text-sm text-slate-400 mb-2">Monthly Price</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold text-lg">
                      ${plan.price ? (plan.price / 100).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-slate-400 text-xs">per month</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => handleSavePlan(plan.name)}
                  disabled={saving[plan.name]}
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-blue-500/20 group"
                >
                  {saving[plan.name] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRemovePlan(plan.name)}
                  disabled={removing[plan.name]}
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg sm:rounded-xl disabled:opacity-50 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-red-500/20 group"
                >
                  {removing[plan.name] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      <span>Remove</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
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
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
        buttonText={errorModal.action ? "Confirm" : "OK"}
        details={errorModal.details}
        onButtonClick={errorModal.action}
      />
      
      {/* Success Modal */}
      <ErrorModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        type="success"
        buttonText="Awesome!"
        details={successModal.details}
        onButtonClick={successModal.action}
      />
    </div>
  );
}
