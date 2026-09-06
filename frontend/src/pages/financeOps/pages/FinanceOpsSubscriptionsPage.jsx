import React, { useState, useEffect } from 'react';
import { Repeat, Play, Pause, XCircle, RefreshCw } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch('/api/finance-ops/subscriptions', { headers });
      const json = await res.json();
      if (json?.data) {
        setSubscriptions(json.data);
      }
    } catch (err) {
      console.warn('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (subId, action) => {
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`/api/finance-ops/subscriptions/${subId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        fetchSubscriptions();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Action failed: ' + err.message });
    }
  };

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Repeat className="w-6 h-6 text-emerald-600" />
              <span>Subscription Contracts & Recurring Billing</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active SaaS & service recurring billing schedules in PostgreSQL.
            </p>
          </div>
          <button onClick={fetchSubscriptions} className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {feedback && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex justify-between">
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Subscriptions ({subscriptions.length})</h3>
            <span className="text-xs text-slate-400 font-medium">PostgreSQL Subscriptions Table</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">No subscription contracts found in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Plan Name</th>
                    <th className="p-3.5">Billing Cycle</th>
                    <th className="p-3.5 text-right">Amount / Cycle</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{s.customer_name}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{s.plan_name}</td>
                      <td className="p-3.5 capitalize text-slate-500">{s.billing_cycle || 'monthly'}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">${Number(s.amount || 0).toLocaleString()}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          s.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          s.status === 'paused' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {(s.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {s.status === 'active' ? (
                            <button onClick={() => handleAction(s.id, 'pause')} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold">
                              Pause
                            </button>
                          ) : (
                            <button onClick={() => handleAction(s.id, 'resume')} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold">
                              Resume
                            </button>
                          )}
                          <button onClick={() => handleAction(s.id, 'cancel')} className="px-2 py-1 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-bold">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FinanceOpsLayout>
  );
}
