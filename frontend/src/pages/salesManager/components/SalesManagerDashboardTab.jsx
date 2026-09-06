import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function SalesManagerDashboardTab({ dashboardData, loading, onSelectTab }) {
  if (loading && !dashboardData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live team sales data from database...</span>
      </div>
    );
  }

  const data = dashboardData || {};
  const teamRevenue = Number(data.team_revenue || 0);
  const teamTarget = Number(data.team_target || 2500000);
  const quotaPct = data.revenue_achievement_pct || (teamTarget > 0 ? Math.round((teamRevenue / teamTarget) * 100) : 0);
  const activePipelineVal = Number(data.active_pipeline_value || 0);
  const activeQuotesCount = Number(data.active_quotations_count || 0);
  const pendingApprovalsCount = Number(data.pending_approvals_count || 0);
  const stalledDealsCount = Number(data.stalled_deals_count || 0);
  const wonDealsCount = Number(data.won_deals_count || 0);
  const wonDealsVal = Number(data.won_deals_value || 0);
  const lostDealsCount = Number(data.lost_deals_count || 0);
  const healthAlerts = data.deal_health_alerts || [];

  const totalClosed = wonDealsCount + lostDealsCount;
  const winRate = totalClosed > 0 ? Math.round((wonDealsCount / totalClosed) * 100) : 0;
  const avgDealSize = wonDealsCount > 0 ? Math.round(wonDealsVal / wonDealsCount) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Team Revenue</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{teamRevenue.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {quotaPct}% of Quota
              </span>
              <span className="text-xs text-slate-500">Target: ₹{teamTarget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Quotations</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{activeQuotesCount}</h3>
            <p className="text-xs text-slate-500 mt-2">
              Pipeline Value: <strong className="text-slate-700">₹{activePipelineVal.toLocaleString('en-IN')}</strong>
            </p>
          </div>
        </div>

        <div 
          onClick={() => onSelectTab && onSelectTab('approvals')}
          className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-amber-50/30 to-white shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pending Approvals</span>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-amber-950">{pendingApprovalsCount}</h3>
              <span className="text-xs font-medium text-amber-700">Requires Action</span>
            </div>
            <p className="text-xs text-amber-700/80 mt-2 underline group-hover:text-amber-900">
              Review pending discount requests →
            </p>
          </div>
        </div>

        <div 
          onClick={() => onSelectTab && onSelectTab('pipeline')}
          className="bg-white rounded-2xl p-5 border border-rose-200/80 bg-gradient-to-br from-rose-50/20 to-white shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">Stalled Deals</span>
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-rose-950">{stalledDealsCount}</h3>
              <span className="text-xs font-medium text-rose-700">&gt; 7 days inactive</span>
            </div>
            <p className="text-xs text-rose-700/80 mt-2 underline group-hover:text-rose-900">
              Inspect stalled pipeline →
            </p>
          </div>
        </div>
      </div>

      {/* Won vs Lost Summary & Health Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Deal Conversion Performance</h3>
              <p className="text-xs text-slate-500">Won vs Lost deal ratio from database records</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              Win Rate: {winRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Won Deals</span>
              </div>
              <p className="text-xl font-extrabold text-emerald-950">{wonDealsCount} Deals</p>
              <p className="text-xs text-emerald-700 mt-1">₹{wonDealsVal.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Lost Deals</span>
              </div>
              <p className="text-xl font-extrabold text-slate-900">{lostDealsCount} Deals</p>
              <p className="text-xs text-slate-500 mt-1">Revenue lost to competitors/declines</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Average Deal Size: <strong>₹{avgDealSize.toLocaleString('en-IN')}</strong></span>
            <button 
              onClick={() => onSelectTab && onSelectTab('analytics')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              View detailed report →
            </button>
          </div>
        </div>

        {/* Deal Health Alerts */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wide">Deal Health Alerts</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-md">
              {healthAlerts.length} Active
            </span>
          </div>

          {healthAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No open deal health alerts in DB
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {healthAlerts.map((alert, idx) => (
                <div 
                  key={alert.id || idx}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span className="font-bold text-amber-300">{alert.quote_number || 'ALERT'}</span>
                    <span className="text-[10px] text-slate-400">{alert.company_name}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{alert.message || alert.alert_type}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded uppercase font-bold">{alert.severity || 'HIGH'}</span>
                    <span>{alert.triggered_at ? new Date(alert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
