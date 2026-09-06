import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsApprovalsPage(props) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance-ops/approvals');
      const data = Array.isArray(res) ? res : res?.data || [];
      setApprovals(data);
    } catch (err) {
      console.warn('Error fetching finance approvals:', err.message);
      toast.error('Failed to load Finance approvals queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (targetQuote, actionType, customReason) => {
    const item = targetQuote || selectedQuote;
    if (!item) return;

    const qId = item.quotation_id || item.id;
    const reasonText = customReason !== undefined ? customReason : actionReason;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiClient.post(`/finance-ops/approvals/${qId}/action`, {
        action: actionType,
        reason: reasonText
      });

      if (res?.success) {
        const actionLabel = actionType === 'approve' ? 'Approved' : actionType === 'return' ? 'Returned for Revision' : 'Rejected';
        const msg = res.message || `Quotation ${item.quote_number} ${actionLabel} successfully!`;
        toast.success(msg);
        setFeedback({ type: 'success', message: msg });
        setSelectedQuote(null);
        setActionReason('');
        fetchApprovals();
        if (typeof props.onRefresh === 'function') props.onRefresh();
      } else {
        const failMsg = res?.message || 'Action failed';
        toast.error(failMsg);
        setFeedback({ type: 'error', message: failMsg });
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to execute approval action';
      toast.error(errMsg);
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        {/* Page Banner & Governance Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span>Finance & Ops Step 2 Dual Approval Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Reviews high-discount quotations (&gt;25% to 50%) that have passed Sales Manager Step 1 approval.
              </p>
            </div>
            <button 
              onClick={fetchApprovals} 
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
          </div>

          {/* Explicit Governance Boundary Map */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Explicit Discount Governance Authorization Boundaries
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">0.00% – 5.00%</span>
                <span className="text-emerald-700 font-extrabold">No additional approval</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-blue-600 block text-[10px]">5.01% – 25.00%</span>
                <span className="text-blue-800 font-extrabold">Sales Manager Only</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 ring-2 ring-purple-400">
                <span className="text-purple-600 block text-[10px]">25.01% – 50.00%</span>
                <span className="text-purple-900 font-extrabold">Manager → Finance Dual</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-600 block text-[10px]">50.01% +</span>
                <span className="text-rose-800 font-extrabold">Strictly Blocked</span>
              </div>
            </div>
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

        {/* Approvals Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Pending Finance Approvals ({approvals.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Step 1 Manager Verified</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading pending approvals from PostgreSQL...</div>
          ) : approvals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No pending dual approvals requiring Finance Step 2 sign-off.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Quote Number</th>
                    <th className="p-3.5">Customer & Tier</th>
                    <th className="p-3.5">Sales Rep</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5 text-center">Discount %</th>
                    <th className="p-3.5">Manager Step 1</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {approvals.map((item) => (
                    <tr key={item.quotation_id || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-emerald-700">{item.quote_number}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.customer_name || item.company_name}</div>
                        <span className="text-[10px] text-slate-400">{item.customer_tier || item.tier || 'Partner'}</span>
                      </td>
                      <td className="p-3.5">{item.sales_rep_name}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">
                        ₹{Number(item.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {Number(item.order_level_discount_pct || item.requested_discount_pct || 0).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Step 1 Approved
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            disabled={submitting}
                            onClick={() => handleAction(item, 'approve', 'Finance Approved')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-all text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={submitting}
                            onClick={() => handleAction(item, 'return', 'Returned by Finance for Revision')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold rounded-lg transition-all text-xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Return
                          </button>
                          <button
                            disabled={submitting}
                            onClick={() => handleAction(item, 'reject', 'Rejected by Finance Ops')}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-all text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => { setSelectedQuote(item); setActionReason(''); }}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all"
                            title="Detailed Review with Notes"
                          >
                            Notes
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

        {/* Detailed Review & Action Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Finance Step 2 Review: {selectedQuote.quote_number}
                </h3>
                <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 font-medium text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedQuote.customer_name || selectedQuote.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quote Value:</span>
                  <span className="font-extrabold text-slate-900">₹{Number(selectedQuote.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Percentage:</span>
                  <span className="font-extrabold text-purple-700">{Number(selectedQuote.order_level_discount_pct || selectedQuote.requested_discount_pct || 0).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Manager Step 1:</span>
                  <span className="font-bold text-emerald-600">Step 1 Approved</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reviewer Notes / Reason (Optional):
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter comments or revision requests for the team..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={submitting}
                  onClick={() => handleAction(selectedQuote, 'approve', actionReason)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction(selectedQuote, 'return', actionReason)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Return
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction(selectedQuote, 'reject', actionReason)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FinanceOpsLayout>
  );
}
