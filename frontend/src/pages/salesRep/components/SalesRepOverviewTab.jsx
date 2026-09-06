import React from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  User,
  CheckCircle,
  AlertTriangle,
  Activity,
  CreditCard,
  Inbox,
} from 'lucide-react';

export default function SalesRepOverviewTab({ summary, quotations = [], onNavigateTab }) {
  const activePipeline = Number(summary?.active_pipeline_value || 0);
  const activeDealsCount = Number(summary?.active_deals_count || 0);
  const openNegCount = Number(summary?.open_negotiations_count || 0);
  const pendingApprovalsCount = Number(summary?.pending_approvals_count || 0);
  const quotationRequestsCount = Number(summary?.quotation_requests_count || 0);
  const wonCount = Number(summary?.won_deals_count || 0);
  const lostCount = Number(summary?.lost_deals_count || 0);
  const revenue = Number(summary?.revenue || 0);

  const healthAlerts = summary?.health_alerts || [];
  const dealsRequiringAction = quotations.filter((q) => q.has_open_negotiation || q.status === 'under_negotiation');

  return (
    <div className="space-y-6">
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Pipeline</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">${activePipeline.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-slate-500" /> {activeDealsCount} active proposals
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quotation Requests</p>
            <h3 className="text-xl font-extrabold text-amber-600 mt-1">{quotationRequestsCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Pending rep acceptance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discount Approvals</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{pendingApprovalsCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Pending Manager / Finance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue Paid</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">${revenue.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center">
              <CreditCard className="w-3 h-3 mr-1 text-slate-500" /> DB payment confirmed
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Deal Health Alerts & Counter-Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Health Alerts Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <span>Deal Health Alerts</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {healthAlerts.length} Active
            </span>
          </div>

          {healthAlerts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
              No critical deal health alerts. All active pipeline quotes are moving healthily!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {healthAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span className="uppercase text-[10px] text-indigo-600">{alert.alert_type?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-500">{alert.quote_number}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{alert.company_name} - {alert.details?.message || 'Requires representative follow-up'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Deals Requiring Action */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-slate-700" />
                <span>Customer Counter-Offers</span>
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('quotations')}
              className="text-xs text-indigo-600 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {dealsRequiringAction.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
              No open customer counter-proposals requiring response right now.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {dealsRequiringAction.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{q.quote_number}</span>
                      <h4 className="text-xs font-semibold text-slate-700">{q.company_name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                      Counter-Offer
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Amount:</span>
                    <span className="font-bold text-slate-900">${(q.total_amount || 0).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('quotations')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    Respond to Customer Proposal
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
