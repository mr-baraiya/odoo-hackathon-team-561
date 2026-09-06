import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Percent, 
  MessageSquare, 
  Users, 
  Building, 
  GitPullRequest, 
  Truck, 
  BarChart3, 
  Bell, 
  Shield, 
  User
} from 'lucide-react';

export default function SalesManagerSidebar({ pendingApprovalsCount = 0, unreadNotifsCount = 0 }) {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', path: '/sales-manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', path: '/sales-manager/approvals', label: 'Quotation Approvals', icon: ShieldCheck, badge: pendingApprovalsCount },
    { id: 'discounts', path: '/sales-manager/discounts', label: 'Discount Governance', icon: Percent },
    { id: 'negotiations', path: '/sales-manager/negotiations', label: 'Customer Negotiations', icon: MessageSquare },
    { id: 'team', path: '/sales-manager/team', label: 'Sales Team', icon: Users },
    { id: 'customers', path: '/sales-manager/customers', label: 'Customer Accounts', icon: Building },
    { id: 'pipeline', path: '/sales-manager/pipeline', label: 'Deal Pipeline', icon: GitPullRequest },
    { id: 'fulfillment', path: '/sales-manager/fulfillment', label: 'Order Fulfillment', icon: Truck },
    { id: 'analytics', path: '/sales-manager/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', path: '/sales-manager/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount }
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 min-h-screen flex flex-col justify-between border-r border-slate-200 shrink-0 sticky top-0 shadow-xs">
      <div>
        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Operations & Control
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path) || 
                             (item.id === 'dashboard' && (location.pathname === '/sales-manager' || location.pathname === '/sales-manager/' || location.pathname === '/sales-manager/overview'));
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
