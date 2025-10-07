import { PlanRow } from './PlanRow';

export function PlansTable({ 
  plans, 
  planEdits, 
  saving, 
  removing, 
  onPlanEdit, 
  onPlanSaved, 
  onPlanRemoved 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Existing Plans</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your subscription plans and email limits</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan, index) => (
              <PlanRow
                key={plan.name}
                plan={plan}
                index={index}
                planEdits={planEdits}
                saving={saving}
                removing={removing}
                onPlanEdit={onPlanEdit}
                onPlanSaved={onPlanSaved}
                onPlanRemoved={onPlanRemoved}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
