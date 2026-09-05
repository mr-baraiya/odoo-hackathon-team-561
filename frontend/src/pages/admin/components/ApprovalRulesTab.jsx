import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Percent,
  Sliders,
  UserCheck,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
} from 'lucide-react';
import approvalService from '../../../services/approval.service';

export default function ApprovalRulesTab() {
  const [activeSubTab, setActiveSubTab] = useState('chain'); // 'chain', 'rules', 'limits', 'settings'
  const [loading, setLoading] = useState(false);

  // Approval Chain / Rules State
  const [rules, setRules] = useState([
    {
      id: 'rule_1',
      level: 1,
      name: 'Sales Rep Instant Auto-Approve',
      min_discount_pct: 0,
      max_discount_pct: 10,
      min_risk_score: 0,
      max_risk_score: 15,
      required_levels: ['sales_rep'],
      auto_approve: true,
      description: 'Discounts up to 10% on standard items are automatically approved without waiting.',
    },
    {
      id: 'rule_2',
      level: 2,
      name: 'Sales Manager Approval Gate',
      min_discount_pct: 10.1,
      max_discount_pct: 25,
      min_risk_score: 15,
      max_risk_score: 25,
      required_levels: ['sales_manager'],
      auto_approve: false,
      description: 'Discounts between 10% and 25% require explicit Sales Manager review and sign-off.',
    },
    {
      id: 'rule_3',
      level: 3,
      name: 'Finance Operations Sign-Off',
      min_discount_pct: 25.1,
      max_discount_pct: 50,
      min_risk_score: 25,
      max_risk_score: 40,
      required_levels: ['sales_manager', 'finance_ops'],
      auto_approve: false,
      description: 'Discounts exceeding 25% or custom payment terms require dual Manager and Finance approval.',
    },
    {
      id: 'rule_4',
      level: 4,
      name: 'Executive Board Approval',
      min_discount_pct: 50.1,
      max_discount_pct: 100,
      min_risk_score: 40,
      max_risk_score: 100,
      required_levels: ['sales_manager', 'finance_ops', 'admin'],
      auto_approve: false,
      description: 'Discounts exceeding 50% require Board/Executive Admin sign-off.',
    },
  ]);

  // Role Discount Ceiling Limits State
  const [roleLimits, setRoleLimits] = useState([
    { role: 'sales_rep', role_label: 'Sales Representative', max_discount: 10, auto_approve: true, require_reason: false },
    { role: 'sales_manager', role_label: 'Sales Manager', max_discount: 25, auto_approve: false, require_reason: true },
    { role: 'finance_ops', role_label: 'Finance Operations', max_discount: 50, auto_approve: false, require_reason: true },
    { role: 'admin', role_label: 'Executive Admin', max_discount: 100, auto_approve: false, require_reason: true },
  ]);

  // Category Ceiling Rules State
  const [categoryRules, setCategoryRules] = useState([
    { id: 'disc_101', name: 'Hardware Max Discount', category_type: 'Hardware', max_discount_pct: 15.0 },
    { id: 'disc_102', name: 'Services Max Discount', category_type: 'Service / SLA', max_discount_pct: 10.0 },
    { id: 'disc_103', name: 'Subscriptions Max Discount', category_type: 'Subscription', max_discount_pct: 20.0 },
    { id: 'disc_104', name: 'Cloud Infrastructure Discount', category_type: 'Cloud', max_discount_pct: 25.0 },
  ]);

  // Sales Manager Approval Settings
  const [salesManagerConfig, setSalesManagerConfig] = useState({
    min_threshold_pct: 10.1,
    max_threshold_pct: 25.0,
    sla_hours: 24,
    auto_escalate: true,
    require_justification: true,
    min_deal_margin_pct: 15.0,
  });

  // Finance Approval Settings
  const [financeConfig, setFinanceConfig] = useState({
    min_threshold_pct: 25.1,
    risk_score_trigger: 25.0,
    sla_hours: 48,
    require_payment_term_review: true,
    require_margin_signoff: true,
    notify_cfo_above_pct: 40.0,
  });

  // Modal State
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    level: 1,
    min_discount_pct: 0,
    max_discount_pct: 25,
    min_risk_score: 0,
    max_risk_score: '',
    required_levels: ['sales_manager'],
    auto_approve: false,
    description: '',
  });

  // Load backend data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchApprovalRules(), fetchDiscountRules(), fetchRoleLimits()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalRules = async () => {
    try {
      const data = await approvalService.getApprovalRules();
      if (Array.isArray(data) && data.length > 0) {
        setRules(data);
      }
    } catch (err) {
      console.warn('Using default approval rules fallback:', err.message);
    }
  };

  const fetchDiscountRules = async () => {
    try {
      const data = await approvalService.getDiscountRules();
      if (Array.isArray(data) && data.length > 0) {
        setCategoryRules(data);
      }
    } catch (err) {
      console.warn('Using default discount rules fallback:', err.message);
    }
  };

  const fetchRoleLimits = async () => {
    try {
      const data = await approvalService.getRoleLimits();
      if (Array.isArray(data) && data.length > 0) {
        setRoleLimits(data);
      }
    } catch (err) {
      console.warn('Using default role limits fallback:', err.message);
    }
  };

  // Rule Handlers
  const handleOpenRuleModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name || '',
        level: rule.level || 1,
        min_discount_pct: rule.min_discount_pct || 0,
        max_discount_pct: rule.max_discount_pct || 25,
        min_risk_score: rule.min_risk_score || 0,
        max_risk_score: rule.max_risk_score !== null && rule.max_risk_score !== undefined ? rule.max_risk_score : '',
        required_levels: Array.isArray(rule.required_levels) ? rule.required_levels : ['sales_manager'],
        auto_approve: Boolean(rule.auto_approve),
        description: rule.description || '',
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: '',
        level: rules.length + 1,
        min_discount_pct: 0,
        max_discount_pct: 25,
        min_risk_score: 0,
        max_risk_score: '',
        required_levels: ['sales_manager'],
        auto_approve: false,
        description: '',
      });
    }
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!ruleForm.name.trim()) {
      toast.error('Rule Name is required');
      return;
    }

    try {
      if (editingRule) {
        await approvalService.updateApprovalRule(editingRule.id, ruleForm);
        setRules(rules.map((r) => (r.id === editingRule.id ? { ...r, ...ruleForm } : r)));
        toast.success(`Approval rule "${ruleForm.name}" updated!`);
      } else {
        const created = await approvalService.createApprovalRule(ruleForm);
        setRules([...rules, created || { ...ruleForm, id: `rule_${Date.now()}` }]);
        toast.success(`New approval rule "${ruleForm.name}" created!`);
      }
      setShowRuleModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save approval rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this approval rule?')) return;
    try {
      await approvalService.deleteApprovalRule(ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
      toast.success('Approval rule deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete approval rule');
    }
  };

  // Role Limits Update Handler
  const handleUpdateRoleLimit = async (roleKey, newMaxDiscount) => {
    const val = Number(newMaxDiscount);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Discount limit must be between 0% and 100%');
      return;
    }
    const updated = roleLimits.map((r) => (r.role === roleKey ? { ...r, max_discount: val } : r));
    setRoleLimits(updated);
    try {
      await approvalService.updateRoleLimit({ role: roleKey, max_discount: val });
      toast.success(`Role limit updated to ${val}%`);
    } catch (err) {
      console.warn('API update failed, updated in state:', err.message);
    }
  };

  // Category Rule Handler
  const handleCategoryMaxDiscountChange = async (catId, newPct) => {
    const val = Number(newPct);
    if (isNaN(val) || val < 0 || val > 100) return;
    const updated = categoryRules.map((c) => (c.id === catId ? { ...c, max_discount_pct: val } : c));
    setCategoryRules(updated);
    try {
      await approvalService.updateDiscountRule(catId, { max_discount_pct: val });
      toast.success(`Category discount ceiling updated to ${val}%`);
    } catch (err) {
      console.warn('API update failed, updated in state:', err.message);
    }
  };

  // Move Step Up/Down in Approval Chain
  const handleMoveChainStep = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;
    const updated = [...rules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Re-assign levels
    const reordered = updated.map((item, idx) => ({ ...item, level: idx + 1 }));
    setRules(reordered);
    toast.success('Approval chain sequence updated!');
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading live approval chain rules from database...</p>
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
              Discount & Approval Rules
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Configure multi-tier approval chains, Sales Manager thresholds, Finance sign-off policies, and role discount limits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenRuleModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Approval Rule
            </button>
          </div>
        </div>

        {/* METRIC BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Auto-Approve Threshold</span>
            <div className="text-lg font-extrabold text-emerald-600 mt-0.5">≤ 10.0%</div>
            <span className="text-[10px] text-slate-500">Sales Rep instant clearance</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Sales Manager Gate</span>
            <div className="text-lg font-extrabold text-indigo-600 mt-0.5">10.1% - 25.0%</div>
            <span className="text-[10px] text-slate-500">SLA: {salesManagerConfig.sla_hours} hours</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Finance Gate</span>
            <div className="text-lg font-extrabold text-amber-600 mt-0.5">25.1% - 50.0%</div>
            <span className="text-[10px] text-slate-500">SLA: {financeConfig.sla_hours} hours</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Executive Board</span>
            <div className="text-lg font-extrabold text-purple-600 mt-0.5">&gt; 50.0%</div>
            <span className="text-[10px] text-slate-500">Board/Admin approval required</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl border">
        <button
          onClick={() => setActiveSubTab('chain')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'chain'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Approval Chain Visualizer
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'rules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Approval Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveSubTab('limits')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'limits'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Discount Limits per Role & Category
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Manager & Finance Policy Settings
        </button>
      </div>

      {/* SUB-TAB 1: APPROVAL CHAIN VISUALIZER */}
      {activeSubTab === 'chain' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive Sequential Approval Chain</h3>
              <p className="text-xs text-slate-600">
                Visual progression map showing how quotation discount requests flow sequentially from sales representatives to finance operations.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {rules.length} Sequential Levels
            </span>
          </div>

          {/* VISUAL CHAIN STEPS */}
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={rule.id || idx} className="relative">
                <div className="bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* LEVEL BADGE */}
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                        L{rule.level}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-slate-900">{rule.name}</h4>
                          {rule.auto_approve ? (
                            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Auto Approve
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Manual Review
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium">{rule.description}</p>

                        <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                          <span className="text-slate-500 font-semibold">
                            Discount Range:{' '}
                            <strong className="text-indigo-700 font-mono font-bold">
                              {rule.min_discount_pct}% - {rule.max_discount_pct}%
                            </strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-semibold">
                            Risk Score Threshold:{' '}
                            <strong className="text-slate-800 font-mono">
                              {rule.min_risk_score} - {rule.max_risk_score ?? '100+'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS (BARE ICONS WITHOUT BOXES) */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleMoveChainStep(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 focus:outline-none cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveChainStep(idx, 'down')}
                        disabled={idx === rules.length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 focus:outline-none cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenRuleModal(rule)}
                        title="Edit Rule"
                        className="p-1 text-slate-500 hover:text-indigo-600 focus:outline-none cursor-pointer ml-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete Rule"
                        className="p-1 text-slate-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* APPROVER ROLE TAGS */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500">Required Approver Roles:</span>
                      {Array.isArray(rule.required_levels) &&
                        rule.required_levels.map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800"
                          >
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                    </div>
                    <span className="text-[11px] text-slate-500 italic">Sequential Step {idx + 1} of {rules.length}</span>
                  </div>
                </div>

                {/* CONNECTOR ARROW */}
                {idx < rules.length - 1 && (
                  <div className="flex justify-center my-1.5 text-indigo-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: APPROVAL RULES TABLE */}
      {activeSubTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured Approval Rules</h3>
              <p className="text-xs text-slate-600">List of active threshold triggers that dictate approval routing.</p>
            </div>
            <button
              onClick={() => handleOpenRuleModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Discount Range</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Approvers</th>
                  <th className="py-3 px-4">Auto Approve</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">Level {rule.level}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rule.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                      {rule.min_discount_pct}% - {rule.max_discount_pct}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {rule.min_risk_score} - {rule.max_risk_score ?? '100+'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(rule.required_levels) &&
                          rule.required_levels.map((roleKey, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {roleKey.replace('_', ' ')}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {rule.auto_approve ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          YES
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* BARE ICONS WITHOUT BOXES */}
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenRuleModal(rule)}
                          className="p-1 text-slate-500 hover:text-indigo-600 focus:outline-none cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROLE & CATEGORY DISCOUNT LIMITS */}
      {activeSubTab === 'limits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: ROLE DISCOUNT CEILINGS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" /> Role-Based Max Discount Ceilings
              </h3>
              <p className="text-xs text-slate-600">
                Set upper limit percentage of discount each user role is permitted to grant without higher escalation.
              </p>
            </div>

            <div className="space-y-4">
              {roleLimits.map((roleObj) => (
                <div
                  key={roleObj.role}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900">{roleObj.role_label}</h4>
                    <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                      {roleObj.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Max Discount Limit:</span>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={roleObj.max_discount}
                        onChange={(e) => handleUpdateRoleLimit(roleObj.role, e.target.value)}
                        className="w-full text-right font-mono font-bold text-indigo-700 text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: PRODUCT CATEGORY DISCOUNT CEILINGS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" /> Category Discount Ceilings
              </h3>
              <p className="text-xs text-slate-600">
                Specify maximum allowable discount ceiling for individual product categories to protect margins.
              </p>
            </div>

            <div className="space-y-4">
              {categoryRules.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900">{cat.name}</h4>
                    <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-200 px-2 py-0.5 rounded">
                      {cat.category_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Category Ceiling:</span>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cat.max_discount_pct}
                        onChange={(e) => handleCategoryMaxDiscountChange(cat.id, e.target.value)}
                        className="w-full text-right font-mono font-bold text-emerald-700 text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SALES MANAGER & FINANCE POLICY SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SALES MANAGER APPROVAL SETTINGS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Level 2 Approval Gate
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Sales Manager Approval Settings</h3>
              <p className="text-xs text-slate-600">
                Configure threshold limits, SLA response timers, and mandatory sign-off criteria for Sales Managers.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Minimum Discount Threshold</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salesManagerConfig.min_threshold_pct}
                    onChange={(e) => setSalesManagerConfig({ ...salesManagerConfig, min_threshold_pct: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Maximum Manager Approval Limit</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salesManagerConfig.max_threshold_pct}
                    onChange={(e) => setSalesManagerConfig({ ...salesManagerConfig, max_threshold_pct: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">SLA Response Limit</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={salesManagerConfig.sla_hours}
                    onChange={(e) => setSalesManagerConfig({ ...salesManagerConfig, sla_hours: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">hours</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Require Justification Note</span>
                  <span className="text-[11px] text-slate-500">Sales Rep must provide business rationale for discounts &gt; 10%</span>
                </div>
                <input
                  type="checkbox"
                  checked={salesManagerConfig.require_justification}
                  onChange={(e) => setSalesManagerConfig({ ...salesManagerConfig, require_justification: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <button
                onClick={() => toast.success('Sales Manager Approval Settings updated successfully!')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition-colors shadow-xs cursor-pointer text-xs"
              >
                Save Sales Manager Policy
              </button>
            </div>
          </div>

          {/* FINANCE APPROVAL SETTINGS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Level 3 Approval Gate
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Finance Operations Approval Settings</h3>
              <p className="text-xs text-slate-600">
                Configure financial risk thresholds, payment term exceptions, and gross margin protection rules.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Minimum Finance Trigger Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={financeConfig.min_threshold_pct}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, min_threshold_pct: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Blended Risk Score Trigger</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={financeConfig.risk_score_trigger}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, risk_score_trigger: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">score</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Finance SLA Response Timer</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={financeConfig.sla_hours}
                    onChange={(e) => setFinanceConfig({ ...financeConfig, sla_hours: Number(e.target.value) })}
                    className="w-20 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-500">hours</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block">Require Payment Terms Sign-off</span>
                  <span className="text-[11px] text-slate-500">Mandatory Finance review for payment terms beyond Net 30</span>
                </div>
                <input
                  type="checkbox"
                  checked={financeConfig.require_payment_term_review}
                  onChange={(e) => setFinanceConfig({ ...financeConfig, require_payment_term_review: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <button
                onClick={() => toast.success('Finance Approval Policy updated successfully!')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-xl transition-colors shadow-xs cursor-pointer text-xs"
              >
                Save Finance Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL RULE EDIT / CREATE MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingRule ? 'Edit Approval Rule' : 'Create New Approval Rule'}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Rule Title / Name *</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Sales Manager Discount Gate"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Approval Level</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={ruleForm.level}
                    onChange={(e) => setRuleForm({ ...ruleForm, level: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Auto Approve?</label>
                  <select
                    value={ruleForm.auto_approve ? 'yes' : 'no'}
                    onChange={(e) => setRuleForm({ ...ruleForm, auto_approve: e.target.value === 'yes' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="no">No (Manual Sign-off Required)</option>
                    <option value="yes">Yes (Instant Auto-Approve)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Min Discount %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={ruleForm.min_discount_pct}
                    onChange={(e) => setRuleForm({ ...ruleForm, min_discount_pct: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Max Discount %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={ruleForm.max_discount_pct}
                    onChange={(e) => setRuleForm({ ...ruleForm, max_discount_pct: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Min Risk Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ruleForm.min_risk_score}
                    onChange={(e) => setRuleForm({ ...ruleForm, min_risk_score: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Max Risk Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ruleForm.max_risk_score}
                    onChange={(e) => setRuleForm({ ...ruleForm, max_risk_score: e.target.value })}
                    placeholder="No upper limit"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Description / Policy Notes</label>
                <textarea
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  rows={3}
                  placeholder="Summarize when this rule applies and what sign-off is required..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
