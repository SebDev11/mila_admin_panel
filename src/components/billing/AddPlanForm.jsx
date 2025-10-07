import { useCallback } from "react";
import { toast } from 'react-hot-toast';
import { api } from "../../services/api";
import { API_ENDPOINTS, INITIAL_PLAN_STATE, INPUT_CLASSES, ICONS } from './constants';
import { validatePlan, formatPlanInput } from './validation';

export function AddPlanForm({ newPlan, setNewPlan, addLoading, setAddLoading, onPlanAdded }) {
  const handleNewPlanChange = useCallback((e) => {
    const { name, value } = e.target;
    const formattedValue = formatPlanInput(name, value);
    setNewPlan(prev => ({ ...prev, [name]: formattedValue }));
  }, [setNewPlan]);

  const handleAddPlan = useCallback(async (e) => {
    e.preventDefault();
    setAddLoading(true);
    
    // Validate input
    const validationError = validatePlan(newPlan);
    if (validationError) {
      toast.error(validationError);
      setAddLoading(false);
      return;
    }
    
    try {
      const payload = {
        ...newPlan,
        emailLimit: Number(newPlan.emailLimit),
        price: newPlan.price ? Number(newPlan.price) : 0
      };

      const response = await api.post(API_ENDPOINTS.plan, payload);
      toast.success('Plan added successfully!');
      setNewPlan(INITIAL_PLAN_STATE);
      onPlanAdded(response.data);
    } catch (err) {
      console.log("This is simple error =>", err);
      toast.error('Sorry, failed to add plan. Please check your input and try again.');
    } finally {
      setAddLoading(false);
    }
  }, [newPlan, setNewPlan, setAddLoading, onPlanAdded]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          {ICONS.plus}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Add New Plan</h3>
      </div>
      
      <form onSubmit={handleAddPlan} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input 
              name="name" 
              value={newPlan.name} 
              onChange={handleNewPlanChange} 
              required 
              className={INPUT_CLASSES}
              placeholder="e.g. basic"
              title="Lowercase letters only, no spaces or special characters"
              autoComplete="off"
            />
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 
                      0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 
                      9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 
                      0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd">
                </path>
              </svg>
              Lowercase, no spaces
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Limit <span className="text-red-500">*</span>
            </label>
            <input 
              name="emailLimit" 
              type="number" 
              min="0" 
              value={newPlan.emailLimit} 
              onChange={handleNewPlanChange} 
              required 
              className={INPUT_CLASSES}
              placeholder="e.g. 1000"
              title="Number of emails allowed per month"
            />
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 
                      0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 
                      0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"> 
                </path>
              </svg>
              Emails per month
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input 
              name="price" 
              type="number" 
              min="0" 
              step="1"
              value={newPlan.price} 
              onChange={handleNewPlanChange} 
              className={INPUT_CLASSES}
              placeholder="e.g. 1999"
              title="Price in cents (1999 = $19.99)"
            />
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 
                      0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 
                      0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd">
                </path>
              </svg>
              Price in cents (1999 = $19.99)
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Stripe Price ID</label>
            <input 
              name="stripePriceId" 
              value={newPlan.stripePriceId} 
              onChange={handleNewPlanChange} 
              className={INPUT_CLASSES}
              placeholder="price_1234567890"
              title="Stripe price ID format: price_xxxxxxxxxx"
            />
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 
                      0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 
                      1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 
                      1 0 00-1-1H9z" clipRule="evenodd">
                </path>
              </svg>
              Format: price_xxxxxxxxxx
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input 
              name="description" 
              value={newPlan.description} 
              onChange={handleNewPlanChange} 
              className={INPUT_CLASSES}
              placeholder="e.g. Basic plan for small teams"
              maxLength="100"
              title="Brief description of the plan (max 100 characters)"
            />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" 
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 
                        0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 
                        001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd">
                  </path>
                </svg>
                Max 100 characters
              </div>
              <span className="text-gray-500">{newPlan.description.length}/100</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={addLoading} 
            className="flex items-center px-6 py-3 bg-gradient-to-r 
                      from-green-500 to-green-600 hover:from-green-600 
                      hover:to-green-700 text-white font-medium rounded-lg 
                      shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                      transition-all duration-200 disabled:opacity-50 
                      disabled:cursor-not-allowed disabled:transform-none"
          >
            {addLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Adding Plan...
              </>
            ) : (
              <>
                {ICONS.add}
                Add Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
