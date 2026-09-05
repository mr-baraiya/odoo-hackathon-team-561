import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealFlow } from '../../context/DealFlowContext';

export default function PipelinePage() {
  const { quotations, customers, createQuotation } = useDealFlow();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('cust_acme');

  const STAGES = [
    { key: 'draft', title: 'Draft', color: 'border-slate-300 bg-slate-100 text-slate-700' },
    { key: 'pending_approval', title: 'Pending Approval', color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { key: 'under_negotiation', title: 'In Customer Portal', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { key: 'approved', title: 'Approved', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
    { key: 'confirmed', title: 'Confirmed / Billing', color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
    { key: 'fulfilled', title: 'Fulfilled', color: 'border-purple-300 bg-purple-50 text-purple-800' },
  ];

  const handleCreateNewQuote = async () => {
    const cust = customers.find((c) => c.id === selectedCustomer) || customers[0];
    const newQuote = await createQuotation({
      customerId: cust.id,
      salesRepId: 'user_rep_1',
      lineItems: [
        {
          productId: 'prod_srv',
          productName: 'Enterprise Dual-Socket Rack Server',
          categoryType: 'hardware',
          categoryCeilingPct: 15,
          unitPrice: 4500,
          costPrice: 2700,
          quantity: 1,
          discountPct: 12,
        },
      ],
      orderDiscountPct: 0,
    });
    setShowCreateModal(false);
    navigate(`/dealflow/builder/${newQuote.id}`);
  };

  const getRiskScoreBadge = (score) => {
    const s = Number(score || 0);
    if (s > 15) return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">High Risk ({s})</span>;
    if (s > 0) return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Mod Risk ({s})</span>;
    return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Clean (0.0)</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sales Quotation Pipeline
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Kanban deal flow engine with live discount governance, blended risk scores & portal negotiation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-white border border-slate-200 p-1 rounded-xl flex space-x-1 shadow-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>List</span>
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <span>+ Create Quotation</span>
            </button>
          </div>
        </div>

        {/* KANBAN VIEW */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageQuotes = quotations.filter((q) => q.status === stage.key);
              const columnTotal = stageQuotes.reduce((acc, q) => acc + Number(q.total_amount || 0), 0);

              return (
                <div key={stage.key} className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col h-full min-w-[240px] shadow-sm">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${stage.color}`}>
                        {stage.title}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">({stageQuotes.length})</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-900">${columnTotal.toLocaleString()}</span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 scrollbar-thin">
                    {stageQuotes.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                        No deals in stage
                      </div>
                    ) : (
                      stageQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          onClick={() => navigate(`/dealflow/builder/${quote.id}`)}
                          className="bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl p-3 cursor-pointer shadow-2xs transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                {quote.customer_name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">{quote.quote_number}</div>
                            </div>
                            <span className="text-xs font-bold text-indigo-700">${Number(quote.total_amount || 0).toLocaleString()}</span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            {getRiskScoreBadge(quote.blended_risk_score)}
                            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">{quote.customer_tier_code}</span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate max-w-[120px] font-medium">Rep: {quote.sales_rep_name || 'Alex Rep'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Quote #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Tier</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Blended Risk</th>
                  <th className="p-3.5">Sales Rep</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono text-indigo-700 font-bold">{quote.quote_number}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{quote.customer_name}</td>
                    <td className="p-3.5 uppercase text-[10px] text-slate-500 font-bold">{quote.customer_tier_code}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">${Number(quote.total_amount || 0).toLocaleString()}</td>
                    <td className="p-3.5">{getRiskScoreBadge(quote.blended_risk_score)}</td>
                    <td className="p-3.5 text-slate-600">{quote.sales_rep_name || 'Alex Rep'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate(`/dealflow/builder/${quote.id}`)}
                        className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-1 rounded-lg transition-colors font-semibold shadow-2xs"
                      >
                        Open Builder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CREATE QUOTATION MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900">Create New Quotation</h3>
              <p className="text-xs text-slate-600">Select a customer account to launch a self-governing quotation builder session.</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Customer Account</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.tier_code.toUpperCase()} Tier)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewQuote}
                  className="text-xs px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Start Quotation Builder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

