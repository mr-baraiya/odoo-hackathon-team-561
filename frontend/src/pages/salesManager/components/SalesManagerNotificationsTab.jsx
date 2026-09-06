import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  MessageSquare, 
  Clock, 
  Truck, 
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import toast from 'react-hot-toast';

const fallbackNotificationsData = [
  { id: 'notif-1', title: 'New Approval Request', message: 'Quotation Q-2026-004 requires >25% discount approval.', type: 'approval_request', created_at: new Date().toISOString(), read: false },
  { id: 'notif-2', title: 'Customer Counter-Offer', message: 'ABC Technologies submitted counter offer of ₹9,75,000.', type: 'counter_offer', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), read: false },
  { id: 'notif-3', title: 'Stalled Deal Alert', message: 'Apex Systems quotation Q-2026-009 has been inactive for 8 days.', type: 'stalled_deal', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), read: true },
  { id: 'notif-4', title: 'Delivery Delay Flag', message: 'Order ORD-302 for Global Logix delayed at Bengaluru Logistics.', type: 'delivery_delay', created_at: new Date(Date.now() - 3600000 * 8).toISOString(), read: true }
];

export default function SalesManagerNotificationsTab({ notificationsData, onSelectTab }) {
  const [notifications, setNotifications] = useState(notificationsData || fallbackNotificationsData);

  useEffect(() => {
    if (notificationsData && notificationsData.length > 0) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  const handleActionClick = (type) => {
    if (type === 'approval_request') onSelectTab && onSelectTab('approvals');
    else if (type === 'counter_offer') onSelectTab && onSelectTab('negotiations');
    else if (type === 'stalled_deal') onSelectTab && onSelectTab('pipeline');
    else if (type === 'delivery_delay') onSelectTab && onSelectTab('fulfillment');
    else onSelectTab && onSelectTab('dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" /> Sales Manager Notifications & Escalation Feed
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts for discount exceptions, customer counter-offers, stalled pipeline deals, and delivery delays.
          </p>
        </div>
        <button 
          onClick={() => toast.success('All notifications marked as read')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n, idx) => (
          <div key={n.id || idx} className={`bg-white rounded-2xl border p-4 shadow-sm flex items-center justify-between gap-4 transition-all ${
            !n.read ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                n.type === 'approval_request' ? 'bg-amber-100 text-amber-800' :
                n.type === 'counter_offer' ? 'bg-indigo-100 text-indigo-800' :
                n.type === 'stalled_deal' ? 'bg-rose-100 text-rose-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {n.type === 'approval_request' && <ShieldAlert className="w-5 h-5" />}
                {n.type === 'counter_offer' && <MessageSquare className="w-5 h-5" />}
                {n.type === 'stalled_deal' && <Clock className="w-5 h-5" />}
                {n.type === 'delivery_delay' && <Truck className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {n.created_at ? new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleActionClick(n.type)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shrink-0"
            >
              Take Action →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
