import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  MapPin,
} from 'lucide-react';

export default function CustomerOrdersTab({ orders = [] }) {
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.quote_number || '').toLowerCase().includes(q) ||
      (o.company_name || '').toLowerCase().includes(q) ||
      (o.fulfillment_status || '').toLowerCase().includes(q)
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'processing':
      case 'picking':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const st = String(status || 'pending').toLowerCase();
    if (st === 'delivered' || st === 'completed')
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (st === 'shipped' || st === 'in_transit')
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (st === 'processing' || st === 'picking')
      return 'bg-amber-50 text-amber-800 border-amber-200';
    if (st === 'cancelled' || st === 'failed')
      return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders by quote number or company..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filteredOrders.length}</strong> orders from database
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.fulfillment_id || order.quotation_id}
              className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-6 shadow-2xs transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    {getStatusIcon(order.fulfillment_status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.quote_number || order.quotation_id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.fulfillment_status
                        )}`}
                      >
                        {String(order.fulfillment_status || 'pending').replace(/_/g, ' ')}
                      </span>
                    </div>
                    {order.company_name && (
                      <p className="text-xs text-slate-600">
                        Customer: <strong className="text-slate-800">{order.company_name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-lg font-black text-slate-900">
                    ${Number(order.total_amount || 0).toLocaleString()}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      order.quote_status
                    )}`}
                  >
                    Quote: {String(order.quote_status || 'confirmed').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Promised Delivery</span>
                    <span className="font-semibold text-slate-900">
                      {order.promised_delivery_date
                        ? new Date(order.promised_delivery_date).toLocaleDateString()
                        : 'TBD'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Actual Delivery</span>
                    <span className="font-semibold text-slate-900">
                      {order.actual_delivery_date
                        ? new Date(order.actual_delivery_date).toLocaleDateString()
                        : 'In Progress'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Fulfillment ID</span>
                    <span className="font-mono font-semibold text-slate-900 text-[11px]">
                      {String(order.fulfillment_id || '').substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">No orders found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Confirmed quotations will appear here as orders with delivery tracking from the database.
          </p>
        </div>
      )}
    </div>
  );
}
