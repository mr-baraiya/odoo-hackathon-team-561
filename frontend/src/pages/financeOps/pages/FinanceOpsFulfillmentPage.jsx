import React, { useState, useEffect } from 'react';
import { Truck, PackageCheck, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';
import FinanceOpsLayout from '../FinanceOpsLayout';

export default function FinanceOpsFulfillmentPage(props) {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchFulfillmentData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch('/api/finance-ops/fulfillment', { headers });
      const json = await res.json();
      if (json?.data) {
        setOrders(json.data.orders || []);
        setStock(json.data.stock || []);
      }
    } catch (err) {
      console.warn('Error loading fulfillment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillmentData();
  }, []);

  const handleShipmentConfirm = async (fulfillmentId) => {
    setSubmittingId(fulfillmentId);
    setFeedback(null);
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch(`/api/finance-ops/fulfillment/${fulfillmentId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        fetchFulfillmentData();
        if (typeof props.onRefresh === 'function') props.onRefresh();
      } else {
        setFeedback({ type: 'error', message: json.message || 'Shipment confirmation failed' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error: ' + err.message });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <FinanceOpsLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-600" />
                <span>Warehouse Fulfillment & Physical Stock Control</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Stock is reserved on quote confirmation, and physical stock is strictly deducted in PostgreSQL upon shipment confirmation.
              </p>
            </div>
            <button 
              onClick={fetchFulfillmentData} 
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Warehouse
            </button>
          </div>

          {/* Lifecycle Explanation */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold overflow-x-auto gap-4">
            <span className="flex items-center gap-1.5 shrink-0"><span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">1</span> Quote Confirmed</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 shrink-0"><span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span> Order Created</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 shrink-0"><span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">3</span> Stock Reserved</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-700 shrink-0"><span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span> Physical Stock Deducted on Shipment</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Warehouse Inventory Stock Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Warehouse Stock Ledger</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">PostgreSQL warehouse_stock</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Product SKU</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Warehouse Hub</th>
                  <th className="p-3.5 text-right">Physical On Hand</th>
                  <th className="p-3.5 text-right">Quantity Reserved</th>
                  <th className="p-3.5 text-right">Available Unreserved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stock.map((st) => {
                  const available = (st.quantity_on_hand || 0) - (st.quantity_reserved || 0);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{st.sku}</td>
                      <td className="p-3.5 font-bold text-slate-800">{st.product_name}</td>
                      <td className="p-3.5 text-slate-500">{st.warehouse_name}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">{st.quantity_on_hand} units</td>
                      <td className="p-3.5 text-right font-extrabold text-purple-700">{st.quantity_reserved || 0} reserved</td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-600">
                        {available >= 0 ? available : 0} units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fulfillment Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>Fulfillment Orders awaiting Dispatch ({orders.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer & Shipping Address</th>
                  <th className="p-3.5 text-right">Total Order Value</th>
                  <th className="p-3.5 text-center">Fulfillment Status</th>
                  <th className="p-3.5 text-right">Shipment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((fo) => (
                  <tr key={fo.fulfillment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-emerald-700">{fo.quote_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{fo.customer_name}</div>
                      <span className="text-[10px] text-slate-400">{fo.shipping_address || 'Standard Dock'}</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      ${Number(fo.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        fo.fulfillment_status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        fo.fulfillment_status === 'partially_fulfilled' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {(fo.fulfillment_status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {fo.fulfillment_status === 'fulfilled' ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      ) : (
                        <button
                          disabled={submittingId === fo.fulfillment_id}
                          onClick={() => handleShipmentConfirm(fo.fulfillment_id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1 ml-auto"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {submittingId === fo.fulfillment_id ? 'Deducting Stock...' : 'Confirm Shipment'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FinanceOpsLayout>
  );
}
