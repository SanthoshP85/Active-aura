/**
 * ErrorBanner Component
 * Shows error messages at the top of the page with danger styling
 */

import { AlertCircle, X } from "lucide-react";
import { useUIStore } from "../../context/uiStore";

export const ErrorBanner = () => {
  const { error, hideError } = useUIStore();

  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-slideInDown">
      <div className="bg-red-50 border-b border-red-200 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="flex-1 text-red-800 font-medium text-sm">{error}</p>
            <button
              onClick={hideError}
              className="text-red-600 hover:text-red-800 transition-colors p-1"
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
