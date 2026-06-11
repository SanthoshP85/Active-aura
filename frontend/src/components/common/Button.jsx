/**
 * Button Component
 * Reusable button component
 */

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    success: "bg-success-500 text-white hover:bg-success-600",
    danger: "bg-danger-500 text-white hover:bg-danger-600",
    warning: "bg-warning-500 text-white hover:bg-warning-600",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
    ghost: "text-primary-600 hover:bg-primary-50",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {isLoading && <div className="animate-spin">⏳</div>}
      {children}
    </button>
  );
};

export default Button;
