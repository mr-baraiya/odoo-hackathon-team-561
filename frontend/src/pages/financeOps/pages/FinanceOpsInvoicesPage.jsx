import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, AlertCircle, RefreshCw, Send, Eye, Download } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';
import { exportInvoicePDF } from '../../../utils/invoicePdfGenerator';

export default function FinanceOpsInvoicesPage(props) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [quotationIdInput, setQuotationIdInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch('/api/finance-ops/invoices', { headers });
      const json = await res.json();
      if (json?.data) {
        setInvoices(json.data);
      }
    } catch (err) {
      console.warn('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!quotationIdInput) return;
    setSubmitting(true);
    setFeedback(null);
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch('/api/finance-ops/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quotation_id: quotationIdInput })
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: json.is_existing ? 'info' : 'success',
          message: json.message
        });
        setShowGenModal(false);
        setQuotationIdInput('');
        fetchInvoices();
        if (typeof props.onRefresh === 'function') props.onRefresh();
      } else {
        setFeedback({ type: 'error', message: json.message || 'Invoice generation failed' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              <span>Invoice Directory & Automated Billing</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Idempotent invoice creation linked strictly to PostgreSQL order records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchInvoices} 
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowGenModal(true)} 
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Invoice
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            feedback.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Invoices Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Total Invoices ({invoices.length})</h3>
            <span className="text-xs text-slate-400 font-medium">PostgreSQL Invoices Table</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading invoices from PostgreSQL...</div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No invoices found in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Order / Quote</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5 text-right">Amount Due</th>
                    <th className="p-3.5 text-right">Amount Paid</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-emerald-700">{inv.invoice_number}</td>
                      <td className="p-3.5 font-mono text-slate-500">{inv.quote_number || 'N/A'}</td>
                      <td className="p-3.5 font-bold text-slate-900">{inv.customer_name}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">
                        ${Number(inv.amount_due || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        ${Number(inv.amount_paid || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          inv.status === 'partially_paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          inv.status === 'sent' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {(inv.status || 'draft').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => exportInvoicePDF(inv)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer border border-emerald-200"
                            title="Download PDF Invoice"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Invoice Modal */}
        {showGenModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleGenerateInvoice} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Generate Order Invoice</h3>
                <button type="button" onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl text-xs text-emerald-800 border border-emerald-200 font-medium">
                <span className="font-bold">Idempotency Guarantee:</span> If an invoice already exists for this order in PostgreSQL, the system will safely return the existing invoice without creating duplicate records.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Order / Quotation ID (UUID):
                </label>
                <input
                  type="text"
                  required
                  value={quotationIdInput}
                  onChange={(e) => setQuotationIdInput(e.target.value)}
                  placeholder="e.g. eac01c18-ec4f-4078-ba47-d3c81126aaa9"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
                >
                  {submitting ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Details Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Invoice Details: {selectedInvoice.invoice_number}
                </h3>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.customer_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Billing Address:</span>
                  <span className="font-medium text-slate-700">{selectedInvoice.billing_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Amount Due:</span>
                  <span className="font-extrabold text-slate-900">${Number(selectedInvoice.amount_due).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-extrabold text-emerald-600">${Number(selectedInvoice.amount_paid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-extrabold text-amber-600">{(selectedInvoice.status || 'draft').toUpperCase()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => exportInvoicePDF(selectedInvoice)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="py-2 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FinanceOpsLayout>
  );
}
