import React, { useState, useEffect } from 'react';
import { useDealFlow } from '../../context/DealFlowContext';

export default function FulfillmentSplitPage() {
  const { quotations, getFulfillmentSplit } = useDealFlow();

  const [selectedQuoteId, setSelectedQuoteId] = useState('quote_101');
  const [splitResult, setSplitResult] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);

  const activeQuote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];

  useEffect(() => {
    if (activeQuote) {
      getFulfillmentSplit(activeQuote.id).then((res) => setSplitResult(res));
    }
  }, [selectedQuoteId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Multi-Warehouse Fulfillment & Stock Splitting
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              B6 Module — Automated warehouse distribution engine minimizing shipment count & freight costs with manual override.
            </p>
          </div>

          <div className="flex items-center space-x-3">
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
        </div>

        {/* METRICS & SPLIT RESULTS */}
        {splitResult && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fulfillment Status</div>
                <div className="text-base font-bold text-slate-900 mt-1 uppercase">
                  {splitResult.status.replace('_', ' ')}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Shipment Count</div>
                <div className="text-base font-bold text-indigo-700 mt-1">{splitResult.totalShipmentCount} Shipments</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Freight Cost</div>
                <div className="text-base font-bold text-emerald-700 mt-1">${splitResult.totalEstimatedShipmentCost}</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manual Override</div>
                <button
                  onClick={() => setManualOverride(!manualOverride)}
                  className={`mt-1.5 text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                    manualOverride ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {manualOverride ? 'Override Enabled' : 'Auto-Split Mode'}
                </button>
              </div>
            </div>

            {/* Backorder Consolidation Prompt Banner */}
            {splitResult.consolidationPrompt && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-xs text-purple-900 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{splitResult.consolidationPrompt}</span>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs">
                  Consolidate Backorders
                </button>
              </div>
            )}

            {/* WAREHOUSE ALLOCATION BREAKDOWN TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Recommended Stock Split Distribution
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Assigned Warehouse</th>
                      <th className="p-3">Fulfilled Qty</th>
                      <th className="p-3">Backordered Qty</th>
                      <th className="p-3">Estimated Freight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {splitResult.fulfillmentSplits.map((split, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{split.productName}</td>
                        <td className="p-3 font-bold text-indigo-700">{split.warehouseName}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{split.quantityFulfilled}</td>
                        <td className="p-3 font-mono text-slate-500">{split.quantityBackordered}</td>
                        <td className="p-3 font-mono font-semibold text-slate-900">${split.estimatedShipmentCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

