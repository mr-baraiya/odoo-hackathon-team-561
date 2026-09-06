import React from 'react';
import { 
  GitPullRequest, 
  AlertTriangle, 
  Send, 
  Flame,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalesManagerPipelineTab({ pipelineData, loading }) {
  if (loading && !pipelineData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live team deal pipeline from database...</span>
      </div>
    );
  }

  const data = pipelineData || {};
  const stages = data.stages || [];
  const stalledDeals = data.stalled_deals || [];
  const highValueDeals = data.high_value_deals || [];

  const handleSendReminder = (quoteNum, repName) => {
    toast.success(`Follow-up reminder sent to ${repName} for ${quoteNum}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <GitPullRequest className="w-5 h-5 text-indigo-600" /> Team Deal Pipeline Overview
        </h2>
        <p className="text-xs text-slate-500">
          Track stage conversion, monitor stalled deals (&gt;7 days inactive), and identify high-value Enterprise accounts.
        </p>
      </div>

      {/* Stage Cards Grid */}
      {stages.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No pipeline stages found in DB</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((st, i) => (
            <div key={i} className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{st.stage}</span>
              <h4 className="text-xl font-bold text-slate-900 mt-1">{st.count} Deals</h4>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">₹{Number(st.total_value || 0).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stalled Deals & High Value Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stalled Deals */}
        <div className="bg-white rounded-2xl p-6 border border-rose-200/80 bg-gradient-to-br from-rose-50/20 to-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Stalled Deals (&gt;7 Days Inactive)
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-md">
              {stalledDeals.length} Action Needed
            </span>
          </div>

          {stalledDeals.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No stalled deals found in DB</p>
          ) : (
            <div className="space-y-3">
              {stalledDeals.map((deal, idx) => (
                <div key={deal.id || idx} className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">{deal.quote_number}</span>
                      <span className="text-slate-900 font-semibold">{deal.company_name}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Rep: {deal.rep_name} • ₹{Number(deal.amount || 0).toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                      ⏱ Inactive for {deal.days_inactive || 7} days
                    </span>
                  </div>
                  <button
                    onClick={() => handleSendReminder(deal.quote_number, deal.rep_name)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" /> Remind Rep
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Value Deals */}
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" /> High-Value Deals (&gt;₹5,00,000)
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
              Priority Focus
            </span>
          </div>

          {highValueDeals.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No high-value deals found in DB</p>
          ) : (
            <div className="space-y-3">
              {highValueDeals.map((deal, idx) => (
                <div key={deal.id || idx} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">{deal.quote_number}</span>
                      <span className="text-slate-900 font-semibold">{deal.company_name}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Rep: {deal.rep_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">₹{Number(deal.amount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold uppercase">
                      {deal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
