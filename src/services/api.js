import axios from "axios";

export const api = axios.create({
  baseURL: "https://adminapi.maplemindlabs.com/api", // Change if needed
  // baseURL: "http://localhost:5000/api", // Main backend API
});

// Auth API calls
export const login = (email, password) => api.post("/auth/login", { email, password });
export const register = (userData) => api.post("/auth/register", userData);
export const getProfile = () => api.get("/auth/me");

// User management API calls
export const fetchUsers = () => api.get("/users");
export const fetchUserById = (id) => api.get(`/users/${id}`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const updateUserRole = (id, role) => api.patch(`/users/${id}`, { role });
export const restrictUser = (id) => api.patch(`/users/${id}/restrict`);
export const suspendUser = (id) => api.patch(`/users/${id}/suspend`);
export const activateUser = (id) => api.patch(`/users/${id}/activate`);

// Campaign API calls
export const fetchCampaigns = () => api.get("/campaigns");
export const fetchCampaignById = (id) => api.get(`/campaigns/${id}`);
export const fetchCampaignStats = (id) => api.get(`/campaigns/${id}/stats`);
export const fetchCampaignOverview = () => api.get("/campaigns/stats/overview");
export const pauseCampaign = (id) => api.patch(`/campaigns/${id}/pause`);
export const resumeCampaign = (id) => api.patch(`/campaigns/${id}/resume`);
export const stopCampaign = (id) => api.patch(`/campaigns/${id}/stop`);

// Stats API calls
export const fetchStats = () => api.get("/stats");
export const fetchWeeklyEngagement = () => api.get("/stats/weekly-engagement");
export const fetchWeeklyEngagementBreakdown = () => api.get("/stats/weekly-engagement-breakdown");
export const fetchUserStats = (userId, period) => api.get(`/stats/user/${userId}?period=${period}`);

// Billing API calls
export const fetchBilling = () => api.get("/billing");
