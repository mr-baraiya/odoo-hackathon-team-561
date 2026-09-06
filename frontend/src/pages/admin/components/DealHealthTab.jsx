import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Clock,
  Percent,
  Truck,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ArrowUpRight,
  UserCheck,
  Send,
  Check,
  X,
  FileText,
  Filter,
  Eye,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

export default function DealHealthTab({ dealHealth: initialDealHealth, onRefresh }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'stalled_deal', 'discount_anomaly', 'delivery_slippage'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'acknowledged', 'escalated', 'resolved'
  const [searchTerm, setSearchTerm] = useState('');

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    total_alerts: 0,
    stalled_deals: 0,
    discount_anomalies: 0,
    delivery_slippages: 0,
    open_alerts: 0,
    acknowledged_alerts: 0,
    escalated_alerts: 0,
    resolved_alerts: 0,
  });
  const [stalledDeals, setStalledDeals] = useState([]);
  const [slippages, setSlippages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escalation Modal state
  const [escalatingAlert, setEscalatingAlert] = useState(null);
  const [escalationNote, setEscalationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load data from backend DB
  const fetchDealHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsRes, summaryRes, stalledRes, slippageRes] = await Promise.allSettled([
        apiClient.get('/deal-health/alerts'),
        apiClient.get('/deal-health/summary'),
        apiClient.get('/deal-health/stalled'),
        apiClient.get('/deal-health/slippages'),
      ]);

      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
        setAlerts(alertsRes.value);
      } else if (initialDealHealth?.alerts) {
        setAlerts(initialDealHealth.alerts);
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      }

      if (stalledRes.status === 'fulfilled' && Array.isArray(stalledRes.value)) {
        setStalledDeals(stalledRes.value);
      }

      if (slippageRes.status === 'fulfilled' && Array.isArray(slippageRes.value)) {
        setSlippages(slippageRes.value);
      }
    } catch (err) {
      console.warn('Error loading Deal Health data from API:', err.message);
      toast.error('Failed to refresh live deal health data.');
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }, []); // Run fetch logic without triggering parent re-render loop

  useEffect(() => {
    fetchDealHealthData();
  }, [fetchDealHealthData]);

  // Action: Acknowledge Alert
  const handleAcknowledge = async (alertId) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/deal-health/alerts/${alertId}/acknowledge`);
      toast.success('Alert marked as Acknowledged');
      // Update local state immediately
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
      setSummary((prev) => ({
        ...prev,
        open_alerts: Math.max(0, prev.open_alerts - 1),
        acknowledged_alerts: prev.acknowledged_alerts + 1,
      }));
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      toast.error('Failed to acknowledge alert');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Escalate Alert
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalatingAlert) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/deal-health/alerts/${escalatingAlert.id}/escalate`, {
        escalation_note: escalationNote || 'Escalated to management for priority review.',
      });
      toast.success(`Alert ${escalatingAlert.quote_number || ''} Escalated to Manager`);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === escalatingAlert.id
            ? { ...a, status: 'escalated', escalation_note: escalationNote }
            : a
        )
      );
      setSummary((prev) => ({
        ...prev,
        open_alerts: Math.max(0, prev.open_alerts - 1),
        escalated_alerts: prev.escalated_alerts + 1,
      }));
      setEscalatingAlert(null);
      setEscalationNote('');
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      toast.error('Failed to escalate alert');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Resolve Alert
  const handleResolve = async (alertId) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/deal-health/alerts/${alertId}/resolve`);
      toast.success('Alert marked as Resolved');
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
      );
      setSummary((prev) => ({
        ...prev,
        open_alerts: Math.max(0, prev.open_alerts - 1),
        resolved_alerts: prev.resolved_alerts + 1,
      }));
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      toast.error('Failed to resolve alert');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering
  const filteredAlerts = alerts.filter((alert) => {
    // Category tab filter
    if (activeTab !== 'all' && alert.alert_type !== activeTab) return false;
    // Status pill filter
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    // Search text
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const quote = (alert.quote_number || '').toLowerCase();
      const cust = (alert.customer_name || '').toLowerCase();
      const msg = (alert.message || '').toLowerCase();
      if (!quote.includes(q) && !cust.includes(q) && !msg.includes(q)) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Open</span>;
      case 'acknowledged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Acknowledged</span>;
      case 'escalated':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 font-bold animate-pulse">Escalated</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Resolved</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'stalled_deal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Stalled Deal</span>
          </span>
        );
      case 'discount_anomaly':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Percent className="w-3.5 h-3.5 text-purple-600" />
            <span>Discount Anomaly</span>
          </span>
        );
      case 'delivery_slippage':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <Truck className="w-3.5 h-3.5 text-rose-600" />
            <span>Delivery Slippage</span>
          </span>
        );
      default:
        return <span className="text-xs font-bold text-slate-700">{type}</span>;
    }
  };

  // Calculated active (non-resolved) alert counts for KPI cards and sub-tabs
  const activeAlertsCount = alerts.filter((a) => a.status !== 'resolved').length;
  const activeStalledCount = alerts.filter((a) => a.alert_type === 'stalled_deal' && a.status !== 'resolved').length;
  const activeAnomalyCount = alerts.filter((a) => a.alert_type === 'discount_anomaly' && a.status !== 'resolved').length;
  const activeSlippageCount = alerts.filter((a) => a.alert_type === 'delivery_slippage' && a.status !== 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-bold tracking-tight">Deal Health & Anomaly Control Center</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Automated monitoring engine for stalled sales quotations, unapproved discount spikes, delivery schedule slippages, and escalation response workflows.
          </p>
        </div>
        <button
          onClick={fetchDealHealthData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Alerts</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Active Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeAlertsCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
              {alerts.filter((a) => a.status === 'open').length} Open
            </span>
            <span>requires intervention</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Stalled Deals</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeStalledCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[11px]">
              {stalledDeals.length} Idle Quotes
            </span>
            <span>&gt; 3 days stagnant</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Discount Anomalies</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeAnomalyCount}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px]">
              High Discount
            </span>
            <span>exceeds rep authority</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Delivery Slippages</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeSlippageCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
              {slippages.length} Overdue
            </span>
            <span>past promise date</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Main Category Sub-Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Alerts ({activeAlertsCount})
            </button>

            <button
              onClick={() => setActiveTab('stalled_deal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'stalled_deal'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Stalled Deals ({activeStalledCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('discount_anomaly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'discount_anomaly'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Discount Anomalies ({activeAnomalyCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery_slippage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'delivery_slippage'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Slippage ({activeSlippageCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72 relative">
            <input
              type="text"
              placeholder="Search quotes, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Sub-Bar */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-3 text-xs">
          <span className="font-semibold text-slate-500 flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {['all', 'open', 'acknowledged', 'escalated', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT LISTING */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Analyzing database for pipeline anomalies & deal health alerts...</p>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Alert Type</th>
                  <th className="p-4">Quotation & Customer</th>
                  <th className="p-4">Anomaly Details</th>
                  <th className="p-4">Triggered</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions / Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 align-top">
                      {getTypeBadge(alert.alert_type)}
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-900 text-sm">
                        {alert.quote_number || 'Quote Alert'}
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        {alert.customer_name || 'Customer'}
                      </div>
                      {alert.total_amount > 0 && (
                        <div className="text-[11px] font-bold text-indigo-600 mt-0.5">
                          ${Number(alert.total_amount).toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top max-w-md">
                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {alert.message}
                      </p>
                      {alert.escalation_note && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900">
                          <span className="font-bold">Escalation Note:</span> {alert.escalation_note}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top text-slate-500 whitespace-nowrap">
                      {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent'}
                    </td>

                    <td className="p-4 align-top whitespace-nowrap">
                      {getStatusBadge(alert.status)}
                    </td>

                    <td className="p-4 align-top text-right whitespace-nowrap space-x-1.5">
                      {alert.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Acknowledge</span>
                          </button>

                          <button
                            onClick={() => setEscalatingAlert(alert)}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Escalate</span>
                          </button>
                        </>
                      )}

                      {(alert.status === 'open' || alert.status === 'acknowledged' || alert.status === 'escalated') && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {alert.status === 'resolved' && (
                        <span className="text-xs text-slate-400 font-medium italic">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-950">No Alerts Found</h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            No active deal health alerts matched your selected filter ({activeTab !== 'all' ? activeTab : 'all types'}, status: {statusFilter}).
          </p>
        </div>
      )}

      {/* DEDICATED LIVE STALLED DEALS TABLE (Shown when Stalled Deals tab or All is selected) */}
      {(activeTab === 'all' || activeTab === 'stalled_deal') && stalledDeals.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Live Stalled Quotations Pipeline (&gt; 3 Days Idle)</span>
              </h2>
              <p className="text-xs text-slate-600">Quotations sitting in draft or pending approval state for an extended period.</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {stalledDeals.length} Stalled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Quotation Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Sales Rep</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Idle Time</th>
                  <th className="p-3 text-right">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stalledDeals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-indigo-600">{item.quote_number}</td>
                    <td className="p-3 font-medium text-slate-900">{item.customer_name}</td>
                    <td className="p-3 text-slate-700">{item.sales_rep_name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded text-[11px] uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">${Number(item.total_amount).toLocaleString()}</td>
                    <td className="p-3 font-bold text-amber-700">{item.days_stalled} days idle</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.risk_level === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.risk_level === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.risk_level} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEDICATED LIVE DELIVERY SLIPPAGES TABLE (Shown when Delivery Slippage tab or All is selected) */}
      {(activeTab === 'all' || activeTab === 'delivery_slippage') && slippages.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-rose-600" />
                <span>Active Delivery Slippage & Schedule Violations</span>
              </h2>
              <p className="text-xs text-slate-600">Fulfillment orders where promised delivery date has elapsed without completion.</p>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
              {slippages.length} Overdue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Quotation</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Promised Date</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3">Delay Severity</th>
                  <th className="p-3 text-right">Overdue Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slippages.map((item) => (
                  <tr key={item.fulfillment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-indigo-600">{item.quote_number}</td>
                    <td className="p-3 font-medium text-slate-900">{item.customer_name}</td>
                    <td className="p-3 text-slate-600">
                      {new Date(item.promised_delivery_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded text-[11px] capitalize">
                        {item.fulfillment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-rose-700">{item.severity}</span>
                    </td>
                    <td className="p-3 text-right font-extrabold text-rose-800">
                      +{item.days_overdue} days overdue
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESCALATION MODAL */}
      {escalatingAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Escalate Alert</h3>
                  <p className="text-xs text-slate-500">
                    Quote {escalatingAlert.quote_number} ({escalatingAlert.customer_name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEscalatingAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escalation Note / Reason for Management
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter reason for escalation, e.g., Unapproved 30% discount requested by client, requires VP approval..."
                  value={escalationNote}
                  onChange={(e) => setEscalationNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-slate-50"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalatingAlert(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
