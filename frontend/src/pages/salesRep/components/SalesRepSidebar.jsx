import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Users,
  Package,
  ShieldCheck,
  Truck,
  CreditCard,
  MessageSquare,
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
} from 'lucide-react';

export default function SalesRepSidebar({
  summary,
  quotationRequestsCount = 0,
  quotationsCount = 0,
  openNegCount = 0,
  customersCount = 0,
  pendingApprovalsCount = 0,
  healthAlertsCount = 0,
  activeTab,
  onTabSelect,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const location = useLocation();

  const navItems = [
    { id: 'overview', path: '/sales-rep/overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotations', path: '/sales-rep/quotations', label: 'Quotations Directory', icon: FileText, badge: openNegCount > 0 ? `${openNegCount} Action` : null, badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'approvals', path: '/sales-rep/approvals', label: 'Discount Approvals', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'communication', path: '/sales-rep/communication', label: 'Negotiations & Messaging', icon: MessageSquare },
    { id: 'customers', path: '/sales-rep/customers', label: 'Customer Accounts', icon: Users, badge: customersCount > 0 ? customersCount : null, badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'catalog', path: '/sales-rep/catalog', label: 'Catalog & Stock', icon: Package },
    { id: 'orders', path: '/sales-rep/orders', label: 'Orders & Fulfillment', icon: Truck },
    { id: 'invoices', path: '/sales-rep/invoices', label: 'Invoices & Payments', icon: CreditCard },
    { id: 'deal_health', path: '/sales-rep/deal_health', label: 'Deal Health', icon: Activity, badge: healthAlertsCount > 0 ? healthAlertsCount : null, badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
    { id: 'reports', path: '/sales-rep/reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'notifications', path: '/sales-rep/notifications', label: 'Notifications', icon: Bell },
  ];

  const content = (
    <div className="space-y-5 p-4">
      {/* Navigation Section */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Sales Rep Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMatch = location.pathname.startsWith(item.path) ||
                          (item.id === 'overview' && (location.pathname === '/sales-rep' || location.pathname === '/sales-rep/' || location.pathname === '/sales-rep/dashboard'));

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMatch
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                <Icon className={`w-4 h-4 shrink-0 ${isMatch ? 'text-white' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${isMatch ? 'bg-white/20 text-white border-white/30' : item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isMatch ? 'text-white' : 'text-slate-300'}`} />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white text-slate-900 border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 flex-col justify-between space-y-6 shrink-0 z-10 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Slide-Over Backdrop Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80%] bg-white text-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
