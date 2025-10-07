import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { showError, showSuccess } from '../utils/errorHandler';

// Simple hook for user management operations
export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async (apiCall, successMessage) => {
    setLoading(true);
    try {
      const response = await apiCall();
      if (successMessage) {
        showSuccess(successMessage);
      }
      return { success: true, data: response.data };
    } catch (error) {
      showError(error, 'Operation failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const restrictUser = useCallback(async (userId) => {
    return makeRequest(
      () => api.patch(`/users/${userId}/restrict`),
      'User restricted successfully'
    );
  }, [makeRequest]);

  const suspendUser = useCallback(async (userId) => {
    return makeRequest(
      () => api.patch(`/users/${userId}/suspend`),
      'User suspended successfully'
    );
  }, [makeRequest]);

  const activateUser = useCallback(async (userId) => {
    return makeRequest(
      () => api.patch(`/users/${userId}/activate`),
      'User activated successfully'
    );
  }, [makeRequest]);

  const deleteUser = useCallback(async (userId) => {
    return makeRequest(
      () => api.delete(`/users/${userId}`),
      'User deleted successfully'
    );
  }, [makeRequest]);

  const updateUserRole = useCallback(async (userId, role) => {
    return makeRequest(
      () => api.patch(`/users/${userId}`, { role }),
      'User role updated successfully'
    );
  }, [makeRequest]);

  return {
    loading,
    restrictUser,
    suspendUser,
    activateUser,
    deleteUser,
    updateUserRole
  };
};
