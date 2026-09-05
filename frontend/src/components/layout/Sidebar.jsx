import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Truck, 
  Repeat, 
  Receipt, 
  Activity, 
  BarChart3, 
  Package, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const { approvals } = useData();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Quotations', path: '/quotations', icon: FileText },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null },
    { label: 'Fulfillment', path: '/fulfillment', icon: Truck },
    { label: 'Subscription', path: '/subscriptions', icon: Repeat },
    { label: 'Invoices', path: '/invoices', icon: Receipt },
    { label: 'Deal Health', path: '/deal-health', icon: Activity },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Admin-only product catalog link
  if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'rep') {
    navItems.push({ label: 'Products', path: '/products', icon: Package });
  }

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-30 bg-surface border-r border-bordercolor transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'text-textsub hover:bg-hoverbg hover:text-textmain'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate flex items-center justify-between">
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute left-10 top-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-bordercolor flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-textsub hover:bg-hoverbg hover:text-textmain rounded-lg transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium">Collapse Menu</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
