import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  FileText,
  DollarSign,
  HelpCircle,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerNegotiationTab({
  quotations = [],
  selectedQuoteDetail,
  onSelectQuote,
  onSubmitNegotiation,
  onRejectQuotation,
  currentUser,
  onTabSwitch,
  customerTierCeiling = 18,
}) {
  const [requestType, setRequestType] = useState('counter_discount');
  const [message, setMessage] = useState('');
  const [proposedDiscount, setProposedDiscount] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  const quote = selectedQuoteDetail?.quote;
  const negotiations = selectedQuoteDetail?.negotiations || [];

  const isRejected = quote?.status === 'rejected';
  const isConfirmed = quote?.status === 'confirmed' || quote?.status === 'fulfilled';
  const isPendingApproval = quote?.status === 'pending_approval';

  // Filter quotations that can be negotiated (exclude confirmed and rejected)
  const negotiableQuotes = quotations.filter(
    (q) => q.status !== 'confirmed' && q.status !== 'fulfilled' && q.status !== 'rejected'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRejected) {
      toast.error('This quotation proposal has been rejected. Negotiations are closed.');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message for the sales representative.');
      return;
    }
    if (!quote?.id) {
      toast.error('Please select a quotation first.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitNegotiation({
        quotationId: quote.id,
        customerUserId: currentUser?.id,
        requestType,
        message,
        proposedDiscountPct: requestType === 'counter_discount' ? proposedDiscount : null,
      });
      setMessage('');
    } catch (err) {
      toast.error('Failed to submit negotiation.');
    } finally {
      setSubmitting(false);
    }
  };

  // No quote selected
  if (!quote) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Select a Quotation to Negotiate</span>
          </h3>
          <p className="text-xs text-slate-600 mb-5">
            Choose an active quotation proposal below to request a discount, counter-offer, or ask questions.
          </p>

          {negotiableQuotes.length > 0 ? (
            <div className="space-y-3">
              {negotiableQuotes.map((q) => (
                <button
                  key={q.id || q.quote_number}
                  onClick={() => onSelectQuote(q.id || q.quote_number)}
                  className="w-full text-left p-4 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {q.quote_number || q.id}
                    </span>
                    <span
                      className={`ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        q.status === 'under_negotiation'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : q.status === 'pending_approval'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : q.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {String(q.status).replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-slate-500">
                      Rep: {q.sales_rep_name || 'Account Manager'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      ${Number(q.total_amount || 0).toLocaleString()}
                    </span>
                    <span className="block text-[11px] text-indigo-600 font-bold group-hover:underline">
                      Negotiate →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No quotations available for negotiation.</p>
              <button
                onClick={() => onTabSwitch('quotations')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View All Quotations →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => onSelectQuote(null)}
          className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quote Selection</span>
        </button>

        {!isRejected && !isConfirmed && onRejectQuotation && (
          <button
            onClick={() => onRejectQuotation(quote.id || quote.quote_number, 'Declined by customer via negotiation view')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Decline Quotation</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quote Summary & Negotiation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rejection Alert Callout */}
          {isRejected && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-900 shadow-2xs">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-rose-950 text-sm">Quotation Proposal Rejected</h4>
                <p className="text-rose-800 leading-relaxed">
                  This quotation proposal has been declined and permanently marked as <strong>REJECTED</strong> in the database.
                  Further counter-proposals, discounts, and negotiation features are disabled.
                </p>
              </div>
            </div>
          )}

          {/* Pending Approval Manager Alert Callout */}
          {isPendingApproval && !isRejected && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-start space-x-3 text-purple-900 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-purple-950 text-sm">Escalated to Sales Manager</h4>
                <p className="text-purple-800 leading-relaxed">
                  The requested discount exceeds your <strong>{customerTierCeiling}% Tier Threshold Limit</strong>. This proposal is currently under review by the <strong>Sales Manager</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Quote Summary Card */}
          {(() => {
            const discountPct = Number(quote.order_level_discount_pct || 0);
            const rawTotal = Number(quote.total_amount || 0);
            const rawSubtotal = Number(quote.subtotal || 0);
            
            // Calculate gross subtotal before discount
            let grossSubtotal = rawSubtotal;
            if (!grossSubtotal || grossSubtotal === rawTotal) {
              if (discountPct > 0 && discountPct < 100) {
                grossSubtotal = Math.round(rawTotal / (1 - discountPct / 100));
              } else {
                grossSubtotal = rawTotal;
              }
            }
            const discountAmt = Math.round((grossSubtotal * discountPct) / 100);
            const finalNetTotal = Math.max(0, grossSubtotal - discountAmt);

            return (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold font-mono text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      Quotation Proposal
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      {quote.quote_number || quote.id}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Net Proposal Total: <strong className="text-slate-900 font-mono text-sm">${finalNetTotal.toLocaleString()}</strong>
                      {discountPct > 0 && (
                        <span className="ml-2 text-emerald-700 font-bold">
                          ({discountPct}% discount applied — Saved ${discountAmt.toLocaleString()})
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      quote.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : quote.status === 'pending_approval'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : quote.status === 'under_negotiation'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : quote.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {String(quote.status || 'pending').replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Line Items Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="px-4 py-2">Product Description</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total Gross</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Array.isArray(quote.lines) && quote.lines.length > 0 ? (
                        quote.lines.map((l, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 font-bold text-slate-800">{l.product_name || `Line #${idx + 1}`}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{l.quantity || 1}</td>
                            <td className="px-4 py-2.5 text-right font-mono">${Number(l.unit_price || 0).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-black">${Number(l.line_total || (l.quantity * l.unit_price) || 0).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-slate-800">{quote.notes || 'Quotation Request Solution'}</td>
                          <td className="px-4 py-2.5 text-center font-mono">—</td>
                          <td className="px-4 py-2.5 text-right font-mono">${grossSubtotal.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-black">${grossSubtotal.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Proposal Cost Calculation Breakdown */}
                <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (Gross):</span>
                    <span className="font-mono font-bold">${grossSubtotal.toLocaleString()}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Order Discount ({discountPct}%):</span>
                      <span>-${discountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-indigo-200">
                    <span>Net Proposal Total:</span>
                    <span>${finalNetTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Negotiation Form (Disabled if Rejected) */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Submit Counter-Proposal / Request</span>
            </h4>

            {/* Request Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Request Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'counter_discount', label: 'Request Discount', icon: DollarSign },
                  { key: 'counter_offer', label: 'Counter-Offer', icon: MessageSquare },
                  { key: 'question', label: 'Ask Question', icon: HelpCircle },
                ].map((rt) => {
                  const Icon = rt.icon;
                  return (
                    <button
                      key={rt.key}
                      type="button"
                      disabled={isRejected}
                      onClick={() => setRequestType(rt.key)}
                      className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center space-y-1 transition-all border ${
                        requestType === rt.key
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      } ${isRejected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{rt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Slider & Threshold Indicator (Requirement iv) */}
            {requestType === 'counter_discount' && (
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    Proposed Discount: <span className="text-indigo-600 font-extrabold text-sm">{proposedDiscount}%</span>
                  </label>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                      proposedDiscount > customerTierCeiling
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    <span>
                      {proposedDiscount > customerTierCeiling
                        ? `>${customerTierCeiling}% Tier Threshold (Routed to Sales Manager)`
                        : `✓ ≤${customerTierCeiling}% Tier Limit (Handled by Sales Representative / Admin)`}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  disabled={isRejected}
                  value={proposedDiscount}
                  onChange={(e) => setProposedDiscount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-medium">
                  <span>5% (Rep Standard)</span>
                  <span>{customerTierCeiling}% (Tier Allowed Limit)</span>
                  <span>40% (Manager Approval)</span>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Message to Sales Representative / Administrative
              </label>
              <textarea
                required
                rows="4"
                disabled={isRejected}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isRejected
                    ? 'Quotation is rejected. Further messages cannot be submitted.'
                    : 'Explain your request or counter-proposal...'
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 cursor-text"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || isRejected}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isRejected
                    ? 'Quotation Rejected'
                    : submitting
                    ? 'Submitting...'
                    : 'Submit Negotiation Request'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Negotiation History from DB (Requirement iii) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Negotiation & Response History</span>
          </h4>

          {negotiations.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {negotiations.map((n, idx) => (
                <div
                  key={n.id || idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                >
                  {/* Customer request section */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-extrabold text-slate-900">
                        {n.user_name || 'Customer Request'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        n.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : n.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : n.status === 'addressed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {n.status || 'open'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{n.message}</p>
                  {n.proposed_discount_pct && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <span>Proposed Discount:</span>
                      <span>{n.proposed_discount_pct}%</span>
                    </div>
                  )}

                  {/* Representative / Manager Response Box (Requirement iii) */}
                  {n.response_message && (
                    <div className="mt-2.5 p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-extrabold text-indigo-950">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Sales Rep / Manager Response</span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                          Response
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-indigo-100">
                        "{n.response_message}"
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No negotiation history yet.</p>
              <p className="text-[11px] text-slate-400">
                Submit a counter-proposal or discount request to start negotiating with your assigned representative.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
