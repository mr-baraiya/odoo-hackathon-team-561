import React from 'react';

export default function DealHealthTab({ dealHealth }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Deal Health & Stalled Quotation Alerts</h2>
        <p className="text-xs text-slate-600">Automated monitoring for discount anomalies and stagnant sales pipelines.</p>
      </div>

      {dealHealth?.alerts && dealHealth.alerts.length > 0 ? (
        <div className="space-y-4">
          {dealHealth.alerts.map((alert) => (
            <div key={alert.id} className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
                  {alert.alert_type}
                </span>
                <span className="text-xs font-semibold text-rose-700">{alert.triggered_at}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{alert.quote_number} - {alert.customer_name}</h3>
              <p className="text-xs text-slate-700">{alert.message}</p>
              <div className="text-[11px] font-semibold text-rose-700 pt-1">
                Action Required: {alert.action_required}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
          <div className="text-sm font-bold text-emerald-900">All Deals Healthy</div>
          <p className="text-xs text-emerald-700">No discount anomalies or stalled sales quotations detected across your pipeline.</p>
        </div>
      )}
    </div>
  );
}
