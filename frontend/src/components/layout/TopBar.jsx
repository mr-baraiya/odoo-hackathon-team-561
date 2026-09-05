import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, User, LogOut, Shield, ChevronDown, Check, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SEED_USERS } from '../../utils/constants';

const TopBar = () => {
  const { user, logout, loginAsSeedUser } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleRoleSwitch = (role) => {
    loginAsSeedUser(role);
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quotations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-bordercolor z-40 px-4 flex items-center justify-between">
      {/* Brand Logo Left */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary text-accent flex items-center justify-center font-black">
            360
          </div>
          <span className="text-primary font-bold">DealFlow</span>
          <span className="text-accent font-black">360</span>
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
        {/* Customer Portal Link */}
        <Link 
          to="/portal/Q-1042" 
          target="_blank" 
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent-light px-2.5 py-1.5 rounded-lg border border-accent/20 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" /> Customer Portal Demo
        </Link>

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
                <span className="font-semibold text-xs text-textmain">Notifications</span>
                <span className="text-[10px] text-accent font-medium">3 New</span>
              </div>
              <div className="divide-y divide-bordercolor max-h-64 overflow-y-auto">
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">Quote Q-1042 Pending Approval</p>
                  <p className="text-[11px] text-textsub mt-0.5">High risk flag: Service discount 19% over threshold</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">2 mins ago</span>
                </div>
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">Counter offer from ABC Company</p>
                  <p className="text-[11px] text-textsub mt-0.5">Requested 15% discount on Quote Q-1045</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">1 hour ago</span>
                </div>
                <div className="p-3 text-xs hover:bg-hoverbg">
                  <p className="font-medium text-textmain">Order #ORD-221 Shipped</p>
                  <p className="text-[11px] text-textsub mt-0.5">East Depot split dispatch complete</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">3 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-hoverbg rounded-lg transition-colors border border-transparent hover:border-bordercolor"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {user?.avatar || 'US'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-textmain flex items-center gap-1">
                {user?.name || 'John Doe'}
                <ChevronDown className="w-3 h-3 text-textsub" />
              </div>
              <div className="text-[10px] uppercase font-bold text-accent tracking-wider">
                {user?.role || 'Rep'}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-bordercolor rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-bordercolor">
                <p className="text-xs font-bold text-textmain">{user?.name}</p>
                <p className="text-xs text-textsub">{user?.email}</p>
              </div>

              {/* Seed Role Quick Switcher */}
              <div className="py-2 px-2">
                <span className="text-[10px] uppercase font-bold text-textsub px-2 block mb-1">
                  Switch Active Role (Demo)
                </span>
                {SEED_USERS.map((seed) => (
                  <button
                    key={seed.role}
                    onClick={() => handleRoleSwitch(seed.role)}
                    className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      user?.role === seed.role ? 'bg-primary/10 text-primary font-semibold' : 'text-textsub hover:bg-hoverbg hover:text-textmain'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-secondary" />
                      {seed.name} ({seed.role})
                    </span>
                    {user?.role === seed.role && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-bordercolor pt-1 mt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
