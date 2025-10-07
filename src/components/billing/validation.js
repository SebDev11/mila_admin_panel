// Validation functions for plan data
export const validatePlan = (plan) => {
  if (!plan.name || !plan.emailLimit) {
    return 'Plan name and email limit are required.';
  }
  if (!/^[a-z0-9]+$/.test(plan.name)) {
    return 'Plan name must be lowercase letters and numbers only, no spaces.';
  }
  if (Number(plan.emailLimit) < 0) {
    return 'Email limit must be a positive number.';
  }
  if (plan.price && Number(plan.price) < 0) {
    return 'Price must be a positive number.';
  }
  if (plan.stripePriceId && !plan.stripePriceId.startsWith('price_')) {
    return 'Stripe Price ID must start with "price_".';
  }
  return null;
};

// Format input values
export const formatPlanInput = (name, value) => {
  if (name === 'name') {
    // Convert to lowercase and remove spaces
    return value.toLowerCase().replace(/\s+/g, '');
  } else if (name === 'stripePriceId' && value && !value.startsWith('price_')) {
    // Auto-format Stripe Price ID
    return value.startsWith('price') ? value : `price_${value}`;
  }
  return value;
};
