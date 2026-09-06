import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertOctagon, 
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalesManagerNegotiationTab({ negotiationsData, loading }) {
  const [negotiations, setNegotiations] = useState(negotiationsData || []);

  useEffect(() => {
    if (negotiationsData) {
      setNegotiations(negotiationsData);
    }
  }, [negotiationsData]);

  if (loading && !negotiationsData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live customer negotiations from database...</span>
      </div>
    );
  }

  const handleApproveDiscount = (quoteNum, targetPct) => {
    toast.success(`Approved revised discount of ${targetPct}% for ${quoteNum}`);
  };

  const handleEscalate = (quoteNum) => {
    toast.success(`Escalated deal ${quoteNum} to Executive Board`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-indigo-600" /> Customer Negotiation Management
        </h2>
        <p className="text-xs text-slate-500">
          Review live customer counter-offers, approve requested discount revisions, and monitor progress across rounds.
        </p>
      </div>

      {negotiations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-xs text-slate-500">
          No open customer counter-offers or active negotiations in DB
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {negotiations.map((neg, idx) => (
            <div key={neg.id || idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-bold text-indigo-600 text-sm">{neg.quote_number}</span>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-100">
                    {neg.stage || 'Round 2'}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  <p><strong>Customer:</strong> <span className="text-slate-900 font-semibold">{neg.customer_name}</span></p>
                  <p><strong>Sales Rep:</strong> {neg.sales_rep_name}</p>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Rep Offered</span>
                      <span className="font-bold text-slate-800">{neg.current_discount_pct}% Discount</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 block uppercase font-semibold">Customer Countered</span>
                      <span className="font-bold text-amber-900">{neg.customer_target_discount}% Discount</span>
                    </div>
                  </div>

                  {neg.customer_note && (
                    <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-amber-950 mt-2">
                      <p className="font-semibold text-[11px]">Customer Note:</p>
                      <p className="italic text-[11px] mt-0.5">"{neg.customer_note}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleApproveDiscount(neg.quote_number, neg.customer_target_discount)}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve {neg.customer_target_discount}%
                </button>
                <button
                  onClick={() => handleEscalate(neg.quote_number)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" /> Escalate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
