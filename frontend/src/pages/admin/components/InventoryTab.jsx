import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Box,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingDown,
  X,
  Sliders,
  PackageCheck,
  Truck,
} from 'lucide-react';
import inventoryService from '../../../services/inventory.service';

export default function InventoryTab({ warehousesList: initialWarehouses, stockList: initialStock, productList }) {
  const [activeSubTab, setActiveSubTab] = useState('stock'); // 'stock', 'alerts', 'warehouses', 'transfers'
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [stockSearch, setStockSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  // Modal States
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '', shipping_cost_weight: 1.0, is_active: true });

  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockForm, setStockForm] = useState({
    warehouse_id: '',
    product_id: '',
    quantity_on_hand: 10,
    reorder_threshold: 3,
    replenishment_lead_days: 7,
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    product_id: '',
    quantity: 1,
    reason: '',
  });

  // Transfer history log
  const [transferLogs, setTransferLogs] = useState([
    { id: 'tf_1', date: '2026-09-05 10:15', product: 'Enterprise Server Rack', from: 'Primary Hub (US-East)', to: 'Secondary Hub (EU-West)', qty: 2, status: 'Completed' },
    { id: 'tf_2', date: '2026-09-04 14:30', product: 'Optical Fiber Module', from: 'West Coast Distribution Center', to: 'Primary Hub (US-East)', qty: 10, status: 'Completed' },
  ]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whData, stockData, alertsData] = await Promise.all([
        inventoryService.getWarehouses(),
        inventoryService.getInventoryStock(),
        inventoryService.getReorderAlerts(),
      ]);
      if (Array.isArray(whData)) setWarehouses(whData);
      else setWarehouses(initialWarehouses || []);

      if (Array.isArray(stockData)) setStockList(stockData);
      else setStockList(initialStock || []);

      if (Array.isArray(alertsData)) setReorderAlerts(alertsData);
    } catch (err) {
      console.warn('Inventory API load fallback:', err.message);
      setWarehouses(initialWarehouses || []);
      setStockList(initialStock || []);
    } finally {
      setLoading(false);
    }
  };

  // --- WAREHOUSE HANDLERS ---
  const handleOpenWarehouseModal = (wh = null) => {
    if (wh) {
      setEditingWarehouse(wh);
      setWarehouseForm({
        name: wh.name || '',
        location: wh.location || '',
        shipping_cost_weight: wh.shipping_cost_weight || 1.0,
        is_active: wh.is_active !== false,
      });
    } else {
      setEditingWarehouse(null);
      setWarehouseForm({ name: '', location: '', shipping_cost_weight: 1.0, is_active: true });
    }
    setShowWarehouseModal(true);
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (!warehouseForm.name.trim()) {
      toast.error('Warehouse Name is required');
      return;
    }

    try {
      if (editingWarehouse) {
        await inventoryService.updateWarehouse(editingWarehouse.id, warehouseForm);
        setWarehouses(warehouses.map((w) => (w.id === editingWarehouse.id ? { ...w, ...warehouseForm } : w)));
        toast.success(`Warehouse "${warehouseForm.name}" updated!`);
      } else {
        const created = await inventoryService.createWarehouse(warehouseForm);
        setWarehouses([...warehouses, created || { ...warehouseForm, id: `wh_${Date.now()}` }]);
        toast.success(`New Warehouse "${warehouseForm.name}" created!`);
      }
      setShowWarehouseModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save warehouse');
    }
  };

  const handleDeleteWarehouse = async (whId) => {
    if (!window.confirm('Are you sure you want to delete this warehouse hub?')) return;
    try {
      await inventoryService.deleteWarehouse(whId);
      setWarehouses(warehouses.filter((w) => w.id !== whId));
      toast.success('Warehouse deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete warehouse');
    }
  };

  // --- STOCK HANDLERS ---
  const handleOpenStockModal = (stock = null) => {
    if (stock) {
      setEditingStock(stock);
      setStockForm({
        warehouse_id: stock.warehouse_id || '',
        product_id: stock.product_id || '',
        quantity_on_hand: stock.quantity_on_hand || 0,
        reorder_threshold: stock.reorder_threshold || 3,
        replenishment_lead_days: stock.replenishment_lead_days || 7,
      });
    } else {
      setEditingStock(null);
      setStockForm({
        warehouse_id: warehouses[0]?.id || '',
        product_id: productList[0]?.id || '',
        quantity_on_hand: 10,
        reorder_threshold: 3,
        replenishment_lead_days: 7,
      });
    }
    setShowStockModal(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await inventoryService.updateStock(editingStock.id, stockForm);
        setStockList(stockList.map((s) => (s.id === editingStock.id ? { ...s, ...stockForm } : s)));
        toast.success('Stock allocation & threshold updated!');
      } else {
        const created = await inventoryService.createStockAllocation(stockForm);
        setStockList([...stockList, created || { ...stockForm, id: `stock_${Date.now()}` }]);
        toast.success('New stock allocation added!');
      }
      fetchData();
      setShowStockModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save stock allocation');
    }
  };

  // Quick Inline Quantity Adjustment
  const handleQuickQuantityAdjust = async (stockId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    setStockList(stockList.map((s) => (s.id === stockId ? { ...s, quantity_on_hand: newQty } : s)));
    try {
      await inventoryService.patchStock(stockId, { quantity_on_hand: newQty });
      toast.success(`Stock updated to ${newQty} units`);
    } catch (err) {
      console.warn('API stock patch fallback:', err.message);
    }
  };

  // --- STOCK TRANSFER HANDLER ---
  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    const { from_warehouse_id, to_warehouse_id, product_id, quantity } = transferForm;
    if (!from_warehouse_id || !to_warehouse_id || !product_id) {
      toast.error('Please select source warehouse, target warehouse, and product');
      return;
    }
    if (from_warehouse_id === to_warehouse_id) {
      toast.error('Source and target warehouse cannot be the same');
      return;
    }

    const qtyNum = Number(quantity);
    const sourceStock = stockList.find((s) => s.warehouse_id === from_warehouse_id && s.product_id === product_id);
    if (!sourceStock || sourceStock.quantity_on_hand < qtyNum) {
      toast.error(`Insufficient stock in source warehouse (Available: ${sourceStock?.quantity_on_hand || 0})`);
      return;
    }

    // Deduct from source & Add to target
    const updated = stockList.map((s) => {
      if (s.warehouse_id === from_warehouse_id && s.product_id === product_id) {
        return { ...s, quantity_on_hand: s.quantity_on_hand - qtyNum };
      }
      if (s.warehouse_id === to_warehouse_id && s.product_id === product_id) {
        return { ...s, quantity_on_hand: s.quantity_on_hand + qtyNum };
      }
      return s;
    });

    setStockList(updated);

    const fromWh = warehouses.find((w) => w.id === from_warehouse_id)?.name || 'Source';
    const toWh = warehouses.find((w) => w.id === to_warehouse_id)?.name || 'Target';
    const prodName = productList.find((p) => p.id === product_id)?.name || 'Product';

    setTransferLogs([
      {
        id: `tf_${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        product: prodName,
        from: fromWh,
        to: toWh,
        qty: qtyNum,
        status: 'Completed',
      },
      ...transferLogs,
    ]);

    toast.success(`Transferred ${qtyNum} units of ${prodName} from ${fromWh} to ${toWh}!`);
    setShowTransferModal(false);
  };

  // Filtered Stock List
  const filteredStock = stockList.filter((s) => {
    const matchesWh = warehouseFilter === 'all' || s.warehouse_id === warehouseFilter;
    const prod = productList.find((p) => p.id === s.product_id);
    const wh = warehouses.find((w) => w.id === s.warehouse_id);
    const query = stockSearch.toLowerCase();
    const matchesSearch =
      (prod?.name || '').toLowerCase().includes(query) ||
      (wh?.name || '').toLowerCase().includes(query) ||
      (prod?.sku || '').toLowerCase().includes(query);
    return matchesWh && matchesSearch;
  });

  // Calculate Metrics
  const totalStockUnits = stockList.reduce((acc, s) => acc + (Number(s.quantity_on_hand) || 0), 0);
  const lowStockCount = stockList.filter((s) => s.quantity_on_hand <= s.reorder_threshold && s.quantity_on_hand > 0).length;
  const outOfStockCount = stockList.filter((s) => s.quantity_on_hand === 0).length;
  const activeHubsCount = warehouses.filter((w) => w.is_active !== false).length;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading live inventory stock from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER METRIC CARDS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Inventory & Warehouse Management
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Monitor multi-hub inventory, configure safety stock reorder thresholds, track lead times, and transfer stock.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTransferForm({
                  from_warehouse_id: warehouses[0]?.id || '',
                  to_warehouse_id: warehouses[1]?.id || '',
                  product_id: productList[0]?.id || '',
                  quantity: 1,
                  reason: '',
                });
                setShowTransferModal(true);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Stock Transfer
            </button>
            <button
              onClick={() => handleOpenWarehouseModal()}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-indigo-200"
            >
              <Building2 className="w-3.5 h-3.5" /> Add Warehouse
            </button>
            <button
              onClick={() => handleOpenStockModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Stock
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Stock Units</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{totalStockUnits}</div>
            <span className="text-[10px] text-slate-500">Across {activeHubsCount} distribution hubs</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Low Stock Warnings</span>
            <div className="text-lg font-extrabold text-amber-600 mt-0.5">{lowStockCount}</div>
            <span className="text-[10px] text-slate-500">At or below reorder point</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Out of Stock Items</span>
            <div className="text-lg font-extrabold text-rose-600 mt-0.5">{outOfStockCount}</div>
            <span className="text-[10px] text-slate-500">Requires urgent PO replenishment</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Active Hubs</span>
            <div className="text-lg font-extrabold text-indigo-600 mt-0.5">{activeHubsCount}</div>
            <span className="text-[10px] text-slate-500">Registered distribution centers</span>
          </div>
        </div>
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl border">
        <button
          onClick={() => setActiveSubTab('stock')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'stock'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Real-Time Stock Inventory ({filteredStock.length})
        </button>
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'alerts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Reorder Alerts Queue ({lowStockCount + outOfStockCount})
        </button>
        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'warehouses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Warehouse Hubs Directory ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'transfers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Stock Transfer Log ({transferLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: REAL-TIME STOCK INVENTORY TABLE */}
      {activeSubTab === 'stock' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock by product name or warehouse hub..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Hub:</span>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Warehouse Hubs</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Warehouse Hub</th>
                  <th className="py-3 px-4 text-center">Stock On Hand</th>
                  <th className="py-3 px-4 text-center">Reorder Point</th>
                  <th className="py-3 px-4 text-center">Lead Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No stock records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((s) => {
                    const prod = productList.find((p) => p.id === s.product_id);
                    const wh = warehouses.find((w) => w.id === s.warehouse_id);
                    const qty = Number(s.quantity_on_hand || 0);
                    const threshold = Number(s.reorder_threshold || 0);
                    const leadDays = Number(s.replenishment_lead_days || 7);

                    const isOut = qty === 0;
                    const isLow = qty <= threshold && !isOut;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block">{prod?.name || 'Product'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{prod?.sku || 'SKU-STANDARD'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{wh?.name || 'Hub'}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{wh?.location || 'General'}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 font-mono font-extrabold text-slate-900 text-sm">
                            <button
                              onClick={() => handleQuickQuantityAdjust(s.id, qty, -1)}
                              title="Decrease 1 unit"
                              className="p-1 text-slate-400 hover:text-rose-600 focus:outline-none cursor-pointer"
                            >
                              -
                            </button>
                            <span className={isOut ? 'text-rose-600 font-bold' : isLow ? 'text-amber-600 font-bold' : ''}>
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQuickQuantityAdjust(s.id, qty, 1)}
                              title="Increase 1 unit"
                              className="p-1 text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">
                          {threshold} units
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                            {leadDays} days
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <TrendingDown className="w-3 h-3" /> REORDER WARNING
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> OPTIMAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {/* BARE ACTION ICONS WITHOUT BOXES */}
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenStockModal(s)}
                              className="p-1 text-slate-500 hover:text-indigo-600 focus:outline-none cursor-pointer"
                              title="Configure Thresholds & Lead Time"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this stock allocation?')) {
                                  await inventoryService.updateStock(s.id, { quantity_on_hand: 0 });
                                  setStockList(stockList.filter((item) => item.id !== s.id));
                                  toast.success('Stock allocation removed.');
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                              title="Remove Allocation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REORDER ALERTS QUEUE */}
      {activeSubTab === 'alerts' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Active Stock Replenishment Alerts
              </h3>
              <p className="text-xs text-slate-600">
                Products currently at or below safety stock reorder thresholds requiring purchase order dispatch.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Alerts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockList
              .filter((s) => s.quantity_on_hand <= s.reorder_threshold)
              .map((s) => {
                const prod = productList.find((p) => p.id === s.product_id);
                const wh = warehouses.find((w) => w.id === s.warehouse_id);
                const qty = Number(s.quantity_on_hand || 0);
                const threshold = Number(s.reorder_threshold || 0);
                const leadDays = Number(s.replenishment_lead_days || 7);
                const isOut = qty === 0;

                return (
                  <div
                    key={s.id}
                    className={`border rounded-2xl p-5 space-y-3 ${
                      isOut ? 'bg-rose-50/50 border-rose-200' : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{prod?.name || 'Product'}</h4>
                        <span className="text-xs text-slate-600 font-semibold">{wh?.name || 'Hub'}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isOut ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : 'Low Stock Alert'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Stock On Hand</span>
                        <strong className={`font-mono ${isOut ? 'text-rose-700' : 'text-slate-900'}`}>{qty} units</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Reorder Point</span>
                        <strong className="font-mono text-slate-900">{threshold} units</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Lead Time Window</span>
                        <strong className="font-mono text-indigo-700">{leadDays} days</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Lead Time: {leadDays} days for PO arrival
                      </span>
                      <button
                        onClick={() => handleOpenStockModal(s)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Adjust Threshold
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WAREHOUSE HUBS DIRECTORY */}
      {activeSubTab === 'warehouses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Distribution Warehouses</h3>
              <p className="text-xs text-slate-600">Active shipping hubs, fulfillment centers, and cost weight multipliers.</p>
            </div>
            <button
              onClick={() => handleOpenWarehouseModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Warehouse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((w) => (
              <div key={w.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{w.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{w.location || 'Location Not Specified'}</p>
                  </div>
                  {w.is_active !== false ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Shipping Cost Weight:</span>
                  <span className="font-mono font-bold text-indigo-700">{w.shipping_cost_weight}x</span>
                </div>

                {/* BARE ICONS WITHOUT BOXES */}
                <div className="flex justify-end items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenWarehouseModal(w)}
                    className="p-1 text-slate-500 hover:text-indigo-600 focus:outline-none cursor-pointer"
                    title="Edit Warehouse"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWarehouse(w.id)}
                    className="p-1 text-slate-500 hover:text-rose-600 focus:outline-none cursor-pointer"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STOCK TRANSFER LOG */}
      {activeSubTab === 'transfers' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Inter-Warehouse Stock Transfer Log</h3>
              <p className="text-xs text-slate-600">Audit trail of stock movements transferred across distribution hubs.</p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Stock
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Source Hub</th>
                  <th className="py-3 px-4">Destination Hub</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-600">{log.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.product}</td>
                    <td className="py-3 px-4 text-slate-700">{log.from}</td>
                    <td className="py-3 px-4 text-slate-700">{log.to}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">+{log.qty} units</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WAREHOUSE CREATE / EDIT MODAL */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingWarehouse ? 'Edit Warehouse Hub' : 'Add New Warehouse Hub'}
              </h3>
              <button
                onClick={() => setShowWarehouseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Warehouse Name *</label>
                <input
                  type="text"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  placeholder="e.g. Primary Hub (US-East)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Location / City / Country</label>
                <input
                  type="text"
                  value={warehouseForm.location}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                  placeholder="e.g. Newark, NJ, United States"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Shipping Cost Weight Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10.0"
                  value={warehouseForm.shipping_cost_weight}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, shipping_cost_weight: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Is Hub Active?</span>
                <input
                  type="checkbox"
                  checked={warehouseForm.is_active}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {editingWarehouse ? 'Update Warehouse' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK THRESHOLDS & LEAD TIME MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStock ? 'Configure Stock & Lead Time' : 'New Stock Allocation'}
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Warehouse Hub *</label>
                <select
                  value={stockForm.warehouse_id}
                  onChange={(e) => setStockForm({ ...stockForm, warehouse_id: e.target.value })}
                  disabled={Boolean(editingStock)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Product *</label>
                <select
                  value={stockForm.product_id}
                  onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
                  disabled={Boolean(editingStock)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Stock On Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={stockForm.quantity_on_hand}
                    onChange={(e) => setStockForm({ ...stockForm, quantity_on_hand: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    value={stockForm.reorder_threshold}
                    onChange={(e) => setStockForm({ ...stockForm, reorder_threshold: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Lead Days</label>
                  <input
                    type="number"
                    min="1"
                    value={stockForm.replenishment_lead_days}
                    onChange={(e) => setStockForm({ ...stockForm, replenishment_lead_days: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Execute Inter-Warehouse Transfer
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Product to Transfer *</label>
                <select
                  value={transferForm.product_id}
                  onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Source Warehouse Hub *</label>
                  <select
                    value={transferForm.from_warehouse_id}
                    onChange={(e) => setTransferForm({ ...transferForm, from_warehouse_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Target Warehouse Hub *</label>
                  <select
                    value={transferForm.to_warehouse_id}
                    onChange={(e) => setTransferForm({ ...transferForm, to_warehouse_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Transfer Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
