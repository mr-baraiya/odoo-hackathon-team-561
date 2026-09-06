import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Truck, 
  Receipt, 
  AlertTriangle, 
  ArrowUpRight, 
  RefreshCw 
} from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

import apiClient from '../../../services/apiClient';

export default function FinanceOpsDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance-ops/dashboard');
      const resData = res?.data || res;
      if (resData) {
        setData(resData);
      }
    } catch (err) {
      console.warn('Error loading finance dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        {/* Title Banner */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Financial Overview & Operational Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Live indicators connected directly to your PostgreSQL database.
            </p>
          </div>
          <button 
            onClick={fetchDashboard}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh KPIs
          </button>
        </div>

        {/* 8 Primary Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">
                ${(data?.total_revenue || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Confirmed Invoiced Collections
              </p>
            </div>
          </div>

          {/* Card 2: Pending Invoices */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Invoices</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">
                ${(data?.pending_invoices_value || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {data?.pending_invoices_count || 0} Invoices Awaiting Payment
              </p>
            </div>
          </div>

          {/* Card 3: Paid vs Unpaid Invoices */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Settlement</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">
                {data?.paid_invoices_count || 0} Paid
              </span>
              <span className="text-xs font-bold text-slate-400">/</span>
              <span className="text-lg font-bold text-amber-600">
                {data?.unpaid_invoices_count || 0} Unpaid
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">PostgreSQL Real-time Settlement Ratio</p>
          </div>

          {/* Card 4: Pending Finance Dual Approvals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 2 Dual Approvals</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-purple-900">
                {data?.pending_finance_approvals_count || 0}
              </span>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                Quotes &gt;25%–50% Discount Queue
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fulfillment Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Warehouse Fulfillment</h3>
                <p className="text-[11px] text-slate-500">Physical Stock Dispatch Tracker</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                <span className="text-slate-600">Pending Allocation:</span>
                <span className="font-extrabold text-amber-600">{data?.fulfillment?.pending || 0} orders</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                <span className="text-slate-600">In Progress:</span>
                <span className="font-extrabold text-indigo-600">{data?.fulfillment?.in_progress || 0} orders</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-slate-600">Fulfilled & Shipped:</span>
                <span className="font-extrabold text-emerald-600">{data?.fulfillment?.completed || 0} orders</span>
              </div>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Outstanding Receivables</h3>
                <p className="text-[11px] text-slate-500">Uncollected Customer Payments</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900">
                ${(data?.pending_payments_value || 0).toLocaleString()}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Across {data?.pending_payments_count || 0} active invoice billing accounts
              </p>
            </div>
          </div>

          {/* Credit Notes & Refunds */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Refunds & Credit Notes</h3>
                <p className="text-[11px] text-slate-500">Adjustments & Reconciliations</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-rose-600">
                ${(data?.credit_notes?.total_amount || 0).toLocaleString()}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {data?.credit_notes?.count || 0} Credit Notes Issued in PostgreSQL
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Finance & Risk Alerts Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Real-time Financial & Operational Risk Alerts</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Live PostgreSQL Stream</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading alerts from PostgreSQL...</div>
          ) : (data?.alerts || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No open financial alerts. All operations are running smoothly!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(data?.alerts || []).map((alert) => (
                <div key={alert.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <div>
                      <span className="font-bold text-slate-800">{alert.company_name || 'Customer'}</span>
                      <span className="text-slate-400 ml-2 font-mono">({alert.quote_number || 'Quote'})</span>
                      <p className="text-slate-500 mt-0.5">{alert.alert_type} - Status: {alert.status}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(alert.triggered_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FinanceOpsLayout>
  );
}
