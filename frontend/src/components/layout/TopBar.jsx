import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quotations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Role display label
  const getRoleTag = (role) => {
    switch (role) {
      case "admin":
        return "ADMIN";
      case "manager":
        return "MANAGER";
      case "finance":
        return "FINANCE";
      case "customer":
        return "CUSTOMER";
      case "rep":
      default:
        return "SALES";
    }
  };

  const getRoleLabel = (role) => getRoleTag(role);

  const dashboardPath =
    user?.role === "customer"
      ? "/customer/portal"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : user?.role === "manager"
          ? "/manager/dashboard"
          : user?.role === "finance"
            ? "/finance/dashboard"
            : "/rep/dashboard";

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "finance":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "customer":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "rep":
      default:
        return "bg-[#F0F7FA] text-[#2D6B8F] border-[#2D6B8F]/20";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-bordercolor z-40 px-4 flex items-center justify-between shadow-xs">
      {/* Brand Logo Left */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2D6B8F] text-white flex items-center justify-center font-black text-xs shadow-xs">
            360
          </div>
          <span className="text-[#1A1D23] font-bold">DealFlow</span>
          <span className="text-[#2D6B8F] font-black">360</span>
        </Link>
      </div>

      {/* Search Center */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-textsub absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotations, customers, orders, invoices..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-textmain bg-hoverbg border border-bordercolor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
      </form>

      {/* Right Icons & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-textsub hover:text-textmain hover:bg-hoverbg rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-bordercolor rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-bordercolor flex items-center justify-between">
                <span className="font-semibold text-xs text-textmain">
                  Notifications
                </span>
                <span className="text-[10px] text-accent font-medium">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-bordercolor max-h-64 overflow-y-auto">
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">
                    Quote Q-1042 Pending Approval
                  </p>
                  <p className="text-[11px] text-textsub mt-0.5">
                    High risk flag: Service discount 19% over threshold
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    2 mins ago
                  </span>
                </div>
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">
                    Counter offer from ABC Company
                  </p>
                  <p className="text-[11px] text-textsub mt-0.5">
                    Requested 15% discount on Quote Q-1045
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    1 hour ago
                  </span>
                </div>
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">
                    Order #ORD-221 Shipped
                  </p>
                  <p className="text-[11px] text-textsub mt-0.5">
                    East Depot split dispatch complete
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    3 hours ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-hoverbg rounded-lg transition-colors border border-transparent hover:border-bordercolor"
          >
            <div className="w-8 h-8 rounded-full bg-[#2D6B8F] text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {user?.avatar || "US"}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-textmain flex items-center gap-1">
                {user?.name || "User"}{" "}
                <span className="text-textsub font-normal">•</span>{" "}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user?.role)}`}
                >
                  {getRoleTag(user?.role)}
                </span>
                <ChevronDown className="w-3 h-3 text-textsub ml-0.5" />
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-bordercolor rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-bordercolor">
                <p className="text-xs font-bold text-textmain">{user?.name}</p>
                <p className="text-xs text-textsub truncate">{user?.email}</p>
                <div className="mt-1">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(user?.role)}`}
                  >
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  to={dashboardPath}
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textmain hover:bg-hoverbg transition-colors"
                >
                  <BarChart3 className="w-4 h-4" /> My Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textmain hover:bg-hoverbg transition-colors"
                >
                  <Settings className="w-4 h-4" /> Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={() => setShowNotifications(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textmain hover:bg-hoverbg transition-colors"
                >
                  <Bell className="w-4 h-4" /> Notifications
                </button>
                <Link
                  to="/activity"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textmain hover:bg-hoverbg transition-colors"
                >
                  <Activity className="w-4 h-4" /> My Activity
                </Link>
                <div className="my-1 border-t border-bordercolor" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
