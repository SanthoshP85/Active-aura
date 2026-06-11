/**
 * SignupForm Component
 * User registration form
 */

import { useState } from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateAge,
  validateWeight,
  validateHeight,
} from "../../utils/validators";
import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  GENDER_OPTIONS,
} from "../../utils/constants";

export const SignupForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "male",
    height: "",
    currentWeight: "",
    goalWeight: "",
    activityLevel: "moderate",
    fitnessGoals: [],
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        fitnessGoals: checked
          ? [...prev.fitnessGoals, value]
          : prev.fitnessGoals.filter((g) => g !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!validateEmail(formData.email))
      errors.email = "Invalid email format";

    if (!formData.phone) errors.phone = "Phone is required";
    else if (!validatePhone(formData.phone))
      errors.phone = "Invalid phone format";

    if (!formData.password) errors.password = "Password is required";
    else if (!validatePassword(formData.password).isValid)
      errors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (!formData.age) errors.age = "Age is required";
    else if (!validateAge(formData.age))
      errors.age = "Age must be between 13 and 120";

    if (!formData.height) errors.height = "Height is required";
    else if (!validateHeight(formData.height))
      errors.height = "Height must be between 100 and 250 cm";

    if (!formData.currentWeight)
      errors.currentWeight = "Current weight is required";
    else if (!validateWeight(formData.currentWeight))
      errors.currentWeight = "Weight must be between 30 and 500 kg";

    if (!formData.goalWeight) errors.goalWeight = "Goal weight is required";
    else if (!validateWeight(formData.goalWeight))
      errors.goalWeight = "Weight must be between 30 and 500 kg";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[600px] overflow-y-auto"
    >
      {error && (
        <Alert
          type="danger"
          title="Signup Failed"
          message={error}
          showClose={false}
        />
      )}

      <Input
        label="Full Name"
        name="fullName"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={handleChange}
        error={formErrors.fullName}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        required
      />

      <Input
        label="Phone"
        name="phone"
        type="tel"
        placeholder="+1234567890"
        value={formData.phone}
        onChange={handleChange}
        error={formErrors.phone}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          error={formErrors.age}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Gender<span className="text-danger-500 ml-1">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Height (cm)"
          name="height"
          type="number"
          value={formData.height}
          onChange={handleChange}
          error={formErrors.height}
          required
        />

        <Input
          label="Current Weight (kg)"
          name="currentWeight"
          type="number"
          step="0.1"
          value={formData.currentWeight}
          onChange={handleChange}
          error={formErrors.currentWeight}
          required
        />
      </div>

      <Input
        label="Goal Weight (kg)"
        name="goalWeight"
        type="number"
        step="0.1"
        value={formData.goalWeight}
        onChange={handleChange}
        error={formErrors.goalWeight}
        required
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Activity Level<span className="text-danger-500 ml-1">*</span>
        </label>
        <select
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ACTIVITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password (min 6 chars)"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        required
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={formErrors.confirmPassword}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default SignupForm;
