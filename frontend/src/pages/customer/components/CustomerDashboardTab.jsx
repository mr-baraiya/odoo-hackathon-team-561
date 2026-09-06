import React from 'react';
import {
  FileText,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Bell,
  ShoppingBag,
  Sparkles,
  Clock,
} from 'lucide-react';

export default function CustomerDashboardTab({
  summary = {},
  recentQuotations = [],
  recentNotifications = [],
  onNavigateTab,
}) {
  const {
    active_quotes = 0,
    total_quotes = 0,
    confirmed_orders = 0,
    total_spent = 0,
    pending_invoices = 0,
    pending_amount = 0,
  } = summary;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards — all values from DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Quotations */}
        <div
          onClick={() => onNavigateTab('quotations')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {total_quotes} Total
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Proposals
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {active_quotes} <span className="text-xs font-semibold text-slate-600">Quotes</span>
          </h3>
          <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 group-hover:underline">
            <span>View Proposals</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Confirmed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Fulfillment Active
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Confirmed Orders
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {confirmed_orders} <span className="text-xs font-semibold text-slate-600">Orders</span>
          </h3>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 group-hover:underline">
            <span>Track Orders & Delivery</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Pending Payments */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              {pending_invoices} Due
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pending Payments
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ${Number(pending_amount).toLocaleString()}
          </h3>
          <div className="mt-3 flex items-center text-xs font-semibold text-amber-700 group-hover:underline">
            <span>Pay Invoices Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Lifetime Spend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Tier Verified
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Lifetime Spend
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ${Number(total_spent).toLocaleString()}
          </h3>
          <p className="mt-3 text-[11px] text-slate-500">
            Total verified order fulfillment value
          </p>
        </div>
      </div>

      {/* Recent Quotes & Notifications from DB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Quotations */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Recent Quotation Proposals</span>
              </h3>
              <p className="text-xs text-slate-500">Review, negotiate or accept active quotes from database</p>
            </div>
            <button
              onClick={() => onNavigateTab('quotations')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentQuotations.length > 0 ? (
            <div className="space-y-3">
              {recentQuotations.map((q) => (
                <div
                  key={q.id || q.quote_number}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {q.quote_number || q.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          q.status === 'confirmed' || q.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'under_negotiation'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {String(q.status || 'draft').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Sales Rep: <strong className="text-slate-800">{q.sales_rep_name || 'Sales Representative'}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ${Number(q.total_amount || 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => onNavigateTab('quotations')}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Review Proposal →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No active quotation proposals found in database.</p>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                <span>Browse Product Catalog</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Recent Notifications from DB */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Recent Updates</span>
              </h3>
              <button
                onClick={() => onNavigateTab('notifications')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">
                        {String(n.action || n.type || 'Update').replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {n.message || n.reason || 'Activity recorded'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  <p>No recent notifications from database.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block">Tier SLA Active</span>
                <span className="text-indigo-700 text-[11px]">
                  Priority dispatch & counter-proposal review within 2 business hours.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
