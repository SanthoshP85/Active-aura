/**
 * Alert Component
 * Reusable alert/notification
 */

import { X } from "lucide-react";

export const Alert = ({
  type = "info",
  title,
  message,
  onClose,
  showClose = true,
  className = "",
}) => {
  const typeClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-success-50 border-success-200 text-success-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    danger: "bg-danger-50 border-danger-200 text-danger-800",
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-start justify-between ${typeClasses[type]} ${className}`}
    >
      <div>
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
