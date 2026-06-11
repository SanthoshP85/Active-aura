/**
 * LoginPage
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "../components/auth/LoginForm";
import Logo from "../../src/assets/images/app_logo.png";

export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      setFormError(null);
      await login(data.emailOrPhone, data.password);
      navigate("/dashboard");
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="ActiveAura Logo" className="w-32 h-16" />
          </div>
          <p className="text-center text-gray-600 mb-8">
            Welcome back! Log in to your account
          </p>

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={formError || error}
          />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary-600 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
