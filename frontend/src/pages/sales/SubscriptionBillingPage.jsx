import React, { useState, useEffect } from 'react';
import { useDealFlow } from '../../context/DealFlowContext';

export default function SubscriptionBillingPage() {
  const { quotations, getBillingSchedule, prorateChange } = useDealFlow();

  const [selectedQuoteId, setSelectedQuoteId] = useState('quote_101');
  const [billingData, setBillingData] = useState(null);

  // Proration state
  const [origPrice, setOrigPrice] = useState(350);
  const [newPrice, setNewPrice] = useState(500);
  const [daysRemaining, setDaysRemaining] = useState(18);
  const [prorationResult, setProrationResult] = useState(null);

  const activeQuote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];

  useEffect(() => {
    if (activeQuote) {
      getBillingSchedule(activeQuote.id).then((res) => setBillingData(res));
    }
  }, [selectedQuoteId]);

  const handleCalcProration = async () => {
    const res = await prorateChange(activeQuote.id, {
      originalMonthlyPrice: origPrice,
      newMonthlyPrice: newPrice,
      daysInCycle: 30,
      daysRemaining,
    });
    setProrationResult(res);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hybrid Billing & Subscription Proration
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              B7 Module — Reconciles one-time product lines with recurring subscription schedules & mid-cycle proration rules.
            </p>
          </div>

          <select
            value={selectedQuoteId}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-mono text-indigo-700 font-bold rounded-xl p-2.5 focus:outline-none shadow-xs"
          >
            {quotations.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quote_number} — {q.customer_name}
              </option>
            ))}
          </select>
        </div>

        {/* MAIN BILLING CONTENT */}
        {billingData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ONE-TIME vs RECURRING SUMMARY (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">One-Time Hardware / Service Invoice</div>
                  <div className="text-3xl font-extrabold text-slate-900">${billingData.oneTimeSummary.amountDueNow.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium">{billingData.oneTimeSummary.lineCount} Product Lines Due Now</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Recurring Subscription Revenue</div>
                  <div className="text-3xl font-extrabold text-indigo-700">${billingData.recurringSummary.recurringMonthlyAmount.toLocaleString()} / mo</div>
                  <div className="text-xs text-slate-500 font-medium">{billingData.recurringSummary.lineCount} Active Subscription Lines</div>
                </div>
              </div>

              {/* UPCOMING BILLING SCHEDULE TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Upcoming 12-Month Recurring Billing Schedule
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Subscription Item</th>
                        <th className="p-3">Cycle</th>
                        <th className="p-3">Cycle Period</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {billingData.upcomingBillingSchedule.map((sched, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{sched.productName}</td>
                          <td className="p-3 uppercase text-[10px] text-slate-500 font-bold">{sched.billingCycle} #{sched.cycleIndex}</td>
                          <td className="p-3 text-slate-500 font-mono">{sched.cycleStartDate} to {sched.cycleEndDate}</td>
                          <td className="p-3 font-bold font-mono text-slate-900">${sched.scheduledAmount}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              sched.status === 'due_now' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {sched.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MID-CYCLE PRORATION CALCULATOR (Right col) */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Mid-Cycle Proration Calculator
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-700 font-bold mb-1 uppercase tracking-wider">Original Plan Price ($/mo)</label>
                    <input
                      type="number"
                      value={origPrice}
                      onChange={(e) => setOrigPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 font-bold mb-1 uppercase tracking-wider">New Plan Price ($/mo)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 font-bold mb-1 uppercase tracking-wider">Days Remaining in Cycle</label>
                    <input
                      type="number"
                      value={daysRemaining}
                      onChange={(e) => setDaysRemaining(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <button
                    onClick={handleCalcProration}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    Calculate Proration Balance
                  </button>
                </div>

                {/* Calculated Result Card */}
                {prorationResult && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Unused Credit:</span>
                      <span className="font-mono font-bold text-slate-900">${prorationResult.unusedOriginalCredit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">New Charge:</span>
                      <span className="font-mono font-bold text-slate-900">${prorationResult.newPeriodCharge}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                      <span>Net Adjustment:</span>
                      <span className={prorationResult.netProratedAdjustment > 0 ? 'text-amber-700 font-mono font-extrabold' : 'text-emerald-700 font-mono font-extrabold'}>
                        ${prorationResult.netProratedAdjustment}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
