import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, RefreshCw } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch('/api/finance-ops/notifications', { headers });
      const json = await res.json();
      if (json?.data) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-500" />
              <span>Financial Alerts & System Notifications</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time alerts streamed from PostgreSQL deal_health_alerts table.
            </p>
          </div>
          <button onClick={fetchNotifications} className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Alerts
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Notifications ({notifications.length})</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading alerts from PostgreSQL...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">No financial alerts currently active.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between text-xs hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{n.company_name || 'Customer Alert'}</span>
                        <span className="font-mono text-emerald-700 font-bold">({n.quote_number || 'Quote'})</span>
                      </div>
                      <p className="text-slate-600 mt-1">{n.alert_type} - Status: <span className="font-bold uppercase text-amber-700">{n.status}</span></p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(n.triggered_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FinanceOpsLayout>
  );
}
