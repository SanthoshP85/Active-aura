/**
 * Input Component
 * Reusable form input
 */

export const Input = ({
  label,
  error,
  required = false,
  type = "text",
  placeholder,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? "border-danger-500 focus:ring-danger-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default Input;
