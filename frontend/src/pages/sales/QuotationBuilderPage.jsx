import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDealFlow } from '../../context/DealFlowContext';

export default function QuotationBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    quotations,
    products,
    categories,
    calculateRisk,
    fetchUpsellSuggestions,
  } = useDealFlow();

  const quoteId = id || 'quote_101';
  const existingQuote = quotations.find((q) => q.id === quoteId || q.quote_number === quoteId) || quotations[0];

  const [lines, setLines] = useState([]);
  const [orderDiscountPct, setOrderDiscountPct] = useState(0);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [upsellData, setUpsellData] = useState({ currentMarginPct: 0, suggestions: [] });
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Initialize from existing quotation
  useEffect(() => {
    if (existingQuote && existingQuote.lines) {
      setLines(
        existingQuote.lines.map((l) => ({
          productId: l.product_id,
          productName: l.product_name,
          categoryType: l.category_type || (l.product_name.includes('Service') ? 'service' : l.product_name.includes('SaaS') ? 'subscription' : 'hardware'),
          categoryCeilingPct: l.line_discount_ceiling_pct || 15,
          unitPrice: Number(l.unit_price || 0),
          costPrice: Number(l.cost_price || 0),
          quantity: Number(l.quantity || 1),
          discountPct: Number(l.discount_pct || 0),
          addedViaUpsell: Boolean(l.added_via_upsell),
          isRecurring: Boolean(l.is_recurring),
        }))
      );
      setOrderDiscountPct(Number(existingQuote.order_level_discount_pct || 0));
    }
  }, [existingQuote]);

  // Recalculate blended risk score & upsell suggestions whenever lines or discount change
  useEffect(() => {
    if (lines.length > 0) {
      calculateRisk(existingQuote?.customer_tier_code || 'gold', lines, orderDiscountPct).then((res) => {
        setRiskMetrics(res);
      });

      fetchUpsellSuggestions(quoteId, lines).then((res) => {
        setUpsellData(res);
      });
    }
  }, [lines, orderDiscountPct]);

  const handleUpdateLine = (index, field, val) => {
    const updated = [...lines];
    updated[index][field] = Number(val || 0);
    setLines(updated);
  };

  const handleRemoveLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleAddProduct = (prod) => {
    const cat = categories.find((c) => c.id === prod.category_id) || {};
    const newLine = {
      productId: prod.id,
      productName: prod.name,
      categoryType: cat.category_type || (prod.name.includes('Service') ? 'service' : prod.name.includes('SaaS') ? 'subscription' : 'hardware'),
      categoryCeilingPct: cat.discount_ceiling_pct || 15,
      unitPrice: Number(prod.base_price || 0),
      costPrice: Number(prod.cost_price || 0),
      quantity: 1,
      discountPct: 0,
      addedViaUpsell: false,
      isRecurring: prod.category_type === 'subscription' || prod.name.includes('SaaS'),
    };
    setLines([...lines, newLine]);
    setShowProductPicker(false);
  };

  const handleAddUpsellSuggestion = (sug) => {
    const targetProd = products.find((p) => p.id === sug.productId);
    if (targetProd) {
      const newLine = {
        productId: targetProd.id,
        productName: targetProd.name,
        categoryType: targetProd.category_type || 'hardware',
        categoryCeilingPct: 15,
        unitPrice: Number(targetProd.base_price || 0),
        costPrice: Number(targetProd.cost_price || 0),
        quantity: 1,
        discountPct: 0,
        addedViaUpsell: true,
        isRecurring: targetProd.category_type === 'subscription',
      };
      setLines([...lines, newLine]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900">{existingQuote?.quote_number || 'Q-2026-101'}</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-3 py-0.5 rounded-full font-bold uppercase">
                {existingQuote?.customer_name} ({existingQuote?.customer_tier_code} Tier)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Sales Rep Builder — Real-time discount governance, live margin calculation & upsell pairing.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dealflow/approvals')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold border border-slate-200 transition-colors"
            >
              View Approvals
            </button>
            <button
              onClick={() => navigate('/dealflow/fulfillment')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
            >
              <span>Fulfillment & Split</span>
            </button>
          </div>
        </div>

        {/* MAIN LAYOUT: CART + UPSELL PANEL B5 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CART & PRODUCTS (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Quotation Order Lines ({lines.length})
                </h3>
                <button
                  onClick={() => setShowProductPicker(true)}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all"
                >
                  <span>+ Add Product</span>
                </button>
              </div>

              {/* Order Lines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-600 uppercase font-bold text-[10px] bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2">Item / Category</th>
                      <th className="py-2.5 px-2">Qty</th>
                      <th className="py-2.5 px-2">Unit Price</th>
                      <th className="py-2.5 px-2">Discount %</th>
                      <th className="py-2.5 px-2">Line Total</th>
                      <th className="py-2.5 px-2">Margin</th>
                      <th className="py-2.5 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {lines.map((line, idx) => {
                      const gross = line.quantity * line.unitPrice;
                      const lineTot = gross * (1 - line.discountPct / 100);
                      const isViolation = line.discountPct > line.categoryCeilingPct;

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-semibold text-slate-900">{line.productName}</div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="uppercase font-bold text-slate-500">{line.categoryType}</span>
                              <span>• Ceiling: {line.categoryCeilingPct}%</span>
                              {line.addedViaUpsell && (
                                <span className="bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded font-bold">
                                  Upsell
                                </span>
                              )}
                              {line.isRecurring && (
                                <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                                  Recurring
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => handleUpdateLine(idx, 'quantity', e.target.value)}
                              className="w-14 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                          </td>
                          <td className="py-3 px-2 font-mono font-semibold">${line.unitPrice.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={line.discountPct}
                                onChange={(e) => handleUpdateLine(idx, 'discountPct', e.target.value)}
                                className={`w-16 bg-slate-50 border rounded-lg px-2 py-1 font-bold text-center focus:outline-none ${
                                  isViolation
                                    ? 'border-rose-300 text-rose-700 bg-rose-50'
                                    : 'border-slate-300 text-emerald-700'
                                }`}
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-bold font-mono text-slate-900">${lineTot.toLocaleString()}</td>
                          <td className="py-3 px-2 font-semibold">
                            <span className={riskMetrics?.processedLines?.[idx]?.marginPct < 10 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                              {riskMetrics?.processedLines?.[idx]?.marginPct ?? 30}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleRemoveLine(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors text-xs font-bold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Level Discount Bar */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Additional Order-Level Discount:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={orderDiscountPct}
                    onChange={(e) => setOrderDiscountPct(Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 font-bold text-slate-900 text-center"
                  />
                  <span className="text-xs text-slate-500 font-semibold">%</span>
                </div>
              </div>
            </div>

            {/* LIVE BLENDED RISK GAUGE CARD */}
            {riskMetrics && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Blended Discount Governance & Routing Preview
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Customer Tier: {riskMetrics.customerTierCode.toUpperCase()} ({riskMetrics.customerTierCeilingPct}% Limit)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Subtotal</div>
                    <div className="text-base font-extrabold text-slate-900">${riskMetrics.subtotal.toLocaleString()}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Discount Amount</div>
                    <div className="text-base font-extrabold text-amber-700">-${riskMetrics.totalDiscountAmount.toLocaleString()}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Live Margin %</div>
                    <div className="text-base font-extrabold text-emerald-700">{riskMetrics.overallMarginPct}%</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Blended Risk Score</div>
                    <div className={`text-base font-extrabold ${riskMetrics.blendedRiskScore > 15 ? 'text-rose-700' : riskMetrics.blendedRiskScore > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {riskMetrics.blendedRiskScore}
                    </div>
                  </div>
                </div>

                {/* Routing Banner */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  riskMetrics.requiresApproval
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div>
                      <span className="font-bold">Required Approval Chain: </span>
                      {riskMetrics.requiresApproval ? riskMetrics.approvalLevels.join(' ➔ ').toUpperCase() : 'None (Auto-Approved)'}
                    </div>
                  </div>
                  <span className="font-bold uppercase text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Status: {riskMetrics.suggestedStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* B5: UPSELL & CROSS-SELL SIDEBAR PANEL */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Live Upsell & Cross-Sell Suggestions
                </h3>
                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                  B5 Special Flow
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Ranked recommendations based on historical co-purchase patterns with real-time margin impact.
              </p>

              {/* Suggestions List */}
              <div className="space-y-3">
                {upsellData.suggestions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">No additional suggestions for current cart</div>
                ) : (
                  upsellData.suggestions.map((sug) => (
                    <div
                      key={sug.productId}
                      className="bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-xl p-4 space-y-2.5 shadow-2xs transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sug.productName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{sug.reason}</div>
                        </div>
                        {sug.isPromoted && (
                          <span className="bg-pink-100 text-pink-800 border border-pink-200 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                            Promoted
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                        <span className="font-mono font-bold text-indigo-700">${sug.price.toLocaleString()}</span>
                        <div className={`text-xs font-bold ${sug.marginDeltaPct >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          <span>Margin Δ: {sug.marginDeltaPct >= 0 ? `+${sug.marginDeltaPct}%` : `${sug.marginDeltaPct}%`}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddUpsellSuggestion(sug)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl shadow-2xs transition-colors flex items-center justify-center"
                      >
                        <span>+ Add to Quote</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT PICKER MODAL */}
        {showProductPicker && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Select Product Catalog Item</h3>
                <button onClick={() => setShowProductPicker(false)} className="text-slate-500 hover:text-slate-900 text-xs font-bold">Close</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddProduct(prod)}
                    className="bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 p-3 rounded-xl cursor-pointer transition-colors space-y-1"
                  >
                    <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{prod.sku} • {prod.category_name}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-indigo-700">${prod.base_price.toLocaleString()}</span>
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Add +</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

