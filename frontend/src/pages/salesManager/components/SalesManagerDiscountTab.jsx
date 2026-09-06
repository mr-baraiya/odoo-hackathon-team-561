import React from 'react';
import { 
  Percent, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert,
  Info,
  Loader2
} from 'lucide-react';

export default function SalesManagerDiscountTab({ discountData, loading }) {
  if (loading && !discountData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live discount governance data from database...</span>
      </div>
    );
  }

  const data = discountData || {};
  const thresholdTiers = data.threshold_tiers || [
    { tier: '0% - 5.00%', level: 'Sales Rep Direct Send', require_approval: false, auto_approved: true },
    { tier: '5.01% - 25.00%', level: 'Sales Manager Approval', require_approval: true, auto_approved: false },
    { tier: '25.01% - 50.00%', level: 'Sales Manager + Finance Dual Approval', require_approval: true, auto_approved: false },
    { tier: '> 50.00%', level: 'Strictly Blocked by Governance', require_approval: false, blocked: true }
  ];
  const repUsage = data.rep_discount_usage || [];
  const unusualDiscounts = data.unusual_discounts || [];

  return (
    <div className="space-y-6">
      {/* Policy Governance Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" /> Discount Governance Policy Tiers
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Automated discount authorization matrix governing sales representative pricing boundaries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {thresholdTiers.map((t, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border text-xs ${
                t.blocked 
                  ? 'bg-rose-50/50 border-rose-200 text-rose-900' 
                  : t.auto_approved 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : idx === 1
                  ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                  : 'bg-purple-50/50 border-purple-200 text-purple-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-sm">{t.tier}</span>
                {t.auto_approved && <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px]">Direct</span>}
                {t.blocked && <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md text-[10px]">Blocked</span>}
                {!t.auto_approved && !t.blocked && <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-md text-[10px]">Required</span>}
              </div>
              <p className="font-semibold">{t.level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monitor Sales Rep Discount Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-slate-600" /> Sales Rep Discount Monitor
          </h3>
          {repUsage.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No sales representative discount history in DB</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Sales Rep</th>
                    <th className="py-2.5 px-3 text-center">Quotes</th>
                    <th className="py-2.5 px-3 text-center">Avg Discount</th>
                    <th className="py-2.5 px-3 text-center">Max Discount</th>
                    <th className="py-2.5 px-3">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {repUsage.map((rep, idx) => (
                    <tr key={rep.rep_id || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{rep.rep_name}</td>
                      <td className="py-3 px-3 text-center">{rep.total_quotes}</td>
                      <td className="py-3 px-3 text-center font-semibold text-amber-700">{rep.avg_discount}%</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-600">{rep.max_discount}%</td>
                      <td className="py-3 px-3">
                        {rep.flag && rep.flag.includes('High') ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> High Avg
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] w-fit block">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unusual Discounts Detector */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Unusual Discount Exception Flags
          </h3>
          {unusualDiscounts.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No unusual discount exceptions found in DB</p>
          ) : (
            <div className="space-y-3">
              {unusualDiscounts.map((item, idx) => (
                <div key={item.quote_id || idx} className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-950">
                    <span>{item.quote_number} — {item.company_name}</span>
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded font-mono">{item.discount_pct}%</span>
                  </div>
                  <p className="text-slate-600">Rep: <strong>{item.rep_name}</strong></p>
                  <p className="text-rose-800 font-medium text-[11px] flex items-center gap-1">
                    <Info className="w-3 h-3 text-rose-600" /> {item.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
