import React, { useState, useEffect } from 'react';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsCreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('partial_refund');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [cnRes, iRes] = await Promise.all([
        fetch('/api/finance-ops/credit-notes', { headers }).then(r => r.json()),
        fetch('/api/finance-ops/invoices', { headers }).then(r => r.json())
      ]);

      if (cnRes?.data) setCreditNotes(cnRes.data);
      if (iRes?.data) setInvoices(iRes.data);
    } catch (err) {
      console.warn('Error loading credit notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueCreditNote = async (e) => {
    e.preventDefault();
    if (!selectedInvId || !amount) return;
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch('/api/finance-ops/credit-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoice_id: selectedInvId,
          amount: parseFloat(amount),
          reason,
          notes
        })
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        setShowModal(false);
        setAmount('');
        setNotes('');
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed: ' + err.message });
    }
  };

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-rose-600" />
              <span>Credit Notes & Refund Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Issue and track credit notes linked directly to customer invoice balances.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => setShowModal(true)} className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <Plus className="w-4 h-4" /> Issue Credit Note
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex justify-between">
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Issued Credit Notes ({creditNotes.length})</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading credit notes...</div>
          ) : creditNotes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">No credit notes found in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5 text-right">Refund Amount</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5 text-right">Issued At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {creditNotes.map((cn) => (
                    <tr key={cn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-slate-900">{cn.invoice_number || 'INV'}</td>
                      <td className="p-3.5 font-bold text-slate-900">{cn.customer_name || 'Customer'}</td>
                      <td className="p-3.5 text-right font-extrabold text-rose-600">-${Number(cn.amount || 0).toLocaleString()}</td>
                      <td className="p-3.5 capitalize text-slate-500">{cn.reason}</td>
                      <td className="p-3.5 text-right text-slate-400">{new Date(cn.issued_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleIssueCreditNote} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Issue Credit Note</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Invoice:</label>
                <select
                  required
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-semibold"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Credit Amount ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 150.00"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason Code:</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                >
                  <option value="partial_refund">Partial Refund</option>
                  <option value="cancellation">Full Cancellation</option>
                  <option value="downgrade">Downgrade Adjustment</option>
                  <option value="other">Other / Courtesy</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs">Issue Credit Note</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </FinanceOpsLayout>
  );
}
