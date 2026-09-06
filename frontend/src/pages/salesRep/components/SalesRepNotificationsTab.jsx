import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { Bell, Activity, AlertTriangle, CheckCircle2, Clock, FileText, Info } from 'lucide-react';

export default function SalesRepNotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sales-rep/notifications');
      const data = Array.isArray(res) ? res : (res?.data || []);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications from DB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-800 text-xs font-bold mb-1">
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Real-time DB Alerts</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Sales Representative Notifications</h3>
          <p className="text-xs text-slate-500">
            System notifications for customer quotation requests, manager approvals, counter-offers, order confirmations, and health alerts.
          </p>
        </div>
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
          No notifications recorded in database.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span className="uppercase text-[10px] text-indigo-600 font-extrabold">{notif.alert_type?.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{notif.quote_number}</span>
              </div>
              <p className="text-slate-700 font-medium">{notif.company_name} — {notif.details?.message || 'Update logged'}</p>
              <p className="text-[10px] text-slate-400">
                {notif.triggered_at ? new Date(notif.triggered_at).toLocaleString() : 'Just now'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
