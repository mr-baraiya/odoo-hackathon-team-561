import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Eye,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerQuotationsTab({
  quotations = [],
  onConfirmQuotation,
  onRejectQuotation,
  onOpenNegotiation,
  onFetchDetail,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [rejectingQuote, setRejectingQuote] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleOpenDetail = async (q) => {
    setSelectedQuote(q);
    if (onFetchDetail) {
      try {
        const fullDetail = await onFetchDetail(q.id || q.quote_number);
        if (fullDetail) {
          setSelectedQuote(fullDetail.quote || fullDetail);
        }
      } catch (e) {
        console.warn('Could not fetch quote detail:', e);
      }
    }
  };

  const filteredQuotes = (quotations || []).filter((q) => {
    const matchesSearch =
      !search.trim() ||
      (q.quote_number || q.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.sales_rep_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || String(q.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (q) => {
    try {
      if (onConfirmQuotation) {
        await onConfirmQuotation(q.id || q.quote_number);
        toast.success(`Quotation ${q.quote_number || q.id} accepted! Order confirmed.`);
        setSelectedQuote(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept quotation.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for rejecting the quotation.');
      return;
    }
    try {
      if (onRejectQuotation) {
        await onRejectQuotation(rejectingQuote.id || rejectingQuote.quote_number, rejectReason);
      }
      setRejectingQuote(null);
      setRejectReason('');
      setSelectedQuote(null);
    } catch (err) {
      toast.error(err.message || 'Failed to reject quotation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quote number or sales rep..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2 w-full sm:w-auto">
            {['all', 'sent_to_customer', 'under_negotiation', 'confirmed', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st === 'all'
                  ? 'All Statuses'
                  : st.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotation Proposals Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Quotation #</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Sales Rep</th>
                  <th className="px-5 py-3.5">Total Value</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredQuotes.map((q) => (
                  <tr key={q.id || q.quote_number} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {q.quote_number || q.id}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          q.status === 'confirmed' || q.status === 'fulfilled'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : q.status === 'under_negotiation'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : q.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {String(q.status || 'draft').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-semibold">
                      {q.sales_rep_name || 'Sales Representative'}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      ${Number(q.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">
                      {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(q)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                        {q.status !== 'confirmed' && q.status !== 'rejected' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenNegotiation) onOpenNegotiation(q);
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Negotiate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAccept(q)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-800">No quotations found</h4>
            <p className="text-xs text-slate-500">There are no quotation proposals matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Quotation Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 relative animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold font-mono text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Quotation Proposal
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedQuote.quote_number || selectedQuote.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

              {/* Itemized Products Breakdown */}
              {(() => {
                const discountPct = Number(selectedQuote.order_level_discount_pct || 0);
                const rawTotal = Number(selectedQuote.total_amount || 0);
                const rawSubtotal = Number(selectedQuote.subtotal || 0);

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
                const calculatedFinalTotal = Math.max(0, grossSubtotal - discountAmt);

                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Itemized Products Breakdown
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          <tr>
                            <th className="px-4 py-2">Product Description</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-right">Unit Price</th>
                            <th className="px-4 py-2 text-right">Discount</th>
                            <th className="px-4 py-2 text-right">Total Gross</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                          {Array.isArray(selectedQuote.lines) && selectedQuote.lines.length > 0 ? (
                            selectedQuote.lines.map((l, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2.5 font-bold">{l.product_name || `Line Item #${idx+1}`}</td>
                                <td className="px-4 py-2.5 text-center font-mono">{l.quantity || 1}</td>
                                <td className="px-4 py-2.5 text-right font-mono">${Number(l.unit_price || 0).toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-right text-emerald-700 font-semibold">{l.discount_pct || 0}%</td>
                                <td className="px-4 py-2.5 text-right font-black">${Number(l.line_total || (l.quantity * l.unit_price) || 0).toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-3 font-bold">{selectedQuote.notes || 'Quotation Request Solution'}</td>
                              <td className="px-4 py-3 text-center font-mono">—</td>
                              <td className="px-4 py-3 text-right font-mono">${grossSubtotal.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{discountPct}%</td>
                              <td className="px-4 py-3 text-right font-black">${grossSubtotal.toLocaleString()}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Calculation Card */}
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-1.5 text-xs text-right">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal Amount (Gross):</span>
                        <span className="font-mono font-bold">${grossSubtotal.toLocaleString()}</span>
                      </div>
                      {discountPct > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Order Level Discount ({discountPct}%):</span>
                          <span>-${discountAmt.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-indigo-200">
                        <span>Final Total Proposal:</span>
                        <span>${calculatedFinalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              {selectedQuote.status === 'rejected' ? (
                <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-center text-xs font-extrabold text-rose-900 flex items-center justify-center space-x-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>This quotation proposal was DECLINED / REJECTED and is permanently closed.</span>
                </div>
              ) : selectedQuote.status === 'confirmed' || selectedQuote.status === 'fulfilled' ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center text-xs font-extrabold text-emerald-900 flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>This quotation proposal has been CONFIRMED as an active order.</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectingQuote(selectedQuote)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Quotation</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenNegotiation) onOpenNegotiation(selectedQuote);
                        setSelectedQuote(null);
                      }}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Request Discount / Negotiate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(selectedQuote)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Proposal</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Quotation Reason Modal */}
      {rejectingQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Reject Quotation Proposal</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please let your assigned Sales Representative know why you are declining this quotation:
            </p>

            <textarea
              required
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Budget constraints, selected alternative vendor, or lead time too long..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
            />

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRejectingQuote(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
