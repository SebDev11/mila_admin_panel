import React from 'react';

/**
 * Unified Loading Spinner Component
 * Provides consistent loading animations across the entire application
 */

// Size variants
const SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

// Color variants
const COLORS = {
  primary: 'border-blue-500',
  secondary: 'border-purple-500',
  success: 'border-green-500',
  danger: 'border-red-500',
  warning: 'border-yellow-500',
  white: 'border-white',
  gray: 'border-gray-500',
};

/**
 * Simple spinner (border style)
 */
export function Spinner({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) {
  const sizeClass = SIZES[size] || SIZES.md;
  const colorClass = COLORS[color] || COLORS.primary;
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 ${colorClass} border-t-transparent ${sizeClass} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading screen
 */
export function LoadingScreen({ 
  message = 'Loading...', 
  size = 'xl',
  color = 'primary' 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="text-center p-8">
        <Spinner size={size} color={color} className="mx-auto mb-4" />
        <p className="text-blue-200 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Card/Section loading state
 */
export function LoadingCard({ 
  message = 'Loading...', 
  size = 'lg',
  color = 'primary',
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Spinner size={size} color={color} className="mb-4" />
      <p className="text-blue-200 text-base font-medium">{message}</p>
    </div>
  );
}

/**
 * Inline spinner (for buttons)
 */
export function InlineSpinner({ 
  size = 'sm', 
  color = 'white',
  className = '' 
}) {
  return (
    <Spinner 
      size={size} 
      color={color} 
      className={`inline-block ${className}`}
    />
  );
}

/**
 * Button with loading state
 */
export function LoadingButton({ 
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className = '',
  spinnerSize = 'sm',
  spinnerColor = 'white',
  ...props 
}) {
  return (
    <button
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <InlineSpinner size={spinnerSize} color={spinnerColor} />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Overlay spinner (for modals, overlays)
 */
export function LoadingOverlay({ 
  visible = false, 
  message = 'Processing...', 
  size = 'xl',
  blur = true 
}) {
  if (!visible) return null;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${blur ? 'backdrop-blur-sm' : ''}`}>
      <div className="bg-slate-800/90 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <Spinner size={size} color="primary" className="mx-auto mb-4" />
        <p className="text-white text-lg font-medium text-center">{message}</p>
      </div>
    </div>
  );
}

/**
 * Dots spinner (alternative style)
 */
export function DotsSpinner({ color = 'blue', size = 'md' }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  const dotColor = `bg-${color}-500`;
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

/**
 * Pulse spinner (circle that pulses)
 */
export function PulseSpinner({ color = 'primary', size = 'md' }) {
  const sizeClass = SIZES[size] || SIZES.md;
  const colorClass = COLORS[color]?.replace('border-', 'bg-') || 'bg-blue-500';
  
  return (
    <div className="relative flex items-center justify-center">
      <div className={`${sizeClass} ${colorClass} rounded-full opacity-75 animate-ping absolute`}></div>
      <div className={`${sizeClass} ${colorClass} rounded-full`}></div>
    </div>
  );
}

export default Spinner;

