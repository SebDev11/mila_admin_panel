import { useCallback, useState } from "react";
import { toast } from 'react-hot-toast';
import { api } from "../../services/api";
import { API_ENDPOINTS, BUTTON_CLASSES, ICONS, SPINNER_SVG } from './constants';
import { ConfirmationModal } from './ConfirmationModal';

export function PlanRow({ 
  plan, 
  index, 
  planEdits, 
  saving, 
  removing, 
  onPlanEdit, 
  onPlanSaved, 
  onPlanRemoved 
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleSavePlan = useCallback(async (planName) => {
    onPlanSaved(planName, true);
    try {
      const emailLimit = Number(planEdits[planName]);
      await api.patch(`${API_ENDPOINTS.plan}/${planName}`, { emailLimit });
      
      toast.success(`Plan "${planName}" updated successfully!`);
      onPlanSaved(planName, false, true); // Refresh data
    } catch (err) {
      toast.error("Failed to update plan");
    } finally {
      onPlanSaved(planName, false);
    }
  }, [planEdits, onPlanSaved]);

  const handleRemovePlan = useCallback(async (planName) => {
    onPlanRemoved(planName, true);
    try {
      await api.delete(`${API_ENDPOINTS.plan}/${planName}`);
      toast.success(`Plan "${planName}" removed successfully.`);
      onPlanRemoved(planName, false, true); // Refresh data
    } catch (err) {
      toast.error('Sorry, failed to remove plan.');
    } finally {
      onPlanRemoved(planName, false);
    }
  }, [onPlanRemoved]);

  const handleDeleteConfirm = useCallback(() => {
    setShowDeleteModal(false);
    handleRemovePlan(plan.name);
  }, [handleRemovePlan, plan.name]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  return (
    <tr key={plan.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            {ICONS.check}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 capitalize">{plan.name}</div>
            <div className="text-sm text-gray-500">Subscription Plan</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="number"
            min="0"
            value={planEdits[plan.name] !== undefined ? planEdits[plan.name] : plan.emailLimit}
            onChange={e => onPlanEdit(plan.name, e.target.value)}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
            placeholder="Enter email limit"
            title="Number of emails allowed per month"
          />
          <div className="ml-2 text-xs text-gray-500">emails/month</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-900">
            ${plan.price ? (plan.price / 100).toFixed(2) : '0.00'}
          </span>
          <span className="ml-1 text-sm text-gray-500">/month</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSavePlan(plan.name)}
            disabled={saving[plan.name]}
            className={`${BUTTON_CLASSES} bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving[plan.name] ? (
              <>
                {SPINNER_SVG}
                Saving...
              </>
            ) : (
              <>
                {ICONS.save}
                Save
              </>
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={removing[plan.name]}
            className={`${BUTTON_CLASSES} bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {removing[plan.name] ? (
              <>
                {SPINNER_SVG}
                Removing...
              </>
            ) : (
              <>
                {ICONS.delete}
                Remove
              </>
            )}
          </button>
        </div>
      </td>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        message={`Are you sure you want to remove the plan "${plan.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </tr>
  );
}
