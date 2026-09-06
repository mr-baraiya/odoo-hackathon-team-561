import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { CreditCard, Search, FileText, CheckCircle2, Clock, Shield, Download } from 'lucide-react';
import { exportInvoicePDF } from '../../../utils/invoicePdfGenerator';

export default function SalesRepInvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sales-rep/invoices');
      const data = Array.isArray(res) ? res : (res?.data || []);
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      toast.error('Failed to load invoices from DB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Read-Only Financial Ledger</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Invoices & Payment Visibility</h3>
          <p className="text-xs text-slate-500">
            Read-only financial status of customer invoices and payment confirmations directly from PostgreSQL.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, quotation #, or customer name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Loading invoice and payment records...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Quotation Ref</th>
                  <th className="px-6 py-3.5">Customer Account</th>
                  <th className="px-6 py-3.5">Payment Status</th>
                  <th className="px-6 py-3.5 text-right">Amount Paid / Due</th>
                  <th className="px-6 py-3.5 text-right">PDF Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-bold">
                      No invoice records found in database.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{inv.quote_number}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{inv.customer_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ${Number(inv.amount_paid || 0).toLocaleString()} / ${Number(inv.amount_due || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => exportInvoicePDF(inv)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ml-auto cursor-pointer shadow-2xs"
                          title="Download Official PDF Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
