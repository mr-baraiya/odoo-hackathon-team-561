import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  CreditCard,
  Layers,
  Pause,
  Play,
  XCircle,
} from 'lucide-react';

export default function SalesRepSubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Plan state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planCycle, setPlanCycle] = useState('monthly');
  const [planPrice, setPlanPrice] = useState(299);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subsRes, plansRes] = await Promise.all([
        apiClient.get('/subscriptions').catch(() => []),
        apiClient.get('/subscription-plans').catch(() => []),
      ]);
      setSubscriptions(Array.isArray(subsRes) ? subsRes : (subsRes?.data || []));
      setPlans(Array.isArray(plansRes) ? plansRes : (plansRes?.data || []));
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      toast.error('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!planName.trim()) return;

    setIsCreatingPlan(true);
    try {
      const res = await apiClient.post('/subscription-plans', {
        name: planName,
        cycle: planCycle,
        price_per_cycle: Number(planPrice),
        proration_enabled: true,
      });

      toast.success('Subscription plan created successfully!');
      setShowPlanModal(false);
      setPlanName('');
      loadSubscriptionData();
    } catch (err) {
      console.error('Failed to create subscription plan:', err);
      toast.error('Failed to create plan.');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const filteredSubs = subscriptions.filter((s) =>
    s.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active subscription plans or product names..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <button
          onClick={() => setShowPlanModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription Plan</span>
        </button>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Available Recurring Billing Plans</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {p.cycle}
                </span>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-slate-900">${(p.price_per_cycle || 0).toLocaleString()}</span>
                <span className="text-[11px] text-slate-500 font-medium">/ {p.cycle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Customer Subscriptions Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>Active Customer Recurring Subscriptions</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Loading recurring customer subscriptions...
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Subscription ID</th>
                    <th className="px-6 py-3.5">Product / Plan</th>
                    <th className="px-6 py-3.5">Recurring Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Billing Cycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{sub.id}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">{sub.product_name}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${(sub.monthly_price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">Monthly Auto-Renew</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Subscription Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">Create Subscription Plan</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Enterprise SaaS Monthly"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Billing Cycle</label>
                <select
                  value={planCycle}
                  onChange={(e) => setPlanCycle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Price per Cycle ($)</label>
                <input
                  type="number"
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPlan}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isCreatingPlan ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
