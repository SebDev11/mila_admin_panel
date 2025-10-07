// import { Input } from "@/components/ui/input";
// import { Select, SelectItem } from "@/components/ui/select";
import { Input } from "./ui/Input";
import {Select, SelectItem} from "./ui/Select"

export const TextInput = ({ label, helpText, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Input {...props} className="w-full" />
    {helpText && <div className="text-xs text-gray-500 mt-1">{helpText}</div>}
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);

export const RoleSelect = ({ value, onValueChange }) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="regular">Regular</SelectItem>
  </Select>
);

// Specialized input components with proper formatting
export const PlanNameInput = ({ value, onChange, error }) => (
  <TextInput
    label="Plan Name"
    value={value}
    onChange={onChange}
    placeholder="e.g. basic"
    helpText="Lowercase letters and numbers only, no spaces"
    error={error}
    title="Lowercase letters only, no spaces or special characters"
  />
);

export const EmailLimitInput = ({ value, onChange, error }) => (
  <TextInput
    label="Email Limit"
    type="number"
    min="0"
    value={value}
    onChange={onChange}
    placeholder="e.g. 1000"
    helpText="Number of emails allowed per month"
    error={error}
    title="Number of emails allowed per month"
  />
);

export const PriceInput = ({ value, onChange, error }) => (
  <TextInput
    label="Price"
    type="number"
    min="0"
    step="1"
    value={value}
    onChange={onChange}
    placeholder="e.g. 1999"
    helpText="Price in cents (1999 = $19.99)"
    error={error}
    title="Price in cents (1999 = $19.99)"
  />
);

export const StripePriceIdInput = ({ value, onChange, error }) => (
  <TextInput
    label="Stripe Price ID"
    value={value}
    onChange={onChange}
    placeholder="price_1234567890"
    helpText="Format: price_xxxxxxxxxx"
    error={error}
    title="Stripe price ID format: price_xxxxxxxxxx"
  />
);

export const DescriptionInput = ({ value, onChange, error }) => (
  <TextInput
    label="Description"
    value={value}
    onChange={onChange}
    placeholder="e.g. Basic plan for small teams"
    maxLength="100"
    helpText="Max 100 characters"
    error={error}
    title="Brief description of the plan (max 100 characters)"
  />
);
