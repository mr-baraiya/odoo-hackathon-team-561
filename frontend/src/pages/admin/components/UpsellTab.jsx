import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit, Trash2, RefreshCw, ArrowRight, TrendingUp,
  Zap, ShieldCheck, BarChart3, Package, X, ToggleLeft, ToggleRight,
  Star, Percent, AlertTriangle, CheckCircle2, Eye,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

// ─── UPSELL SERVICE ──────────────────────────────────────────────────────────
const upsellService = {
  getRules: () => apiClient.get('/upsell-rules'),
  createRule: (data) => apiClient.post('/upsell-rules', data),
  updateRule: (id, data) => apiClient.put(`/upsell-rules/${id}`, data),
  deleteRule: (id) => apiClient.delete(`/upsell-rules/${id}`),
  toggleRule: (id) => apiClient.patch(`/upsell-rules/${id}/toggle`, {}),
  getRecommendations: () => apiClient.get('/recommendations'),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score >= 0.85) return 'text-emerald-700 bg-emerald-100';
  if (score >= 0.65) return 'text-amber-700 bg-amber-100';
  return 'text-rose-700 bg-rose-100';
};

const marginColor = (pct) => {
  if (pct >= 25) return 'text-emerald-700';
  if (pct >= 15) return 'text-amber-600';
  return 'text-rose-600';
};

