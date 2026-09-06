import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  Send,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalesManagerFulfillmentTab({ fulfillmentData, loading }) {
  const [orders, setOrders] = useState(fulfillmentData || []);

  useEffect(() => {
    if (fulfillmentData) {
      setOrders(fulfillmentData);
    }
  }, [fulfillmentData]);

  if (loading && !fulfillmentData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching live order fulfillment records from database...</span>
      </div>
    );
  }

  const handleEscalateFulfillment = (orderId, customer) => {
    toast.success(`Escalated fulfillment issue for ${orderId} (${customer}) to Operations Lead`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" /> Order & Fulfillment Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track confirmed order fulfillment splits, warehouse inventory reservations, delivery delay warnings, and escalate logistics issues.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-xs text-slate-500">
          No confirmed order fulfillment records found in DB
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord, idx) => (
            <div key={ord.order_id || idx} className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              ord.delay_flag ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200/80'
            }`}>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-indigo-600 text-sm">{ord.order_id}</span>
                  <span className="font-bold text-slate-900 text-sm">{ord.customer_name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                    Ref: {ord.quote_number}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <span>Items Ordered: <strong>{ord.items_count} units</strong></span>
                  <span>Shipped: <strong className="text-emerald-700">{ord.shipped_qty}</strong></span>
                  <span>Reserved: <strong className="text-amber-700">{ord.reserved_qty}</strong></span>
                  <span>Warehouse: <strong>{ord.warehouse}</strong></span>
                </div>

                {ord.delay_flag && (
                  <div className="bg-amber-100/70 border border-amber-300 text-amber-950 p-2.5 rounded-xl flex items-center gap-2 font-medium text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>Delivery Delay Alert:</strong> {ord.delay_reason}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="text-base font-extrabold text-slate-900">₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ord.fulfillment_status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' :
                    ord.fulfillment_status === 'Partially Fulfilled' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.fulfillment_status}
                  </span>
                  {ord.delay_flag && (
                    <button
                      onClick={() => handleEscalateFulfillment(ord.order_id, ord.customer_name)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" /> Escalate Logistics
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
