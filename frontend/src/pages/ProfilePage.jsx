/**
 * ProfilePage
 * User profile and settings
 */

import { useState } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { AlertCircle } from "lucide-react";

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { updateProfile, updatePassword, isLoading } = useUser();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentWeight: user?.currentWeight || "",
    goalWeight: user?.goalWeight || "",
    height: user?.height || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(formData);
      // Update auth context with new user data
      updateUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    try {
      await updatePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword,
      );
      setMessage({ type: "success", text: "Password updated successfully" });
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {message && (
          <Card
            className={`mb-6 flex items-center gap-3 ${
              message.type === "success"
                ? "bg-success-50 border border-success-200"
                : "bg-danger-50 border border-danger-200"
            }`}
          >
            <AlertCircle
              size={20}
              className={
                message.type === "success"
                  ? "text-success-500"
                  : "text-danger-500"
              }
            />
            <span
              className={
                message.type === "success"
                  ? "text-success-800"
                  : "text-danger-800"
              }
            >
              {message.text}
            </span>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "profile"
                ? "text-primary-600 border-primary-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "password"
                ? "text-primary-600 border-primary-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card title="Profile Information">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled
              />

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  step="0.1"
                  value={formData.currentWeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentWeight: e.target.value,
                    })
                  }
                />

                <Input
                  label="Goal Weight (kg)"
                  type="number"
                  step="0.1"
                  value={formData.goalWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, goalWeight: e.target.value })
                  }
                />
              </div>

              <Input
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />

              <Button type="submit" variant="primary" isLoading={isLoading}>
                Update Profile
              </Button>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <Card title="Change Password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                required
              />

              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <Button type="submit" variant="primary" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
