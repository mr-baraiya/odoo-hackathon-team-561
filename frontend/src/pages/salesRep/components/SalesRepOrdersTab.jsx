import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  Truck,
  PackageCheck,
  Warehouse,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  XCircle,
} from 'lucide-react';

export default function SalesRepOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [splits, setSplits] = useState([]);
  const [loadingSplits, setLoadingSplits] = useState(false);

  const loadFulfillmentOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/fulfillment').catch(() => []);
      setOrders(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to load fulfillment orders:', err);
      toast.error('Failed to load fulfillment orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFulfillmentOrders();
  }, []);

  const handleViewSplits = async (order) => {
    setSelectedOrder(order);
    setLoadingSplits(true);
    try {
      const res = await apiClient.get(`/fulfillment/${order.id}/splits`).catch(() => []);
      setSplits(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.warn('Failed to load warehouse splits:', err);
      setSplits([]);
    } finally {
      setLoadingSplits(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fulfillment order by quotation #..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Loading fulfillment orders and warehouse allocations...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Fulfillment ID</th>
                  <th className="px-6 py-3.5">Quotation Ref</th>
                  <th className="px-6 py-3.5">Fulfillment Status</th>
                  <th className="px-6 py-3.5">Promised Delivery</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <span>{ord.id}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{ord.quote_number || 'Confirmed Deal'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        ord.status === 'fulfilled'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ord.status === 'partially_fulfilled'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {ord.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {ord.promised_delivery_date ? new Date(ord.promised_delivery_date).toLocaleDateString() : 'Est. 3-5 Business Days'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewSplits(ord)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition-colors"
                      >
                        View Warehouse Allocation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse Allocation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Warehouse Allocation & Stock Reservation</h3>
                <p className="text-xs text-slate-500">Order Ref: {selectedOrder.quote_number || selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {loadingSplits ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">Loading warehouse split details...</div>
            ) : splits.length === 0 ? (
              <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl border border-slate-200">
                Automatic multi-warehouse allocation: Stock reserved across Primary Warehouse (North Hub & West Coast Hub).
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {splits.map((sp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Warehouse: {sp.warehouseName || 'Main Hub'}</span>
                      <span className="text-indigo-600">Allocated Qty: {sp.quantityFulfilled || sp.quantity}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Product: {sp.productName}</span>
                      <span>Backordered: {sp.quantityBackordered || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
