import React from 'react';
import {
  Users,
  Building2,
  Package,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardOverviewTab({
  usersCount,
  customersCount,
  productsCount,
  categoriesCount,
  healthAlertsCount,
  initialQuotations,
  auditLogs,
  setActiveTab,
  dashboardSummary,
}) {
  const displayUsers = dashboardSummary?.totalUsers ?? usersCount;
  const displayCustomers = dashboardSummary?.totalCustomers ?? customersCount;
  const displayProducts = dashboardSummary?.totalProducts ?? productsCount;
  const displayQuotations = dashboardSummary?.totalQuotations ?? (initialQuotations ? initialQuotations.length : 4);
  const displayRevenue = dashboardSummary?.totalRevenue ?? 128500;
  const displayPendingApprovals = dashboardSummary?.pendingApprovalsCount ?? 1;
  const displayHealthAlerts = dashboardSummary?.healthAlertsCount ?? healthAlertsCount ?? 1;
  const displayStalledDeals = dashboardSummary?.stalledDealsCount ?? 1;

  return (
    <div className="space-y-6">
      {/* 8 Primary Metric Cards Grid with Lucide Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{displayUsers}</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">Active DB Accounts</span>
        </div>

        {/* 2. Total Customers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{displayCustomers}</div>
          <span className="text-[11px] font-semibold text-indigo-600 mt-1 inline-block">Enterprise Accounts</span>
        </div>

        {/* 3. Total Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{displayProducts}</div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 inline-block">{categoriesCount || 3} Categories</span>
        </div>

        {/* 4. Total Quotations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Quotations</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{displayQuotations}</div>
          <span className="text-[11px] font-semibold text-cyan-700 mt-1 inline-block">Active Pipeline</span>
        </div>

        {/* 5. Revenue Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Revenue Overview</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">${Number(displayRevenue).toLocaleString()}</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Confirmed Pipeline
          </span>
        </div>

        {/* 6. Pending Approvals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{displayPendingApprovals}</div>
          <span className="text-[11px] font-semibold text-amber-600 mt-1 inline-block">Sign-off Required</span>
        </div>

        {/* 7. Deal Health Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Deal Health Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{displayHealthAlerts}</div>
          <span className="text-[11px] font-semibold text-rose-600 mt-1 inline-block">Requires Attention</span>
        </div>

        {/* 8. Stalled Deals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-orange-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stalled Deals</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-600">{displayStalledDeals}</div>
          <span className="text-[11px] font-semibold text-orange-600 mt-1 inline-block">Inactive &gt; 7 Days</span>
        </div>
      </div>

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Quotations Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Quotation Workflow</h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(initialQuotations || []).slice(0, 4).map((q) => (
              <div key={q.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold font-mono text-indigo-700">{q.quote_number}</div>
                  <div className="text-slate-600 font-medium">{q.customer_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">${Number(q.total_amount || 0).toLocaleString()}</div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Audit Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">System Audit Stream</h3>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(auditLogs || []).slice(0, 4).map((log) => (
              <div key={log.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{log.actor}</span>
                  <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-mono text-indigo-600 font-semibold">{log.action}</span>
                  <span className="text-slate-600 truncate max-w-[180px]">{log.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
