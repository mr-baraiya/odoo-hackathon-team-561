import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { ShieldCheck, Plus, Clock, CheckCircle, AlertCircle, ArrowRight, X, AlertTriangle } from 'lucide-react';

export default function SalesRepApprovalsTab({ quotations = [], onRefresh }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [requestedDiscount, setRequestedDiscount] = useState('18');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sales-rep/approvals');
      const data = Array.isArray(res) ? res : (res?.data || []);
      setApprovals(data);
    } catch (err) {
      console.error('Failed to fetch approval records:', err);
      toast.error('Failed to load approval records from DB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleSubmitDiscountRequest = async (e) => {
    e.preventDefault();
    if (!selectedQuoteId || !requestedDiscount) {
      toast.error('Please select a quotation and specify requested discount percentage.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post(`/sales-rep/quotations/${selectedQuoteId}/submit`, {
        order_level_discount_pct: Number(requestedDiscount),
      });

      toast.success(res?.message || res?.data?.message || 'Discount approval request submitted!');
      setIsModalOpen(false);
      setSelectedQuoteId('');
      setJustification('');
      fetchApprovals();
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error submitting discount approval:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit discount approval request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Submit Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Discount Approval Governance Engine</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Tier Approval Tracking</h3>
          <p className="text-xs text-slate-500">
            Real-time status of quotation discount approval chains: 0–5% Direct Send, &gt;5–25% Sales Manager, &gt;25–50% Manager + Finance, &gt;50% Prohibited.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Discount Request</span>
        </button>
      </div>

      {/* Requests History List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Approval Records in PostgreSQL</h4>

        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400">Loading approval chains...</div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs font-medium">
            No pending or past discount approval requests. Quotations within 5% proceed directly without additional approval.
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map((app) => (
              <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{app.quote_number || 'Quotation'}</span>
                    <span className="font-semibold text-slate-600">• {app.customer_name}</span>
                  </div>
                  <p className="text-slate-500">
                    Discount Level: <strong className="text-indigo-600">{app.order_level_discount_pct || 0}%</strong> | Approval Level: <span className="uppercase font-bold text-slate-700">{app.approval_level?.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 italic font-medium">
                    {app.reason || 'Discount approval request submitted.'}
                  </p>
                </div>
                <div>
                  {app.action === 'approved' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Approved</span>
                    </span>
                  ) : app.action === 'rejected' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Rejected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Submit Discount Approval Request</h3>
                  <p className="text-[11px] text-slate-500">Evaluated against backend discount governance</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDiscountRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Select Quotation Proposal</label>
                <select
                  value={selectedQuoteId}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-500 cursor-pointer shadow-xs"
                >
                  <option value="" className="text-slate-900 bg-white">-- Choose Assigned Quotation --</option>
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id} className="text-slate-900 bg-white">
                      {q.quote_number} - {q.company_name} (${(q.total_amount || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Requested Discount Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={requestedDiscount}
                  onChange={(e) => setRequestedDiscount(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Live Governance Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block">Governance Rules:</span>
                {Number(requestedDiscount) <= 5.0 ? (
                  <span className="text-emerald-700 font-bold block">✓ 0–5%: Direct Send (No additional approval required)</span>
                ) : Number(requestedDiscount) <= 25.0 ? (
                  <span className="text-amber-700 font-bold block">&gt;5–25%: Requires Sales Manager Approval</span>
                ) : Number(requestedDiscount) <= 50.0 ? (
                  <span className="text-purple-700 font-bold block">&gt;25–50%: Requires Sales Manager + Finance Dual Approval</span>
                ) : (
                  <span className="text-rose-700 font-bold block">❌ &gt;50%: Prohibited by Backend Governance Engine</span>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedQuoteId}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
