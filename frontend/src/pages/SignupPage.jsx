/**
 * SignupPage
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SignupForm } from "../components/auth/SignupForm";

export const SignupPage = () => {
  const { signup, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      setFormError(null);
      await signup(data);
      navigate("/dashboard");
    } catch (err) {
      // Try to get detailed error message from backend
      const backendError = err.response?.data;

      let errorMessage = "Signup failed. Please try again.";

      // Check for validation errors
      if (backendError?.errors) {
        const firstError = Object.values(backendError.errors)[0];
        errorMessage = firstError || backendError.message || errorMessage;
      } else if (backendError?.message) {
        errorMessage = backendError.message;
      }

      setFormError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            🎯 ActiveAura
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Create your fitness account
          </p>

          <SignupForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={formError || error}
          />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