// ─── RULE MODAL ───────────────────────────────────────────────────────────────
function RuleModal({ rule, products, onSave, onClose }) {
  const [form, setForm] = useState({
    base_product_id: rule?.base_product_id || products[0]?.id || '',
    suggested_product_id: rule?.suggested_product_id || products[1]?.id || '',
    co_purchase_score: rule?.co_purchase_score ?? 0.80,
    min_margin_pct_required: rule?.min_margin_pct_required ?? 15,
    is_active: rule?.is_active !== false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.base_product_id || !form.suggested_product_id)
      return toast.error('Both products are required');
    if (form.base_product_id === form.suggested_product_id)
      return toast.error('Base and suggested products must be different');
    onSave(form);
  };

  const baseProd = products.find((p) => p.id === form.base_product_id);
  const sugProd = products.find((p) => p.id === form.suggested_product_id);
  const basePrice = Number(baseProd?.base_price || 0);
  const sugCost = Number(sugProd?.cost_price || 0);
  const sugPrice = Number(sugProd?.base_price || 0);
  const standaloneMgn = sugPrice > 0 ? ((sugPrice - sugCost) / sugPrice) * 100 : 0;
  const meetsMargin = standaloneMgn >= form.min_margin_pct_required;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {rule ? 'Edit Pairing Rule' : 'Create Pairing Rule'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Product Selects */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Trigger Product *</label>
              <select
                value={form.base_product_id}
                onChange={(e) => set('base_product_id', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {baseProd && (
                <p className="text-slate-500 font-mono">${Number(baseProd.base_price || 0).toFixed(0)} base price</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Suggested Product *</label>
              <select
                value={form.suggested_product_id}
                onChange={(e) => set('suggested_product_id', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {sugProd && (
                <p className={`font-mono font-semibold ${marginColor(standaloneMgn)}`}>
                  ${sugPrice.toFixed(0)} • {standaloneMgn.toFixed(1)}% margin
                </p>
              )}
            </div>
          </div>

          {/* Live Arrow Preview */}
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg px-2 py-1 truncate max-w-[35%]">
              {baseProd?.name || '—'}
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-lg px-2 py-1 truncate max-w-[35%]">
              {sugProd?.name || '—'}
            </span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${meetsMargin ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {meetsMargin ? '✓ Margin OK' : '✗ Below Threshold'}
            </span>
          </div>

          {/* Score & Margin */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Co-Purchase Score (0–1)
              </label>
              <input
                type="number" min="0" max="1" step="0.01"
                value={form.co_purchase_score}
                onChange={(e) => set('co_purchase_score', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-slate-500">Likelihood of co-purchase (0–1)</p>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Min Margin Required (%)
              </label>
              <input
                type="number" min="0" max="100" step="0.5"
                value={form.min_margin_pct_required}
                onChange={(e) => set('min_margin_pct_required', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-slate-500">Won't suggest if margin is below this</p>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="font-semibold text-slate-700">Rule Status</span>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {form.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {form.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
            >
              {rule ? 'Update Rule' : 'Save to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UpsellTab({ upsellRules: initialRules = [], productList = [] }) {
  const [activeSection, setActiveSection] = useState('pairing');
  const [loading, setLoading] = useState(true);

  // Pairing rules state
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  // Promotion rules (local config — no dedicated DB table)
  const [promotionRules, setPromotionRules] = useState([
    { id: 'promo_1', name: 'Bundle Discount', description: 'Apply 10% off when 3+ products from same category are added', discount_pct: 10, trigger_qty: 3, is_active: true },
    { id: 'promo_2', name: 'Cross-Category Bonus', description: 'Apply 5% off when Hardware + SaaS products co-exist in quote', discount_pct: 5, trigger_qty: 1, is_active: true },
    { id: 'promo_3', name: 'First Order Incentive', description: 'Apply 15% off for new customers on first purchase over $5,000', discount_pct: 15, trigger_qty: 1, is_active: false },
  ]);

  // Margin rules (local config)
  const [marginRules, setMarginRules] = useState([
    { id: 'mgn_1', label: 'Global Minimum Margin', value: 15, unit: '%', description: 'No upsell suggestion is shown if standalone margin < 15%', color: 'emerald' },
    { id: 'mgn_2', label: 'Hardware Floor', value: 18, unit: '%', description: 'Hardware products must maintain ≥18% gross margin to appear as upsell', color: 'indigo' },
    { id: 'mgn_3', label: 'SaaS License Floor', value: 25, unit: '%', description: 'SaaS/subscription products must maintain ≥25% gross margin', color: 'violet' },
    { id: 'mgn_4', label: 'Services Floor', value: 30, unit: '%', description: 'Professional Services require ≥30% margin before recommendation', color: 'amber' },
  ]);
  const [editingMargin, setEditingMargin] = useState(null);

  const SECTIONS = [
    { id: 'pairing', label: 'Product Pairing Rules', icon: ArrowRight },
    { id: 'recommendations', label: 'Live Recommendations', icon: Zap },
    { id: 'promotions', label: 'Promotion Rules', icon: Star },
    { id: 'margins', label: 'Minimum Margin Rules', icon: ShieldCheck },
  ];

  // ── DATA LOADING ────────────────────────────────────────────────────────────
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await upsellService.getRules();
      if (Array.isArray(data)) setRules(data);
      else setRules(initialRules);
    } catch (err) {
      console.warn('Upsell rules fallback:', err.message);
      setRules(initialRules);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      const data = await upsellService.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.warn('Recommendations fallback:', err.message);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);
  useEffect(() => {
    if (activeSection === 'recommendations') fetchRecommendations();
  }, [activeSection, fetchRecommendations]);

  // ── RULE HANDLERS ───────────────────────────────────────────────────────────
  const handleSaveRule = async (formData) => {
    try {
      if (editingRule) {
        await upsellService.updateRule(editingRule.id, formData);
        toast.success('Pairing rule updated in database!');
      } else {
        await upsellService.createRule(formData);
        toast.success('Pairing rule created in database!');
      }
      setShowModal(false);
      setEditingRule(null);
      fetchRules();
    } catch (err) {
      toast.error(err.message || 'Failed to save rule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pairing rule from the database?')) return;
    try {
      await upsellService.deleteRule(id);
      setRules(rules.filter((r) => r.id !== id));
      toast.success('Pairing rule deleted from database.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await upsellService.toggleRule(id);
      setRules(rules.map((r) => r.id === id ? { ...r, is_active: !r.is_active } : r));
      toast.success('Rule status updated in database.');
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    }
  };

  // ── PROMO HANDLERS ──────────────────────────────────────────────────────────
  const togglePromo = (id) => {
    setPromotionRules(promotionRules.map((p) => p.id === id ? { ...p, is_active: !p.is_active } : p));
    toast.success('Promotion rule updated.');
  };

  // ── MARGIN HANDLERS ─────────────────────────────────────────────────────────
  const handleMarginUpdate = (id, newValue) => {
    setMarginRules(marginRules.map((m) => m.id === id ? { ...m, value: newValue } : m));
    if (editingMargin === id) setEditingMargin(null);
    toast.success('Margin rule updated.');
  };

  // ── STATS ────────────────────────────────────────────────────────────────────
  const activeRules = rules.filter((r) => r.is_active).length;
  const avgScore = rules.length > 0
    ? (rules.reduce((s, r) => s + Number(r.co_purchase_score || 0), 0) / rules.length * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-5">
      {/* ── HEADER & METRICS ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Upsell &amp; Cross-Sell Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure product pairing rules, promotion incentives, and minimum margin guardrails.
            </p>
          </div>
          {activeSection === 'pairing' && (
            <button
              onClick={() => { setEditingRule(null); setShowModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pairing Rule
            </button>
          )}
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Rules', value: rules.length, sub: 'In database', color: 'text-slate-900' },
            { label: 'Active Rules', value: activeRules, sub: 'Generating suggestions', color: 'text-emerald-700' },
            { label: 'Avg Co-Purchase Score', value: `${avgScore}%`, sub: 'Likelihood', color: 'text-indigo-700' },
            { label: 'Promotion Rules', value: promotionRules.filter((p) => p.is_active).length, sub: 'Active incentives', color: 'text-amber-700' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</span>
              <div className={`text-lg font-extrabold mt-0.5 ${m.color}`}>{m.value}</div>
              <span className="text-[10px] text-slate-500">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-100">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-[11px] font-bold transition-colors cursor-pointer border-b-2 ${
                activeSection === id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ══ PAIRING RULES ══════════════════════════════════════════════════ */}
          {activeSection === 'pairing' && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Loading rules from database…</span>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ArrowRight className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No pairing rules configured yet.</p>
                  <p className="text-xs mt-1">Click "Add Pairing Rule" to create your first product recommendation pair.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Trigger Product</th>
                        <th className="text-center py-2 px-2 text-slate-500 font-bold uppercase text-[10px] hidden sm:table-cell"></th>
                        <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Suggested Product</th>
                        <th className="text-center py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Score</th>
                        <th className="text-center py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Min Margin</th>
                        <th className="text-center py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Status</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rules.map((rule) => {
                        const score = Number(rule.co_purchase_score || 0);
                        const sugPrice = Number(rule.suggested_price || 0);
                        const sugCost = Number(rule.suggested_cost || 0);
                        const standaloneMargin = sugPrice > 0 ? ((sugPrice - sugCost) / sugPrice) * 100 : 0;
                        const meetsMargin = standaloneMargin >= Number(rule.min_margin_pct_required || 0);

                        return (
                          <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800 leading-tight">
                                {rule.base_product_name || rule.trigger_product || '—'}
                              </div>
                              {rule.base_product_sku && (
                                <div className="text-[10px] font-mono text-slate-400">{rule.base_product_sku}</div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center hidden sm:table-cell">
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 inline" />
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-indigo-700 leading-tight">
                                {rule.suggested_product_name || rule.suggested_product || '—'}
                              </div>
                              {rule.suggested_product_sku && (
                                <div className="text-[10px] font-mono text-slate-400">{rule.suggested_product_sku}</div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreColor(score)}`}>
                                {(score * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`font-bold font-mono ${meetsMargin ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {Number(rule.min_margin_pct_required || 0).toFixed(0)}%
                              </span>
                              {!meetsMargin && sugPrice > 0 && (
                                <AlertTriangle className="w-3 h-3 text-rose-500 inline ml-1" title="Suggested product doesn't meet margin floor" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleToggle(rule.id)}
                                title="Toggle active status"
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                                  rule.is_active
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                }`}
                              >
                                {rule.is_active ? '● Active' : '○ Off'}
                              </button>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => { setEditingRule(rule); setShowModal(true); }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                                  title="Edit rule"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(rule.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete rule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ LIVE RECOMMENDATIONS ════════════════════════════════════════════ */}
          {activeSection === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Real-time suggestion engine output — computed from active pairing rules and product catalog margins.
                </p>
                <button
                  onClick={fetchRecommendations}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {recLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Running recommendation engine…</span>
                </div>
              ) : !recommendations ? (
                <div className="text-center py-10 text-slate-400 text-xs">No recommendations loaded.</div>
              ) : (
                <div className="space-y-3">
                  {/* Current Margin Summary */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                    <BarChart3 className="w-6 h-6 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-indigo-800">Engine Output</div>
                      <div className="text-[11px] text-indigo-600">
                        Current basket margin: <strong className="font-mono">{recommendations.currentMarginPct ?? 0}%</strong> ·
                        {' '}{recommendations.suggestions?.length || 0} suggestions generated
                      </div>
                    </div>
                  </div>

                  {(!recommendations.suggestions || recommendations.suggestions.length === 0) ? (
                    <div className="text-center py-8 text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold">No recommendations generated.</p>
                      <p className="text-xs mt-1">Add pairing rules or promote products to see results.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.suggestions.map((s, i) => (
                        <div
                          key={s.productId}
                          className="bg-white border border-slate-200 hover:border-indigo-200 rounded-xl p-4 space-y-2 transition-all shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-slate-900 leading-tight">{s.productName}</div>
                                {s.sku && <div className="text-[10px] font-mono text-slate-400">{s.sku}</div>}
                              </div>
                            </div>
                            {s.isPromoted && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
                                ★ Promoted
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div className="bg-slate-50 rounded-lg p-2 text-center">
                              <div className="text-slate-400 font-medium text-[9px] uppercase">Price</div>
                              <div className="font-bold text-slate-800 font-mono">${s.price.toFixed(0)}</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2 text-center">
                              <div className="text-slate-400 font-medium text-[9px] uppercase">Margin</div>
                              <div className={`font-bold font-mono ${marginColor(s.standaloneMarginPct)}`}>
                                {s.standaloneMarginPct.toFixed(1)}%
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2 text-center">
                              <div className="text-slate-400 font-medium text-[9px] uppercase">Score</div>
                              <div className="font-bold text-indigo-700 font-mono">{(s.rankScore * 100).toFixed(0)}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">{s.reason}</span>
                            <span className={`flex items-center gap-0.5 font-bold ${s.isMarginPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {s.isMarginPositive ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {s.isMarginPositive ? '+' : ''}{s.marginDeltaPct}% margin impact
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ PROMOTION RULES ════════════════════════════════════════════════ */}
          {activeSection === 'promotions' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Configure automatic promotion incentives applied when pairing conditions are met in a quotation.
              </p>
              {promotionRules.map((promo) => (
                <div
                  key={promo.id}
                  className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    promo.is_active
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Star className={`w-3.5 h-3.5 ${promo.is_active ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-900">{promo.name}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {promo.discount_pct}% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">{promo.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => togglePromo(promo.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                        promo.is_active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      {promo.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {promo.is_active ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 text-[11px]">
                <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-indigo-700">
                  Promotion discounts are automatically applied during quotation calculation when all trigger conditions are satisfied.
                </span>
              </div>
            </div>
          )}

          {/* ══ MINIMUM MARGIN RULES ═══════════════════════════════════════════ */}
          {activeSection === 'margins' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Define minimum gross margin thresholds that must be maintained before a product is recommended as an upsell or cross-sell.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marginRules.map((rule) => {
                  const colorMap = {
                    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'focus:ring-emerald-400' },
                    indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  ring: 'focus:ring-indigo-400'  },
                    violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  ring: 'focus:ring-violet-400'  },
                    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   ring: 'focus:ring-amber-400'   },
                  };
                  const colors = colorMap[rule.color] || colorMap.emerald;

                  return (
                    <div key={rule.id} className={`${colors.bg} ${colors.border} border rounded-xl p-4 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`w-4 h-4 ${colors.text}`} />
                          <span className="text-xs font-bold text-slate-900">{rule.label}</span>
                        </div>
                        <button
                          onClick={() => setEditingMargin(editingMargin === rule.id ? null : rule.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80`}
                        >
                          {editingMargin === rule.id ? 'Cancel' : 'Edit'}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500">{rule.description}</p>

                      {editingMargin === rule.id ? (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="number" min="0" max="100" step="0.5"
                            defaultValue={rule.value}
                            id={`margin-input-${rule.id}`}
                            className={`w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-bold ${colors.text} focus:ring-2 ${colors.ring} focus:outline-none text-xs`}
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                          <button
                            onClick={() => {
                              const val = Number(document.getElementById(`margin-input-${rule.id}`)?.value || rule.value);
                              handleMarginUpdate(rule.id, val);
                            }}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer text-white bg-slate-700 hover:bg-slate-900`}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-black font-mono ${colors.text}`}>{rule.value}</span>
                          <span className={`text-sm font-bold ${colors.text}`}>%</span>
                          <span className="text-[10px] text-slate-400 ml-1">minimum floor</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-800 text-white rounded-xl p-4 text-[11px] space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> How Margin Rules Work
                </div>
                <p className="text-slate-400 leading-relaxed">
                  When the recommendation engine evaluates products, it checks the product's standalone gross margin
                  against the applicable floor rule. If margin falls below the floor, the product is <strong className="text-white">excluded</strong> from
                  suggestions even if a pairing rule exists. This protects deal profitability.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <RuleModal
          rule={editingRule}
          products={productList}
          onSave={handleSaveRule}
          onClose={() => { setShowModal(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
}
