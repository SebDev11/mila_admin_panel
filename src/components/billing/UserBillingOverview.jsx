import { useMemo } from "react";
import { Card } from "../ui/Card";
import DataTable from '../DataTable';
import { ICONS } from './constants';

export function UserBillingOverview({ billingData, loading, error }) {
  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    { key: "name", label: "User" },
    { key: "plan", label: "Plan", render: (row) => row.plan ? row.plan.charAt(0).toUpperCase() + row.plan.slice(1) : 'Free' },
    { key: "role", label: "Role", render: (row) => row.role || 'active' },
    { key: "emailLimit", label: "Email Limit", render: (row) => row.emailLimit ? row.emailLimit.toLocaleString() : 'Unlimited' },
    { key: "price", label: "Price", render: (row) => row.price ? `$${(row.price / 100).toFixed(2)}` : 'Free' },
    { key: "status", label: "Status" },
    { key: "expiry", label: "Expiry Date" }
  ], []);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">User Billing Overview</h2>
          <div className="text-center">Loading billing data...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">User Billing Overview</h2>
          <div className="text-red-400">Error: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          {ICONS.chart}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white-900">User Billing Overview</h2>
          <p className="text-white-600 mt-1">Monitor user subscriptions and billing information</p>
        </div>
      </div>
      <DataTable columns={columns} data={billingData} />
    </Card>
  );
}
