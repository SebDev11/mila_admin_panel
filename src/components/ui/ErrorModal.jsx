import { useEffect } from "react";

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Error", 
  message, 
  buttonText = "OK",
  type = "error", // "error", "warning", "success", "info"
  details = "",
  onButtonClick = null,
  showButton = true
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (type) {
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          )
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
              </path>
            </svg>
          )
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          )
        };
      default: // info
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          )
        };
    }
  };

  const modalStyles = getModalStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg">
        {/* Header */}
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${modalStyles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
              <div className={modalStyles.iconColor}>
                {modalStyles.icon}
              </div>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
                {details && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 font-mono">
                      {details}
                    </p>
                  </div>
                )}
                {type === "info" && showButton === false && (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        {showButton && (
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${modalStyles.button}`}
              onClick={onButtonClick || onClose}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
