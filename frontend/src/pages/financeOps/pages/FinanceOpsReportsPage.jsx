import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsReportsPage() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch('/api/finance-ops/reports', { headers });
      const json = await res.json();
      if (json?.data) {
        setReportsData(json.data);
      }
    } catch (err) {
      console.warn('Error loading finance reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <span>Financial Reports & SQL Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time revenue aggregation and invoice breakdown from PostgreSQL.
            </p>
          </div>
          <button onClick={fetchReports} className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh SQL
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Monthly Revenue Collection Trend</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Payment Ledger Aggregates</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Querying SQL...</div>
            ) : (reportsData?.monthly_revenue_trend || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">No recorded revenue transactions yet.</div>
            ) : (() => {
              const maxRevenue = Math.max(...(reportsData?.monthly_revenue_trend || []).map(r => Number(r.revenue || 0)), 1);
              return (
                <div className="space-y-3">
                  {reportsData.monthly_revenue_trend.map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{row.month}</span>
                        <span className="text-emerald-600">${Number(row.revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, (Number(row.revenue) / maxRevenue) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Invoice Status Distribution Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>Invoice Distribution by Status</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">PostgreSQL Invoices Table</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Querying SQL...</div>
            ) : (reportsData?.invoice_distribution || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">No invoice data available.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reportsData.invoice_distribution.map((inv, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <span className="font-bold capitalize text-slate-800">{inv.status}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{inv.count} Invoices</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        ${Number(inv.total_due || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FinanceOpsLayout>
  );
}
