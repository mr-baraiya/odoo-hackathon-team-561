import React from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDealFlow } from '../../context/DealFlowContext';

export default function DealHealthDashboard() {
  const { dealHealth, sendNudge, quotations } = useDealFlow();
  const navigate = useNavigate();

  const handleNudge = async (alertId, quoteId) => {
    const res = await sendNudge(alertId, quoteId, 'Automated manager nudge: Please follow up on stalled deal.');
    toast.success(res.message || 'Nudge dispatched.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deal Health Monitoring & Anomaly Alerts
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            B9 Dashboard — Real-time detection of stalled quotes (&gt;7 days), rep discount anomalies, and delivery slippage with automated escalation nudges.
          </p>
        </div>

        {/* ALERTS FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STALLED DEALS & ANOMALIES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Active Anomaly & Stalled Deal Alerts ({dealHealth.alerts?.length || 0})
            </h3>

            <div className="space-y-3">
              {(dealHealth.alerts || []).map((alertItem) => (
                <div key={alertItem.id} className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {alertItem.alert_type.replace('_', ' ')}
                      </span>
                      <div className="text-sm font-bold text-slate-900 mt-1.5">Quotation #{alertItem.quote_number || alertItem.quotation_id}</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Customer: {alertItem.details?.customer_name || 'Beta Industries'} • Rep: {alertItem.details?.rep_name || 'Alex Rep'}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono font-medium">{alertItem.details?.days_inactive || 9} Days Inactive</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => navigate(`/dealflow/builder/${alertItem.quotation_id}`)}
                      className="text-xs text-indigo-700 hover:text-indigo-800 font-bold"
                    >
                      Open Quotation
                    </button>

                    <button
                      onClick={() => handleNudge(alertItem.id, alertItem.quotation_id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      Dispatch Nudge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIPELINE HEALTH SUMMARY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Pipeline Risk Distribution
            </h3>

            <div className="space-y-3">
              {quotations.map((q) => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{q.customer_name}</div>
                    <div className="text-slate-500 font-mono">{q.quote_number} • ${Number(q.total_amount || 0).toLocaleString()}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-indigo-700">Risk Score: {q.blended_risk_score}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">{q.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

