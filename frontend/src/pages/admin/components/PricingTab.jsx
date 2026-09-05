import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, Edit, Trash2, X, DollarSign, Globe, Layers, CheckCircle2, Sliders } from 'lucide-react';
import pricingService from '../../../services/pricing.service';

const CURRENCY_MAP = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)' },
};

export default function PricingTab({ productList = [], tiersList = [], handleExportCSV }) {
  const [activeSubTab, setActiveSubTab] = useState('matrix'); // 'matrix' | 'pricelists'
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Price Lists State
  const [priceLists, setPriceLists] = useState([]);
  const [selectedPriceList, setSelectedPriceList] = useState(null);
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState(null);

  // Price List Item Add Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedProductSku, setSelectedProductSku] = useState('');
  const [customOverridePrice, setCustomOverridePrice] = useState('');

  const [priceListForm, setPriceListForm] = useState({
    name: '',
    code: '',
    tier_code: 'all',
    currency_code: 'USD',
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    is_active: true,
  });

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      const data = await pricingService.getPriceLists();
      if (Array.isArray(data) && data.length > 0) {
        setPriceLists(data);
        if (!selectedPriceList) setSelectedPriceList(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load price lists from API:', err.message);
    }
  };

  const formatPrice = (amountInUSD) => {
    const num = Number(amountInUSD || 0);
    const curr = CURRENCY_MAP[selectedCurrency] || CURRENCY_MAP.USD;
    const converted = num * curr.rate;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOpenPriceListModal = (listToEdit = null) => {
    if (listToEdit) {
      setEditingPriceList(listToEdit);
      setPriceListForm({
        name: listToEdit.name || '',
        code: listToEdit.code || '',
        tier_code: listToEdit.tier_code || 'all',
        currency_code: listToEdit.currency_code || 'USD',
        valid_from: listToEdit.valid_from || '2026-01-01',
        valid_to: listToEdit.valid_to || '2026-12-31',
        is_active: listToEdit.is_active !== false,
      });
    } else {
      setEditingPriceList(null);
      setPriceListForm({
        name: '',
        code: `PL-${Date.now().toString().slice(-5)}`,
        tier_code: 'all',
        currency_code: selectedCurrency,
        valid_from: '2026-01-01',
        valid_to: '2026-12-31',
        is_active: true,
      });
    }
    setShowPriceListModal(true);
  };

  const handleSavePriceList = async (e) => {
    e.preventDefault();
    if (!priceListForm.name.trim()) {
      toast.error('Price List Name is required.');
      return;
    }

    try {
      if (editingPriceList) {
        const updated = await pricingService.updatePriceList(editingPriceList.id, priceListForm);
        toast.success(`Price List "${priceListForm.name}" updated!`);
        setPriceLists(priceLists.map((p) => (p.id === editingPriceList.id ? { ...p, ...priceListForm } : p)));
      } else {
        const created = await pricingService.createPriceList(priceListForm);
        toast.success(`New Price List "${priceListForm.name}" created!`);
        setPriceLists([...priceLists, created]);
        setSelectedPriceList(created);
      }
      setShowPriceListModal(false);
    } catch (err) {
      console.error('[PricingTab handleSavePriceList] Error:', err);
      toast.error(err.message || 'Failed to save price list.');
    }
  };

  const handleDeletePriceList = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Price List "${name}"?`)) return;
    try {
      await pricingService.deletePriceList(id);
      toast.success(`Price List "${name}" deleted.`);
      const remaining = priceLists.filter((p) => p.id !== id);
      setPriceLists(remaining);
      if (selectedPriceList?.id === id) {
        setSelectedPriceList(remaining[0] || null);
      }
    } catch (err) {
      console.error('[PricingTab handleDeletePriceList] Error:', err);
      toast.error(err.message || 'Failed to delete price list.');
    }
  };

  const handleAddPriceListItem = async (e) => {
    e.preventDefault();
    if (!selectedPriceList) {
      toast.error('Please select a price list first.');
      return;
    }
    if (!selectedProductSku) {
      toast.error('Please select a product.');
      return;
    }
    if (customOverridePrice === '' || isNaN(customOverridePrice)) {
      toast.error('Please enter a valid price.');
      return;
    }

    try {
      const newItem = await pricingService.addPriceListItem(selectedPriceList.id, {
        product_sku: selectedProductSku,
        custom_price: Number(customOverridePrice),
      });
      toast.success(`Product price override set for ${selectedProductSku}!`);

      const updatedItems = [...(selectedPriceList.items || []), newItem];
      const updatedList = { ...selectedPriceList, items: updatedItems };
      setSelectedPriceList(updatedList);
      setPriceLists(priceLists.map((p) => (p.id === selectedPriceList.id ? updatedList : p)));

      setShowAddItemModal(false);
      setSelectedProductSku('');
      setCustomOverridePrice('');
    } catch (err) {
      console.error('[PricingTab handleAddPriceListItem] Error:', err);
      toast.error(err.message || 'Failed to add price override.');
    }
  };

  const handleDeletePriceListItem = async (itemId) => {
    if (!selectedPriceList) return;
    try {
      await pricingService.deletePriceListItem(selectedPriceList.id, itemId);
      toast.success('Price override item removed.');
      const updatedItems = selectedPriceList.items.filter((i) => i.id !== itemId);
      const updatedList = { ...selectedPriceList, items: updatedItems };
      setSelectedPriceList(updatedList);
      setPriceLists(priceLists.map((p) => (p.id === selectedPriceList.id ? updatedList : p)));
    } catch (err) {
      console.error('[PricingTab handleDeletePriceListItem] Error:', err);
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Pricing Management & Tier Matrix</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
              {priceLists.length} Custom Lists
            </span>
          </h2>
          <p className="text-xs text-slate-600">
            Create price lists, override product prices, assign tier pricing (Bronze/Silver/Gold/Platinum), and manage multi-currency exchange rates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Currency Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent font-bold text-indigo-700 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenPriceListModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Price List</span>
          </button>

          {handleExportCSV && (
            <button
              onClick={() =>
                handleExportCSV(
                  'Pricing_Matrix',
                  productList.map((p) => [p.sku, p.name, p.base_price, ...tiersList.map((t) => (p.base_price * (1 - t.default_discount_ceiling_pct / 100)).toFixed(2))]),
                  ['SKU', 'Product Name', 'Base Price (USD)', ...tiersList.map((t) => `${t.label} Price`)]
                )
              }
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sub-Tab Switcher: Tier Matrix vs Custom Price Lists */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'matrix' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Tier Price Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('pricelists')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'pricelists' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Custom Price Lists</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {priceLists.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CUSTOMER TIER PRICE MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="font-bold text-slate-900">Tier Pricing Breakdown ({selectedCurrency})</span>
              <p className="text-slate-500 text-[11px]">Shows maximum tier discount ceilings applied to base catalog prices.</p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-700">
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded border border-orange-200">Bronze (5%)</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded border border-slate-300">Silver (10%)</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200">Gold (15%)</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">Platinum (25%)</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Base List Price</th>
                  {tiersList.map((tier) => (
                    <th key={tier.id} className="p-3">
                      {tier.label} ({tier.default_discount_ceiling_pct}%)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {productList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{p.sku}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatPrice(p.base_price)}</td>
                    {tiersList.map((tier) => {
                      const discountPct = tier.default_discount_ceiling_pct || 0;
                      const lowestPriceUSD = Number(p.base_price || 0) * (1 - discountPct / 100);

                      return (
                        <td key={tier.id} className="p-3 font-mono">
                          <div className="font-bold text-indigo-700">{formatPrice(lowestPriceUSD)}</div>
                          <div className="text-[10px] text-slate-500">Max {discountPct}% OFF</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOM PRICE LISTS MANAGEMENT */}
      {activeSubTab === 'pricelists' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Price Lists Selector List */}
          <div className="space-y-3 border-r border-slate-200 pr-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Available Custom Price Lists</h3>
            <div className="space-y-2">
              {priceLists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPriceList(pl)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    selectedPriceList?.id === pl.id
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{pl.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${pl.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {pl.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Code: {pl.code}</span>
                    <span className="font-bold text-indigo-700 uppercase">Tier: {pl.tier_code || 'All'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price List Inspector Details */}
          {selectedPriceList ? (
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedPriceList.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Code: {selectedPriceList.code} | Currency: {selectedPriceList.currency_code} | Target Tier: {selectedPriceList.tier_code.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenPriceListModal(selectedPriceList)}
                    title="Edit Price List Meta"
                    className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePriceList(selectedPriceList.id, selectedPriceList.name)}
                    title="Delete Price List"
                    className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer focus:outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1 shadow-xs ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Set Override Price</span>
                  </button>
                </div>
              </div>

              {/* Price List Items Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Product Price Overrides ({selectedPriceList.items ? selectedPriceList.items.length : 0})
                </h4>

                {!selectedPriceList.items || selectedPriceList.items.length === 0 ? (
                  <div className="bg-slate-50 p-6 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No custom product prices defined in this price list yet. Click <strong>"Set Override Price"</strong> to add items.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Product SKU</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Catalog Base Price</th>
                          <th className="p-3">Price List Override Price</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {selectedPriceList.items.map((item) => {
                          const matchedProduct = productList.find((p) => p.sku === item.product_sku || p.id === item.product_id);
                          const basePrice = matchedProduct ? matchedProduct.base_price : 0;
                          const savings = Number(basePrice) - Number(item.custom_price || 0);

                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-indigo-700">{item.product_sku || 'SKU'}</td>
                              <td className="p-3 font-bold text-slate-900">{matchedProduct ? matchedProduct.name : 'Custom Item'}</td>
                              <td className="p-3 font-mono text-slate-600">{formatPrice(basePrice)}</td>
                              <td className="p-3 font-mono font-bold text-emerald-700">
                                {formatPrice(item.custom_price)}
                                {savings > 0 && <span className="text-[10px] text-indigo-600 block font-normal">Save {formatPrice(savings)}</span>}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeletePriceListItem(item.id)}
                                  title="Remove Override Item"
                                  className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer focus:outline-none"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              Select a price list from the left panel to inspect and configure product price overrides.
            </div>
          )}
        </div>
      )}

      {/* --- CREATE / EDIT PRICE LIST MODAL --- */}
      {showPriceListModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPriceList ? 'Edit Custom Price List' : 'Create Custom Price List'}
              </h3>
              <button
                onClick={() => setShowPriceListModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePriceList} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price List Name *</label>
                <input
                  type="text"
                  value={priceListForm.name}
                  onChange={(e) => setPriceListForm({ ...priceListForm, name: e.target.value })}
                  placeholder="e.g. Gold Partner Special Price List"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price List Code</label>
                  <input
                    type="text"
                    value={priceListForm.code}
                    onChange={(e) => setPriceListForm({ ...priceListForm, code: e.target.value })}
                    placeholder="e.g. GOLD-SPECIAL"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Customer Tier</label>
                  <select
                    value={priceListForm.tier_code}
                    onChange={(e) => setPriceListForm({ ...priceListForm, tier_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="all">All Tiers</option>
                    <option value="bronze">Bronze Partner</option>
                    <option value="silver">Silver Partner</option>
                    <option value="gold">Gold Enterprise</option>
                    <option value="platinum">Platinum Global</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">List Currency</label>
                  <select
                    value={priceListForm.currency_code}
                    onChange={(e) => setPriceListForm({ ...priceListForm, currency_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Active Status</label>
                  <select
                    value={priceListForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setPriceListForm({ ...priceListForm, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="true">Active List</option>
                    <option value="false">Inactive List</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPriceListModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Price List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SET OVERRIDE PRODUCT PRICE MODAL --- */}
      {showAddItemModal && selectedPriceList && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Set Custom Product Price Override</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPriceListItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Target Product *</label>
                <select
                  value={selectedProductSku}
                  onChange={(e) => {
                    setSelectedProductSku(e.target.value);
                    const prod = productList.find((p) => p.sku === e.target.value);
                    if (prod) setCustomOverridePrice(prod.base_price);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="">-- Choose Product from Catalog --</option>
                  {productList.map((p) => (
                    <option key={p.id} value={p.sku}>
                      {p.name} ({p.sku}) - Base: ${p.base_price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Custom Override Price ($) *</label>
                <input
                  type="number"
                  value={customOverridePrice}
                  onChange={(e) => setCustomOverridePrice(e.target.value)}
                  placeholder="Enter custom unit price"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Override Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
