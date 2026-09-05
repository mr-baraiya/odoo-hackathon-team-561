import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDealFlow } from '../../context/DealFlowContext';

export default function CustomerPortalPage() {
  const { id } = useParams();
  const { getPortalQuote, submitNegotiation, confirmPortalQuotation, currentUser } = useDealFlow();

  const quoteId = id || 'quote_101';
  const [data, setData] = useState(null);
  const [requestType, setRequestType] = useState('counter_discount');
  const [message, setMessage] = useState('');
  const [proposedDiscount, setProposedDiscount] = useState(15);
  const [acting, setActing] = useState(false);

  const loadQuoteData = async () => {
    try {
      const res = await getPortalQuote(quoteId);
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQuoteData();
  }, [quoteId]);

  const handleSubmitNegotiation = async () => {
    if (!message.trim()) {
      alert('Please enter a message or note for the sales team.');
      return;
    }
    setActing(true);
    try {
      await submitNegotiation({
        quotationId: data.quote.id,
        customerUserId: currentUser.id,
        requestType,
        message,
        proposedDiscountPct: requestType === 'counter_discount' ? proposedDiscount : null,
      });
      setMessage('');
      await loadQuoteData();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const handleConfirmQuote = async () => {
    setActing(true);
    try {
      const res = await confirmPortalQuotation(data.quote.id);
      alert(res.message);
      await loadQuoteData();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  if (!data) {
    return <div className="p-8 text-slate-500 text-center font-medium">Loading customer portal...</div>;
  }

  const { quote, negotiations } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Standalone Customer Header */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <span>Customer Portal — Online Negotiation</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{quote.customer_name}</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Official Quotation Proposal #{quote.quote_number}</p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-2xl font-black text-slate-900 font-mono">${Number(quote.total_amount || 0).toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-700 uppercase mt-0.5">Status: {quote.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* ORDER LINE ITEMS PREVIEW */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Proposed Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Discount %</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {(quote.lines || []).map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{l.product_name}</td>
                    <td className="p-3">{l.quantity}</td>
                    <td className="p-3 font-mono">${l.unit_price}</td>
                    <td className="p-3 font-bold font-mono text-emerald-700">{l.discount_pct}%</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">${l.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleConfirmQuote}
              disabled={acting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>Confirm Quotation (1-Click)</span>
            </button>
          </div>
        </div>

        {/* NEGOTIATION THREAD & COUNTER PROPOSAL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Customer Negotiation & Discussion Thread
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {negotiations.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-4 text-center">No negotiation requests yet.</div>
            ) : (
              negotiations.map((n) => (
                <div key={n.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-indigo-700">
                    <span className="uppercase">{n.request_type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800 font-medium">"{n.message}"</p>
                  {n.proposed_discount_pct && (
                    <div className="text-[11px] text-amber-700 font-bold">Proposed Counter Discount: {n.proposed_discount_pct}%</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* COUNTER PROPOSAL FORM */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="counter_discount">Counter Discount Proposal</option>
                  <option value="change_request">Change Request</option>
                  <option value="comment">General Question / Comment</option>
                </select>
              </div>

              {requestType === 'counter_discount' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Proposed Counter Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={proposedDiscount}
                    onChange={(e) => setProposedDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-emerald-700 text-center"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Message / Justification</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter counter proposal note..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <button
              onClick={handleSubmitNegotiation}
              disabled={acting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Submit Request to Sales Rep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

