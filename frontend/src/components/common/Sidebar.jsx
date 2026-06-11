/**
 * Sidebar Component
 * Navigation sidebar
 */

import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../../context/uiStore";
import {
  BarChart3,
  Flame,
  Dumbbell,
  Target,
  Lightbulb,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Flame, label: "Calories", path: "/calories" },
  { icon: Dumbbell, label: "Activities", path: "/activities" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Lightbulb, label: "Insights", path: "/insights" },
  { icon: MessageCircle, label: "Chatbot", path: "/chatbot" },
  { icon: Settings, label: "Profile", path: "/profile" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Backdrop - Only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden top-16"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          left-0 md:left-auto
          top-16 md:top-auto
          h-[calc(100vh-64px)] md:h-full
          w-64
          bg-gray-900 md:bg-white
          text-white md:text-gray-800
          shadow-lg md:shadow-md
          overflow-y-auto
          transition-transform duration-300
          z-40 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Close button - Mobile only */}
        <div className="flex justify-end p-3 md:hidden">
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <nav className="p-4 pt-0 md:pt-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg 
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 md:text-gray-600 hover:bg-gray-800 md:hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
