import toast from 'react-hot-toast';

// Simple error handler for API calls
export const showError = (error, defaultMessage = 'An error occurred') => {
  console.error('Error:', error);
  
  let errorMessage = defaultMessage;
  
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 400) {
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(err => err.msg).join(', ');
      } else {
        errorMessage = data.message || 'Invalid input';
      }
    } else if (status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (status === 403) {
      if (data.message?.includes('suspended')) {
        errorMessage = 'Account is suspended';
      } else if (data.message?.includes('Admin privileges')) {
        errorMessage = 'Admin privileges required';
      } else {
        errorMessage = 'Access denied';
      }
    } else if (status === 404) {
      errorMessage = 'Not found';
    } else if (status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = data.message || defaultMessage;
    }
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  toast.error(errorMessage);
  return errorMessage;
};

// Simple success handler
export const showSuccess = (message) => {
  toast.success(message);
};
