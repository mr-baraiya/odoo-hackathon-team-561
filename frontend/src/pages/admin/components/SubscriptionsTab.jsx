import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Percent,
  X,
} from 'lucide-react';
import subscriptionService from '../../../services/subscription.service';

export default function SubscriptionsTab({ plansList: initialPlans, productList }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [cycleFilter, setCycleFilter] = useState('all');

  // Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    product_id: '',
    cycle: 'monthly',
    price_per_cycle: 199,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 7,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 14,
    early_termination_fee_pct: 0,
  });

  // Load backend database plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getSubscriptionPlans();
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans(initialPlans || []);
      }
    } catch (err) {
      console.warn('Subscription API load fallback:', err.message);
      setPlans(initialPlans || []);
    } finally {
      setLoading(false);
    }
  };

  // --- PLAN HANDLERS ---
  const handleOpenPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name || '',
        product_id: plan.product_id || productList[0]?.id || '',
        cycle: plan.cycle || 'monthly',
        price_per_cycle: plan.price_per_cycle || 199,
        proration_enabled: plan.proration_enabled !== false,
        proration_policy: plan.proration_policy || 'pro_rata_credit',
        cancellation_notice_days: plan.cancellation_notice_days || 7,
        cancellation_policy: plan.cancellation_policy || 'end_of_cycle',
        partial_refund_allowed: plan.partial_refund_allowed !== false,
        refund_window_days: plan.refund_window_days || 14,
        early_termination_fee_pct: plan.early_termination_fee_pct || 0,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        product_id: productList[0]?.id || '',
        cycle: 'monthly',
        price_per_cycle: 199,
        proration_enabled: true,
        proration_policy: 'pro_rata_credit',
        cancellation_notice_days: 7,
        cancellation_policy: 'end_of_cycle',
        partial_refund_allowed: true,
        refund_window_days: 14,
        early_termination_fee_pct: 0,
      });
    }
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      toast.error('Plan Name is required');
      return;
    }

    try {
      if (editingPlan) {
        await subscriptionService.updateSubscriptionPlan(editingPlan.id, planForm);
        setPlans(plans.map((p) => (p.id === editingPlan.id ? { ...p, ...planForm } : p)));
        toast.success(`Subscription Plan "${planForm.name}" updated in database!`);
      } else {
        const created = await subscriptionService.createSubscriptionPlan(planForm);
        setPlans([...plans, created || { ...planForm, id: `plan_${Date.now()}` }]);
        toast.success(`New Subscription Plan "${planForm.name}" created in database!`);
      }
      setShowPlanModal(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.message || 'Failed to save subscription plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await subscriptionService.deleteSubscriptionPlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
      toast.success('Subscription plan deleted from database.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete subscription plan');
    }
  };

  // Filter plans by billing cycle
  const filteredPlans = plans.filter((p) => {
    if (cycleFilter === 'all') return true;
    return (p.cycle || 'monthly').toLowerCase() === cycleFilter.toLowerCase();
  });

  // Calculate Summary Metrics
  const monthlyPlansCount = plans.filter((p) => (p.cycle || '').toLowerCase() === 'monthly').length;
  const quarterlyPlansCount = plans.filter((p) => (p.cycle || '').toLowerCase() === 'quarterly').length;
  const yearlyPlansCount = plans.filter((p) => (p.cycle || '').toLowerCase() === 'yearly').length;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading subscription plans & billing rules from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER & METRIC SUMMARY CARDS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Subscription Management & Billing Rules
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Configure recurring plans, Monthly/Quarterly/Yearly cycles, proration policies, cancellation terms, and refund windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenPlanModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create Subscription Plan
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Active Plans</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{plans.length}</div>
            <span className="text-[10px] text-slate-500">Persisted in database</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Monthly Plans</span>
            <div className="text-lg font-extrabold text-indigo-600 mt-0.5">{monthlyPlansCount}</div>
            <span className="text-[10px] text-slate-500">Recurring 30-day billing</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Quarterly Plans</span>
            <div className="text-lg font-extrabold text-emerald-600 mt-0.5">{quarterlyPlansCount}</div>
            <span className="text-[10px] text-slate-500">Recurring 90-day billing</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Yearly Plans</span>
            <div className="text-lg font-extrabold text-amber-600 mt-0.5">{yearlyPlansCount}</div>
            <span className="text-[10px] text-slate-500">Annual commit billing</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl border items-center justify-between">
        <div className="flex">
          <button
            onClick={() => setCycleFilter('all')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              cycleFilter === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Billing Cycles ({plans.length})
          </button>
          <button
            onClick={() => setCycleFilter('monthly')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              cycleFilter === 'monthly'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly ({monthlyPlansCount})
          </button>
          <button
            onClick={() => setCycleFilter('quarterly')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              cycleFilter === 'quarterly'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Quarterly ({quarterlyPlansCount})
          </button>
          <button
            onClick={() => setCycleFilter('yearly')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              cycleFilter === 'yearly'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Yearly ({yearlyPlansCount})
          </button>
        </div>
      </div>

      {/* PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredPlans.length === 0 ? (
          <div className="col-span-3 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium">
            No subscription plans found matching your selected cycle filter.
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const product = productList.find((p) => p.id === plan.product_id);
            const cycleText = (plan.cycle || 'monthly').toUpperCase();

            // Equivalent monthly cost
            const price = Number(plan.price_per_cycle || 0);
            const monthlyEquiv =
              plan.cycle === 'yearly'
                ? (price / 12).toFixed(2)
                : plan.cycle === 'quarterly'
                ? (price / 3).toFixed(2)
                : price.toFixed(2);

            return (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 space-y-4 shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* CYCLE BADGE & PRICE */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        plan.cycle === 'yearly'
                          ? 'bg-amber-100 text-amber-800'
                          : plan.cycle === 'quarterly'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {cycleText} BILLING
                    </span>

                    <div className="text-right">
                      <div className="text-xl font-black text-indigo-700 font-mono">${price}</div>
                      <span className="text-[10px] text-slate-500 font-medium">(${monthlyEquiv}/mo equiv)</span>
                    </div>
                  </div>

                  {/* PLAN NAME & PRODUCT */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Linked Product: <strong className="text-slate-800">{product?.name || plan.product_name || 'SaaS Platform'}</strong>
                    </p>
                  </div>

                  {/* RULES & POLICY HIGHLIGHTS */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    {/* PRORATION RULE */}
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Proration Rule:
                      </span>
                      <span className="font-bold text-slate-800">
                        {plan.proration_enabled ? 'Pro-Rata Credit' : 'Disabled'}
                      </span>
                    </div>

                    {/* CANCELLATION RULE */}
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Cancellation Notice:
                      </span>
                      <span className="font-bold text-slate-800">{plan.cancellation_notice_days || 7} Days Notice</span>
                    </div>

                    {/* REFUND RULE */}
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Refund Guarantee:
                      </span>
                      <span className="font-bold text-slate-800">
                        {plan.partial_refund_allowed ? `${plan.refund_window_days || 14}-Day Refund` : 'No Refund'}
                      </span>
                    </div>

                    {/* EARLY TERMINATION FEE */}
                    {plan.early_termination_fee_pct > 0 && (
                      <div className="flex justify-between items-center bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        <span className="text-rose-700 font-medium text-[11px]">Early Termination Fee:</span>
                        <span className="font-bold font-mono text-rose-800 text-[11px]">
                          {plan.early_termination_fee_pct}% Fee
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BARE ICONS ACTION BUTTONS WITHOUT BOXES */}
                <div className="pt-3 border-t border-slate-100 flex justify-end items-center gap-2">
                  <button
                    onClick={() => handleOpenPlanModal(plan)}
                    className="p-1 text-slate-500 hover:text-indigo-600 focus:outline-none cursor-pointer"
                    title="Edit Subscription Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1 text-slate-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                    title="Delete Subscription Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PLAN CREATE / EDIT MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Plan Name *</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Enterprise Annual SaaS Suite"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Linked Product</label>
                  <select
                    value={planForm.product_id}
                    onChange={(e) => setPlanForm({ ...planForm, product_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {productList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Billing Cycle *</label>
                  <select
                    value={planForm.cycle}
                    onChange={(e) => setPlanForm({ ...planForm, cycle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="monthly">Monthly Billing</option>
                    <option value="quarterly">Quarterly Billing</option>
                    <option value="yearly">Yearly Billing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Price Per Cycle ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={planForm.price_per_cycle}
                  onChange={(e) => setPlanForm({ ...planForm, price_per_cycle: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-indigo-700"
                />
              </div>

              {/* PRORATION RULES */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Proration Rules
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">Enable Mid-Cycle Proration:</span>
                  <input
                    type="checkbox"
                    checked={planForm.proration_enabled}
                    onChange={(e) => setPlanForm({ ...planForm, proration_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* CANCELLATION RULES */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Cancellation Rules
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Notice Period (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={planForm.cancellation_notice_days}
                      onChange={(e) => setPlanForm({ ...planForm, cancellation_notice_days: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Cancellation Timing</label>
                    <select
                      value={planForm.cancellation_policy}
                      onChange={(e) => setPlanForm({ ...planForm, cancellation_policy: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900"
                    >
                      <option value="end_of_cycle">End of Billing Cycle</option>
                      <option value="immediate">Immediate Cancellation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* REFUND RULES */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Refund Rules
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">Allow Partial Refunds:</span>
                  <input
                    type="checkbox"
                    checked={planForm.partial_refund_allowed}
                    onChange={(e) => setPlanForm({ ...planForm, partial_refund_allowed: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Refund Window (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={planForm.refund_window_days}
                      onChange={(e) => setPlanForm({ ...planForm, refund_window_days: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Termination Fee %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={planForm.early_termination_fee_pct}
                      onChange={(e) => setPlanForm({ ...planForm, early_termination_fee_pct: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {editingPlan ? 'Update Plan' : 'Save Plan to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
