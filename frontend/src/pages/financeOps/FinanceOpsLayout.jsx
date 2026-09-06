import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import FinanceOpsSidebar from './components/FinanceOpsSidebar';

import apiClient from '../../services/apiClient';

export default function FinanceOpsLayout({ children }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance-ops/dashboard');
      const data = res?.data || res;
      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.warn('Finance ops data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const pendingApprovalsCount = dashboardData?.pending_finance_approvals_count || 0;

  // Clone children to inject dynamic onRefresh & dashboardData props only to custom React components
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      return React.cloneElement(child, {
        dashboardData,
        onRefresh: fetchFinanceData
      });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Light Theme Sidebar */}
      <FinanceOpsSidebar pendingApprovalsCount={pendingApprovalsCount} unreadNotifsCount={dashboardData?.alerts?.length || 0} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Metrics Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-16 z-10 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>Finance & Operations Control Center</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live DB
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time revenue, invoices, dual-approvals, fulfillment & payment reconciliation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick KPI Badges */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-500">Revenue:</span>
              <span className="font-extrabold text-slate-900">
                ${(dashboardData?.total_revenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-slate-500">Approvals:</span>
              <span className="font-extrabold text-slate-900">
                {pendingApprovalsCount}
              </span>
            </div>

            <button
              onClick={fetchFinanceData}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-medium text-xs flex items-center gap-1.5"
              title="Refresh Data from PostgreSQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Component */}
        <main className="p-6 flex-1 overflow-y-auto">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
}
