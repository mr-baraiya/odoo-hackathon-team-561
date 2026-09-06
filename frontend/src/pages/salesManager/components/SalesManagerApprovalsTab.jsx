import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ShieldAlert, 
  User, 
  Building, 
  Percent, 
  Loader2,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';

export default function SalesManagerApprovalsTab({ approvalsData, loading: parentLoading, onRefresh }) {
  const [approvals, setApprovals] = useState(approvalsData || []);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchApprovals = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get('/sales-manager/approvals');
      const data = Array.isArray(res) ? res : res?.data || [];
      setApprovals(data);
    } catch (err) {
      console.error('Error fetching manager approvals in tab:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(approvalsData) && approvalsData.length > 0) {
      setApprovals(approvalsData);
    } else {
      fetchApprovals();
    }
  }, [approvalsData]);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'reject' | 'return'
  const [comments, setComments] = useState('');
  const [revisedDiscount, setRevisedDiscount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = (parentLoading && !approvalsData) || localLoading;

  if (isLoading && approvals.length === 0) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live quotation approval queue from database...</span>
      </div>
    );
  }

  const handleOpenAction = (quote, type) => {
    setSelectedQuote(quote);
    setActionModal(type);
    setComments('');
    setRevisedDiscount(quote.requested_discount_pct || '');
  };

  const handleConfirmAction = async () => {
    if (!selectedQuote || !actionModal) return;
    setIsSubmitting(true);

    try {
      const qId = selectedQuote.quotation_id || selectedQuote.id;
      const res = await apiClient.post(`/sales-manager/approvals/${qId}/action`, {
        action: actionModal,
        comments,
        revised_discount: revisedDiscount
      });

      if (res?.success) {
        toast.success(res.message || `Quotation ${selectedQuote.quote_number} ${actionModal === 'approve' ? 'Approved' : actionModal === 'reject' ? 'Rejected' : 'Returned for Revision'}`);
        setApprovals((prev) => prev.filter((q) => (q.id !== selectedQuote.id && q.quotation_id !== selectedQuote.quotation_id)));
        setActionModal(null);
        setSelectedQuote(null);
        if (onRefresh) onRefresh();
        else fetchApprovals();
      } else {
        toast.error(res?.message || 'Action failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Quotation Approval Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and act on quotation discount requests (&gt;5%–25% direct manager approval, &gt;25%–50% dual approval step 1).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
            {approvals.length} Pending Approval{approvals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {approvals.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-slate-800">All Approvals Up to Date!</h3>
            <p className="text-xs text-slate-500 mt-1">There are no pending discount requests requiring Sales Manager action right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Quotation #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Sales Rep</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 text-center">Requested Discount</th>
                  <th className="py-3.5 px-4 text-right">Final Total</th>
                  <th className="py-3.5 px-4">Approval Level</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {approvals.map((q, idx) => {
                  const isHighDiscount = Number(q.requested_discount_pct) > 25;
                  return (
                    <tr key={q.id || q.quotation_id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-indigo-600">
                        {q.quote_number}
                        <div className="text-[10px] font-normal text-slate-400">
                          {q.request_date ? new Date(q.request_date).toLocaleDateString() : 'Today'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900">{q.company_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded">
                            {q.tier || 'Silver'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{q.sales_rep_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-600">
                        ₹{Number(q.subtotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isHighDiscount 
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {q.requested_discount_pct}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{Number(q.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        {isHighDiscount ? (
                          <span className="text-[11px] px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg font-semibold block text-center">
                            Manager + Finance
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold block text-center">
                            Manager Direct
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenAction(q, 'approve')}
                            className={`px-2.5 py-1.5 text-white font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center gap-1 ${
                              isHighDiscount
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {isHighDiscount ? <Send className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {isHighDiscount ? 'Approve & Forward to Finance' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleOpenAction(q, 'return')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold rounded-lg transition-all text-xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Return
                          </button>
                          <button
                            onClick={() => handleOpenAction(q, 'reject')}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-all text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {actionModal === 'approve' && (
                  Number(selectedQuote.requested_discount_pct) > 25 ? (
                    <Send className="w-5 h-5 text-purple-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )
                )}
                {actionModal === 'return' && <RotateCcw className="w-5 h-5 text-amber-600" />}
                {actionModal === 'reject' && <XCircle className="w-5 h-5 text-rose-600" />}
                {actionModal === 'approve' 
                  ? (Number(selectedQuote.requested_discount_pct) > 25 ? 'Approve & Forward to Finance' : 'Approve & Send to Customer') 
                  : actionModal === 'return' ? 'Return for Revision' : 'Reject Quotation'}
              </h3>
              <span className="font-mono text-xs font-bold text-indigo-600">{selectedQuote.quote_number}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><strong>Customer:</strong> {selectedQuote.company_name}</p>
              <p><strong>Requested Discount:</strong> <span className="text-amber-800 font-bold">{selectedQuote.requested_discount_pct}%</span></p>
              <p><strong>Total Amount:</strong> ₹{Number(selectedQuote.total_amount || 0).toLocaleString('en-IN')}</p>
            </div>

            {actionModal === 'approve' && Number(selectedQuote.requested_discount_pct) > 25 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Send className="w-4 h-4 text-purple-700" /> Step 1 Approval & Forwarding
                </div>
                <p className="text-[11px] leading-relaxed text-purple-800">
                  Discount of <strong>{selectedQuote.requested_discount_pct}%</strong> requires dual approval (&gt;25%). Approving will validate <strong>Sales Manager Step 1</strong> and automatically forward this quotation to <strong>Finance & Operations</strong> for final sign-off.
                </p>
              </div>
            )}

            {actionModal === 'return' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counter-Proposed Discount % (Optional)
                </label>
                <input
                  type="number"
                  value={revisedDiscount}
                  onChange={(e) => setRevisedDiscount(e.target.value)}
                  placeholder="e.g. 15.0"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approval / Manager Comments {actionModal !== 'approve' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter justification or feedback for the Sales Rep..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all ${
                  actionModal === 'approve' 
                    ? (Number(selectedQuote.requested_discount_pct) > 25 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700') 
                    : actionModal === 'return' 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : (
                  actionModal === 'approve'
                    ? (Number(selectedQuote.requested_discount_pct) > 25 ? 'Approve & Forward to Finance' : 'Approve & Send to Customer')
                    : `Confirm ${actionModal.toUpperCase()}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
