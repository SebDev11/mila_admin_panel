import { useState, useCallback } from "react";
import { Card } from "../ui/Card";
import { AddPlanForm } from './AddPlanForm';
import { PlansTable } from './PlansTable';
import { ICONS, INITIAL_PLAN_STATE } from './constants';

export function PlanManagement({ plans, onDataRefresh }) {
  const [planEdits, setPlanEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [newPlan, setNewPlan] = useState(INITIAL_PLAN_STATE);
  const [addLoading, setAddLoading] = useState(false);
  const [removing, setRemoving] = useState({});

  const handlePlanEdit = useCallback((planName, value) => {
    setPlanEdits(prev => ({ ...prev, [planName]: value }));
  }, []);

  const handlePlanSaved = useCallback((planName, isLoading, shouldRefresh = false) => {
    if (shouldRefresh) {
      setPlanEdits(prev => ({ ...prev, [planName]: undefined }));
      onDataRefresh();
    } else {
      setSaving(prev => ({ ...prev, [planName]: isLoading }));
    }
  }, [onDataRefresh]);

  const handlePlanRemoved = useCallback((planName, isLoading, shouldRefresh = false) => {
    if (shouldRefresh) {
      // Remove the plan from local state instead of refreshing entire page
      onDataRefresh(planName, 'remove');
    } else {
      setRemoving(prev => ({ ...prev, [planName]: isLoading }));
    }
  }, [onDataRefresh]);

  const handlePlanAdded = useCallback((newPlan) => {
    // Add the new plan to local state instead of refreshing entire page
    onDataRefresh(newPlan, 'add');
  }, [onDataRefresh]);

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
          {ICONS.dollar}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white-900">Plan Management</h2>
          <p className="text-white-600 mt-1">Create and manage subscription plans with email limits</p>
        </div>
      </div>
      
      <div className="mb-8">
        <AddPlanForm
          newPlan={newPlan}
          setNewPlan={setNewPlan}
          addLoading={addLoading}
          setAddLoading={setAddLoading}
          onPlanAdded={handlePlanAdded}
        />
      </div>
      
      <PlansTable
        plans={plans}
        planEdits={planEdits}
        saving={saving}
        removing={removing}
        onPlanEdit={handlePlanEdit}
        onPlanSaved={handlePlanSaved}
        onPlanRemoved={handlePlanRemoved}
      />
    </Card>
  );
}
