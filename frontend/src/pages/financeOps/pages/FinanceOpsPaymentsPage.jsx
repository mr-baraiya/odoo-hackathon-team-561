import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle2, Clock, AlertCircle, RefreshCw, ShieldCheck, Download } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';
import { exportInvoicePDF } from '../../../utils/invoicePdfGenerator';

export default function FinanceOpsPaymentsPage(props) {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [refNum, setRefNum] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchPaymentsData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [pRes, iRes] = await Promise.all([
        fetch('/api/finance-ops/payments', { headers }).then(r => r.json()),
        fetch('/api/finance-ops/invoices', { headers }).then(r => r.json())
      ]);

      if (pRes?.data) setPayments(pRes.data);
      if (iRes?.data) setInvoices(iRes.data);
    } catch (err) {
      console.warn('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId || !amount) return;
    setSubmitting(true);
    setFeedback(null);
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch('/api/finance-ops/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId,
          amount: parseFloat(amount),
          payment_method: method,
          reference_number: refNum || `PAY-${Date.now()}`
        })
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        setShowVerifyModal(false);
        setAmount('');
        setRefNum('');
        fetchPaymentsData();
        if (typeof props.onRefresh === 'function') props.onRefresh();
      } else {
        setFeedback({ type: 'error', message: json.message || 'Payment verification failed' });
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
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <span>Payment Records & Authoritative Reconciliation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Backend verification ensures zero trust in raw frontend payment statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchPaymentsData} 
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowVerifyModal(true)} 
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Record Verified Payment
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Payment Transactions ({payments.length})</h3>
            <span className="text-xs text-slate-400 font-medium">PostgreSQL Payments Ledger</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading payments from PostgreSQL...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No recorded payments found in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Reference #</th>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5 text-right">Amount Verified</th>
                    <th className="p-3.5 text-right">Date Paid</th>
                    <th className="p-3.5 text-right">PDF Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-emerald-700">{p.reference_number || 'PAY-REF'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{p.invoice_number || 'INV'}</td>
                      <td className="p-3.5 font-bold text-slate-900">{p.customer_name}</td>
                      <td className="p-3.5 capitalize">{p.payment_method || 'card'}</td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-600">
                        +${Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right text-slate-400">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => exportInvoicePDF({
                            invoice_number: p.invoice_number,
                            customer_name: p.customer_name,
                            amount_due: p.amount,
                            amount_paid: p.amount,
                            balance_due: 0,
                            status: 'paid',
                          })}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ml-auto cursor-pointer border border-emerald-200"
                          title="Download PDF Invoice Receipt"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Record Payment Verification Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleVerifyPayment} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Record Verified Payment</h3>
                <button type="button" onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Invoice:</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- Select Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.customer_name} (${Number(inv.amount_due).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Method:</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="razorpay">Razorpay / Gateway</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ref / Txn ID:</label>
                  <input
                    type="text"
                    value={refNum}
                    onChange={(e) => setRefNum(e.target.value)}
                    placeholder="TXN-9872"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
                >
                  {submitting ? 'Verifying...' : 'Verify & Record'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </FinanceOpsLayout>
  );
}
