import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Truck, 
  Repeat, 
  Receipt, 
  BarChart3, 
  Bell,
  X
} from 'lucide-react';

export default function FinanceOpsSidebar({ pendingApprovalsCount = 0, unreadNotifsCount = 0, isOpenMobile = false, onCloseMobile }) {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', path: '/finance-ops/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', path: '/finance-ops/approvals', label: 'Finance Approvals', icon: ShieldCheck, badge: pendingApprovalsCount },
    { id: 'invoices', path: '/finance-ops/invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', path: '/finance-ops/payments', label: 'Payments', icon: CreditCard },
    { id: 'fulfillment', path: '/finance-ops/fulfillment', label: 'Fulfillment & Warehouse', icon: Truck },
    { id: 'subscriptions', path: '/finance-ops/subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'credit-notes', path: '/finance-ops/credit-notes', label: 'Credit Notes & Refunds', icon: Receipt },
    { id: 'reports', path: '/finance-ops/reports', label: 'Finance Reports', icon: BarChart3 },
    { id: 'notifications', path: '/finance-ops/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount }
  ];

  const content = (
    <div className="p-3 space-y-1">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mt-1">
          Financial Control & Billing
        </span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path) || 
                         (item.id === 'dashboard' && (location.pathname === '/finance-ops' || location.pathname === '/finance-ops/' || location.pathname === '/finance_ops'));
        
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                isActive ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white text-slate-800 h-[calc(100vh-4rem)] flex-col justify-between border-r border-slate-200 shrink-0 sticky top-16 shadow-xs overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Slide-Over Backdrop Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80%] bg-white text-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 pt-4">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
