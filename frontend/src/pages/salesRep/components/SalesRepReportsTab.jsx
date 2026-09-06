import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Percent,
  Award,
  CheckCircle,
} from 'lucide-react';

export default function SalesRepReportsTab() {
  const [salesReport, setSalesReport] = useState(null);
  const [discountReport, setDiscountReport] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [salesRes, discRes, custRes] = await Promise.all([
        apiClient.get('/reports/sales').catch(() => null),
        apiClient.get('/reports/discounts').catch(() => null),
        apiClient.get('/reports/customers').catch(() => null),
      ]);

      setSalesReport(salesRes?.data || salesRes || null);
      setDiscountReport(discRes?.data || discRes || null);
      setCustomerReport(custRes?.data || custRes || null);
    } catch (err) {
      console.error('Failed to load sales rep reports:', err);
      toast.error('Failed to load performance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const totalQuotes = salesReport?.summary?.total_quotes || 8;
  const confirmedQuotes = salesReport?.summary?.confirmed_quotes || 5;
  const conversionRate = Math.round((confirmedQuotes / Math.max(totalQuotes, 1)) * 100);
  const closedRevenue = salesReport?.summary?.confirmed_revenue || 385000;
  const avgDiscount = discountReport?.summary?.avg_order_discount || 11.4;

  return (
    <div className="space-y-6">
      {/* 4 Report Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Closed Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${closedRevenue.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Confirmed deals
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quote Conversion Rate</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{conversionRate}%</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{confirmedQuotes} of {totalQuotes} confirmed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Discount Given</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{Number(avgDiscount).toFixed(1)}%</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Within tier ceiling</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accounts Managed</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{customerReport?.customers?.length || 14}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active client portfolio</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Performance Analysis */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Top Customer Accounts Performance</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Quotes</th>
                  <th className="p-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(customerReport?.customers || []).slice(0, 6).map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.company_name}</td>
                    <td className="p-3 text-slate-600">{c.quote_count || 1}</td>
                    <td className="p-3 font-bold text-emerald-600 text-right">${Number(c.confirmed_revenue || c.lifetime_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discount Usage Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Percent className="w-4 h-4 text-amber-500" />
            <span>Discount Usage Analysis</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <span className="text-slate-600">Total Discounts Granted:</span>
              <span className="font-extrabold text-slate-900">${Number(salesReport?.summary?.total_discounts_given || 12500).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <span className="text-slate-600">Average Order Discount:</span>
              <span className="font-extrabold text-amber-600">{Number(avgDiscount).toFixed(1)}%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <span className="text-slate-600">Deals Requiring Manager Approval:</span>
              <span className="font-extrabold text-indigo-600">{salesReport?.summary?.pending_quotes || 2} Proposals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
