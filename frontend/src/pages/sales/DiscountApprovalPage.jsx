import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDealFlow } from '../../context/DealFlowContext';

export default function DiscountApprovalPage() {
  const { quotations, currentUser, approveQuotation } = useDealFlow();

  const pendingQuotes = quotations.filter((q) => q.status === 'pending_approval' || q.approvals?.length > 0);
  const [selectedQuoteId, setSelectedQuoteId] = useState(pendingQuotes[0]?.id || 'quote_101');
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const activeQuote = quotations.find((q) => q.id === selectedQuoteId) || pendingQuotes[0] || quotations[0];

  const handleAction = async (actionType) => {
    if (!reason.trim()) {
      toast.error('Enter a decision reason for the audit trail.');
      return;
    }
    setActing(true);
    try {
      await approveQuotation(activeQuote.id, actionType, reason);
      toast.success(`Quotation ${actionType.replace('_', ' ')} submitted.`);
      setReason('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Approval action failed.');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Discount Governance & Multi-Tier Approvals
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              B4 Approval Flow — Automated risk-based routing to Sales Manager and Finance/Ops with full audit trails.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Current Role:</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QUOTATIONS LIST (Left column) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Quotations Requiring Action</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {quotations.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    q.id === activeQuote?.id
                      ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-indigo-700">{q.quote_number}</span>
                    <span className="text-xs font-bold text-slate-900">${Number(q.total_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-semibold">{q.customer_name}</div>
                  <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-slate-200/60">
                    <span className="uppercase text-slate-500 font-semibold">Risk Score: {q.blended_risk_score}</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      q.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APPROVAL DETAILS & ACTIONS (Right 2 cols) */}
          {activeQuote && (
            <div className="lg:col-span-2 space-y-6">
              {/* QUOTE SUMMARY & RISK BREAKDOWN */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{activeQuote.quote_number} — {activeQuote.customer_name}</h2>
                    <span className="text-xs text-slate-500 font-medium">Created by {activeQuote.sales_rep_name || 'Alex Rep'} • Customer Tier: {activeQuote.customer_tier_code?.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${Number(activeQuote.total_amount || 0).toLocaleString()}</div>
                    <div className="text-xs text-amber-700 font-bold">Blended Risk Score: {activeQuote.blended_risk_score}</div>
                  </div>
                </div>

                {/* Line Items Discount Analysis */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Discount Compliance Analysis</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-600 uppercase font-bold text-[10px] bg-slate-100">
                        <tr>
                          <th className="p-2.5">Line Item</th>
                          <th className="p-2.5">Given Discount</th>
                          <th className="p-2.5">Allowed Ceiling</th>
                          <th className="p-2.5">Compliance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {(activeQuote.lines || []).map((l, i) => {
                          const isBreach = l.discount_pct > l.line_discount_ceiling_pct;
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2.5 font-semibold text-slate-900">{l.product_name}</td>
                              <td className="p-2.5 font-bold font-mono text-slate-900">{l.discount_pct}%</td>
                              <td className="p-2.5 text-slate-500">{l.line_discount_ceiling_pct}%</td>
                              <td className="p-2.5">
                                {isBreach ? (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-bold">
                                    Breached (+{l.discount_pct - l.line_discount_ceiling_pct}%)
                                  </span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold">
                                    Compliant
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* APPROVAL STEPS CHAIN */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sequential Approval Chain</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeQuote.approvals || [
                      { approval_level: 'sales_manager', sequence_order: 1, action: null },
                      { approval_level: 'finance_ops', sequence_order: 2, action: null },
                    ]).map((step, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span>Step {step.sequence_order}: {step.approval_level.replace('_', ' ').toUpperCase()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            step.action === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {step.action || 'Pending'}
                          </span>
                        </div>
                        {step.reason && <p className="text-[11px] text-slate-600 italic">"{step.reason}"</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION DECISION FORM */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Record Reviewer Action</h4>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter audit trail justification note..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAction('approved')}
                      disabled={acting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition-colors"
                    >
                      <span>Approve Quotation</span>
                    </button>
                    <button
                      onClick={() => handleAction('returned_for_revision')}
                      disabled={acting}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition-colors"
                    >
                      <span>Return for Revision</span>
                    </button>
                    <button
                      onClick={() => handleAction('rejected')}
                      disabled={acting}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition-colors"
                    >
                      <span>Reject Quotation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

