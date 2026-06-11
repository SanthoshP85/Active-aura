/**
 * Header Component
 * Main application header
 */

import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../context/uiStore";
import { Menu, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/app_logo.png";

export const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 w-full">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left - Logo and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-800 transition-colors md:hidden"
          >
            <Menu size={24} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={Logo} alt="ActiveAura Logo" className="w-36 h-14" />
          </Link>
        </div>

        {/* Right - User Menu */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={20} className="text-gray-600" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-danger-500"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
