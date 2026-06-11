/**
 * Layout Component
 * Common layout wrapper for authenticated pages
 * Includes header and sidebar navigation
 */

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Fixed Header */}
      <Header />

      {/* Sidebar and Main Content - with pt-16 to account for fixed header */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar - Handles its own mobile/desktop visibility */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
