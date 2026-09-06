import React, { useState } from 'react';
import {
  Bell,
  FileText,
  Package,
  CreditCard,
  MessageSquare,
  Shield,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

export default function CustomerNotificationsTab({ notifications = [] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const getIcon = (type, action) => {
    const t = String(type || '').toLowerCase();
    const a = String(action || '').toLowerCase();
    if (t === 'quotation' || a.includes('quotation')) return <FileText className="w-4 h-4 text-indigo-600" />;
    if (t === 'invoice' || a.includes('invoice') || a.includes('payment')) return <CreditCard className="w-4 h-4 text-emerald-600" />;
    if (a.includes('negotiation')) return <MessageSquare className="w-4 h-4 text-amber-600" />;
    if (t === 'fulfillment' || a.includes('order') || a.includes('delivery')) return <Package className="w-4 h-4 text-purple-600" />;
    if (a.includes('approval')) return <Shield className="w-4 h-4 text-rose-600" />;
    return <Bell className="w-4 h-4 text-slate-500" />;
  };

  const getBgColor = (type, action) => {
    const t = String(type || '').toLowerCase();
    const a = String(action || '').toLowerCase();
    if (t === 'quotation' || a.includes('quotation')) return 'bg-indigo-50 border-indigo-200';
    if (t === 'invoice' || a.includes('payment')) return 'bg-emerald-50 border-emerald-200';
    if (a.includes('negotiation')) return 'bg-amber-50 border-amber-200';
    if (t === 'fulfillment' || a.includes('order')) return 'bg-purple-50 border-purple-200';
    return 'bg-slate-50 border-slate-200';
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      !search.trim() ||
      (n.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.actor || '').toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      String(n.type || '').toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Unique notification types from DB
  const notifTypes = [...new Set(notifications.map((n) => n.type).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All ({notifications.length})
            </button>
            {notifTypes.map((nt) => (
              <button
                key={nt}
                onClick={() => setTypeFilter(nt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                  typeFilter === nt
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {nt} ({notifications.filter((n) => n.type === nt).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Feed from DB */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all ${getBgColor(
                n.type,
                n.action
              )}`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 shrink-0 shadow-xs">
                  {getIcon(n.type, n.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {String(n.action || 'Activity Update').replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {n.message || 'Activity recorded in the system.'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{n.actor || 'System'}</span>
                    </span>
                    {n.type && (
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                        {n.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <Bell className="w-12 h-12 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">No notifications</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Activity notifications from quotations, orders, invoices and negotiations will appear here from the database.
          </p>
        </div>
      )}
    </div>
  );
}
