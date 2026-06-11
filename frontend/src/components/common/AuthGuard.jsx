/**
 * AuthGuard Component
 * Protected route wrapper with Layout
 */

import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { Layout } from "./Layout";

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useAuth();

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default AuthGuard;
