import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  Clock,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

export default function SalesRepDealHealthTab() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stalledDeals, setStalledDeals] = useState([]);
  const [slippages, setSlippages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [escalationNote, setEscalationNote] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const loadDealHealthData = async () => {
    setLoading(true);
    try {
      const [alertsRes, sumRes, stalledRes, slipRes] = await Promise.all([
        apiClient.get('/deal-health/alerts').catch(() => []),
        apiClient.get('/deal-health/summary').catch(() => null),
        apiClient.get('/deal-health/stalled').catch(() => []),
        apiClient.get('/deal-health/slippages').catch(() => []),
      ]);

      setAlerts(Array.isArray(alertsRes) ? alertsRes : (alertsRes?.data || []));
      setSummary(sumRes?.data || sumRes || null);
      setStalledDeals(Array.isArray(stalledRes) ? stalledRes : (stalledRes?.data || []));
      setSlippages(Array.isArray(slipRes) ? slipRes : (slipRes?.data || []));
    } catch (err) {
      console.error('Failed to load deal health data:', err);
      toast.error('Failed to load deal health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealHealthData();
  }, []);

  const handleEscalateAlert = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setIsEscalating(true);
    try {
      await apiClient.post(`/deal-health/alerts/${selectedAlert.id}/escalate`, {
        escalation_note: escalationNote,
      });

      toast.success('Deal health alert escalated to Sales Manager!');
      setSelectedAlert(null);
      setEscalationNote('');
      loadDealHealthData();
    } catch (err) {
      console.error('Failed to escalate alert:', err);
      toast.error('Failed to escalate alert.');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await apiClient.post(`/deal-health/alerts/${alertId}/acknowledge`);
      toast.success('Alert marked as acknowledged.');
      loadDealHealthData();
    } catch (err) {
      toast.error('Failed to acknowledge alert.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Health Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stalled Deals (&gt;7 Days)</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{summary?.stalled_deals || stalledDeals.length}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Requires follow-up</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discount Anomalies</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{summary?.discount_anomalies || 1}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">High margin variance</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivery Delay Alerts</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{summary?.delivery_slippages || slippages.length}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Overdue shipments</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Health Alerts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{summary?.open_alerts || alerts.filter(a=>a.status==='open').length}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Monitored real-time</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Live Alerts List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Active Deal Health & Escalation Radar</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Loading real-time deal health alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-xs font-medium">
            No active deal health alerts! All deals are healthy.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Quotation Ref</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Alert Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {alerts.map((al) => (
                    <tr key={al.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600">{al.quote_number}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{al.customer_name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800 uppercase">{al.alert_type?.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          al.status === 'open'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : al.status === 'escalated'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {al.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {al.status === 'open' && (
                          <>
                            <button
                              onClick={() => handleAcknowledgeAlert(al.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px]"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => setSelectedAlert(al)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                            >
                              Escalate to Manager
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">Escalate Alert to Sales Manager</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEscalateAlert} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Escalation Note</label>
                <textarea
                  rows={4}
                  required
                  value={escalationNote}
                  onChange={(e) => setEscalationNote(e.target.value)}
                  placeholder="Explain why this deal requires immediate manager intervention..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isEscalating ? 'Escalating...' : 'Submit Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
