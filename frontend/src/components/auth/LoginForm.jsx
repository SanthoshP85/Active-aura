/**
 * LoginForm Component
 * User login form
 */

import { useState } from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import { validateEmail, validatePhone } from "../../utils/validators";

export const LoginForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.emailOrPhone) {
      errors.emailOrPhone = "Email or phone is required";
    } else if (
      !validateEmail(formData.emailOrPhone) &&
      !validatePhone(formData.emailOrPhone)
    ) {
      errors.emailOrPhone = "Invalid email or phone format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert
          type="danger"
          title="Login Failed"
          message={error}
          showClose={false}
        />
      )}

      <Input
        label="Email or Phone"
        name="emailOrPhone"
        placeholder="your@email.com or +1234567890"
        value={formData.emailOrPhone}
        onChange={handleChange}
        error={formErrors.emailOrPhone}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
};

export default LoginForm;
