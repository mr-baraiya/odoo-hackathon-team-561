import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Sparkles,
  Info,
  X,
  FilePlus,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Check,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerCatalogTab({
  products = [],
  categories = [],
  onRequestQuote,
  customerTierCeiling = 18,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalDiscountPct, setModalDiscountPct] = useState(10);

  // Multi-product Quote Basket State
  const [basket, setBasket] = useState([]); // [{ product, quantity }]
  const [showMultiQuoteModal, setShowMultiQuoteModal] = useState(false);
  const [multiDiscountPct, setMultiDiscountPct] = useState(10);

  // Filtered Products
  const filteredProducts = (products || []).filter((p) => {
    const matchesSearch =
      !search.trim() ||
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      String(p.category_id || p.category || '').toLowerCase() === String(selectedCategory).toLowerCase() ||
      (p.category_name || '').toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (prod) => {
    setSelectedProduct(prod);
    setModalQuantity(quantities[prod.id] || 1);
    setModalDiscountPct(10);
  };

  const updateCardQty = (prodId, delta) => {
    setQuantities((prev) => {
      const current = prev[prodId] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [prodId]: updated };
    });
  };

  // Multi-product basket handlers
  const addToBasket = (prod, qty = 1) => {
    setBasket((prev) => {
      const existingIdx = prev.findIndex((item) => String(item.product.id) === String(prod.id));
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        toast.success(`Updated ${prod.name} quantity to ${updated[existingIdx].quantity} in quote basket!`);
        return updated;
      } else {
        toast.success(`Added ${prod.name} (${qty} ${qty === 1 ? 'unit' : 'units'}) to quote basket!`);
        return [...prev, { product: prod, quantity: qty }];
      }
    });
  };

  const updateBasketQty = (prodId, delta) => {
    setBasket((prev) =>
      prev
        .map((item) => {
          if (String(item.product.id) === String(prodId)) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromBasket = (prodId) => {
    setBasket((prev) => prev.filter((item) => String(item.product.id) !== String(prodId)));
    toast.success('Removed product from quote basket.');
  };

  const totalBasketItems = basket.reduce((acc, item) => acc + item.quantity, 0);
  const rawBasketSubtotal = basket.reduce((acc, item) => {
    const price = Number(item.product.base_price || item.product.price || 0);
    return acc + price * item.quantity;
  }, 0);
  const multiDiscountAmt = Math.round((rawBasketSubtotal * multiDiscountPct) / 100);
  const finalMultiTotal = Math.max(0, rawBasketSubtotal - multiDiscountAmt);
  const exceedsMultiThreshold = multiDiscountPct > customerTierCeiling;

  const handleSubmitMultiQuote = () => {
    if (basket.length === 0) {
      toast.error('Your quote basket is empty.');
      return;
    }

    const lineItems = basket.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.base_price || item.product.price || 0),
    }));

    if (onRequestQuote) {
      onRequestQuote(lineItems, multiDiscountPct);
    }

    setShowMultiQuoteModal(false);
    setBasket([]);
  };

  return (
    <div className="space-y-6">
      {/* Sticky Multi-Product Quote Basket Bar */}
      {basket.length > 0 && (
        <div className="sticky top-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold relative shrink-0">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                {basket.length}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Multi-Product Quote Basket</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40 font-mono font-bold">
                  {totalBasketItems} {totalBasketItems === 1 ? 'unit' : 'total units'} ({basket.length} {basket.length === 1 ? 'product' : 'products'})
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Gross Combined Subtotal: <strong className="text-emerald-400 font-mono">${rawBasketSubtotal.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setBasket([])}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Clear Basket
            </button>
            <button
              type="button"
              onClick={() => setShowMultiQuoteModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1.5"
            >
              <FilePlus className="w-4 h-4" />
              <span>Review & Submit Quote ({basket.length} products) →</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or specs..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center space-x-3">
            <span>Showing <strong className="text-slate-900">{filteredProducts.length}</strong> Products</span>
            {basket.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMultiQuoteModal(true)}
                className="text-indigo-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Basket ({basket.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Categories:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Products
          </button>

          {Array.isArray(categories) &&
            categories.map((cat) => (
              <button
                key={cat.id || cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.id || cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === (cat.id || cat.name)
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const cardQty = quantities[prod.id] || 1;
            const stockQty = prod.stock_quantity !== undefined ? prod.stock_quantity : 25;
            const unitPrice = Number(prod.base_price || prod.price || 0);
            const inBasketItem = basket.find((i) => String(i.product.id) === String(prod.id));

            return (
              <div
                key={prod.id || prod.sku}
                className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  inBasketItem ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      SKU: {prod.sku || 'PROD-N/A'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                      <span>{stockQty} units in inventory</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description || 'Enterprise hardware & software product solution.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-900">
                        ${unitPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400"> / unit</span>
                    </div>
                    {cardQty > 1 && (
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Total: ${(unitPrice * cardQty).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Quantity Increase / Decrease Control */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Quantity Needed:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => updateCardQty(prod.id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={stockQty || 9999}
                        value={cardQty}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setQuantities((prev) => ({ ...prev, [prod.id]: val }));
                        }}
                        className="w-12 text-center bg-slate-50 border border-slate-300 rounded-lg py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => updateCardQty(prod.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => addToBasket(prod, cardQty)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                      inBasketItem
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {inBasketItem ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In Basket ({inBasketItem.quantity})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>+ Add to Quote Basket</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestQuote) onRequestQuote(prod, cardQty);
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Direct Quote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">No matching products found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to find products.
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 relative animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold font-mono text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                  SKU: {selectedProduct.sku}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {selectedProduct.description || 'High-performance enterprise hardware component designed for scale.'}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Standard Base Price:</span>
                  <strong className="text-slate-900 font-mono">
                    ${Number(selectedProduct.base_price || selectedProduct.price || 0).toLocaleString()} / {selectedProduct.unit || 'unit'}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Inventory Stock Count:</span>
                  <span className="text-indigo-700 font-mono font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {selectedProduct.stock_quantity !== undefined ? selectedProduct.stock_quantity : 20} units in inventory
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Availability Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock & Ready for Dispatch</span>
                  </span>
                </div>
              </div>

              {/* Quantity Selector & Requested Discount */}
              {(() => {
                const basePrice = Number(selectedProduct.base_price || selectedProduct.price || 0);
                const subtotalVal = basePrice * modalQuantity;
                const discountAmt = Math.round((subtotalVal * modalDiscountPct) / 100);
                const finalProposalTotal = Math.max(0, subtotalVal - discountAmt);
                const exceedsThreshold = modalDiscountPct > customerTierCeiling;

                return (
                  <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="font-bold text-slate-800 block">Specify Quantity Required:</label>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Requesting discount for <strong className="text-indigo-700 font-bold">{modalQuantity} {modalQuantity === 1 ? 'unit' : 'units'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setModalQuantity((prev) => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={selectedProduct.stock_quantity || 9999}
                          value={modalQuantity}
                          onChange={(e) => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center bg-white border border-indigo-300 rounded-lg py-1 text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setModalQuantity((prev) => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-indigo-100">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="font-bold text-slate-800 flex items-center space-x-2">
                          <span>Target Requested Discount:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={modalDiscountPct}
                              onChange={(e) => setModalDiscountPct(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-14 px-2 py-0.5 bg-white border border-indigo-300 rounded-lg text-xs font-mono font-extrabold text-indigo-700 text-center"
                            />
                            <span className="text-indigo-600 font-extrabold text-sm">%</span>
                          </div>
                        </label>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            exceedsThreshold
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {exceedsThreshold
                            ? `>${customerTierCeiling}% Tier Threshold (Escalated to Sales Manager)`
                            : `✓ ≤${customerTierCeiling}% Tier Limit (Handled by Sales Representative / Admin)`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="35"
                        step="1"
                        value={modalDiscountPct}
                        onChange={(e) => setModalDiscountPct(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl space-y-1.5 text-xs text-right border border-indigo-200 shadow-2xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({modalQuantity} {modalQuantity === 1 ? 'unit' : 'units'} @ ${basePrice.toLocaleString()}):</span>
                        <span className="font-mono font-bold">${subtotalVal.toLocaleString()}</span>
                      </div>
                      {modalDiscountPct > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Requested Discount ({modalDiscountPct}%):</span>
                          <span>-${discountAmt.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-indigo-950 font-black text-sm pt-1.5 border-t border-indigo-100">
                        <span>Estimated Proposal Total:</span>
                        <span>${finalProposalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  addToBasket(selectedProduct, modalQuantity);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Multi-Product Basket ({modalQuantity})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Product Quotation Request Modal */}
      {showMultiQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Multi-Product Quotation Request</h3>
                  <p className="text-xs text-slate-500">Combine multiple products into a single custom quote proposal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMultiQuoteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Products Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selected Line Items ({basket.length} {basket.length === 1 ? 'product' : 'products'})
              </h4>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-center">Quantity</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                      <th className="px-4 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {basket.map((item) => {
                      const p = item.product;
                      const unitPrice = Number(p.base_price || p.price || 0);
                      const lineTotal = unitPrice * item.quantity;

                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-bold">
                            <span className="text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] font-mono text-indigo-600">SKU: {p.sku || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">${unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => updateBasketQty(p.id, -1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-mono font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateBasketQty(p.id, 1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-black font-mono">${lineTotal.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromBasket(p.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
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
            </div>

            {/* Requested Target Discount Slider & Numeric Input */}
            <div className="space-y-2 bg-indigo-50/70 p-4 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2 text-xs">
                  <span>Target Requested Order Discount:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={multiDiscountPct}
                      onChange={(e) => setMultiDiscountPct(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-14 px-2 py-0.5 bg-white border border-indigo-300 rounded-lg text-xs font-mono font-extrabold text-indigo-700 text-center"
                    />
                    <span className="text-indigo-600 font-extrabold text-xs">%</span>
                  </div>
                </label>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    exceedsMultiThreshold
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {exceedsMultiThreshold
                    ? `>${customerTierCeiling}% Tier Threshold (Escalated to Sales Manager)`
                    : `✓ ≤${customerTierCeiling}% Tier Limit (Handled by Sales Representative / Admin)`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={multiDiscountPct}
                onChange={(e) => setMultiDiscountPct(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Total Calculation Card */}
            <div className="bg-white p-4 rounded-xl space-y-1.5 text-xs text-right border border-indigo-200 shadow-2xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Combined Subtotal ({totalBasketItems} total units):</span>
                <span className="font-mono font-bold">${rawBasketSubtotal.toLocaleString()}</span>
              </div>
              {multiDiscountPct > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Order Level Discount ({multiDiscountPct}%):</span>
                  <span>-${multiDiscountAmt.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-indigo-950 font-black text-sm pt-2 border-t border-indigo-100">
                <span>Estimated Final Proposal Total:</span>
                <span>${finalMultiTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setBasket([])}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Clear Entire Basket
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMultiQuoteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={handleSubmitMultiQuote}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Submit Multi-Product Quote Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

