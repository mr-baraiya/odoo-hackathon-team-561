import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  Search,
  Package,
  Boxes,
  DollarSign,
  Tag,
  Sparkles,
  Layers,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

export default function SalesRepCatalogTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [upsellRules, setUpsellRules] = useState([]);
  const [loadingUpsell, setLoadingUpsell] = useState(false);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/catalog/products').catch(() => []),
        apiClient.get('/catalog/categories').catch(() => []),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
    } catch (err) {
      console.error('Failed to load product catalog:', err);
      toast.error('Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    setLoadingUpsell(true);
    try {
      const res = await apiClient.get(`/sales-rep/upsell/${product.id}`);
      setUpsellRules(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.warn('Failed to load upsell suggestions:', err);
      setUpsellRules([]);
    } finally {
      setLoadingUpsell(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      String(p.category_id) === String(selectedCategory) ||
      p.category_name?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product name, SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.category_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Loading product catalog and stock levels...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{prod.sku}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{prod.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {prod.category_name || 'Hardware'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{prod.description || 'Enterprise grade sales operations component'}</p>

                {/* Price & Stock Stats */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Base Price</span>
                    <span className="font-extrabold text-slate-900 text-sm">${Number(prod.base_price || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Warehouse Stock</span>
                    <span className={`font-extrabold text-sm ${Number(prod.stock_quantity || 0) > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {prod.stock_quantity || 25} {prod.unit || 'units'}
                    </span>
                  </div>
                </div>

                {/* Variants preview */}
                {prod.variants && prod.variants.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      <span>Available Variants:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prod.variants.map((v) => (
                        <span key={v.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                          {v.attribute_name}: {v.value} (+${v.extra_price})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSelectProduct(prod)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Details & Upsell Rules</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product Details & Upsell Suggestions Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black text-indigo-600 uppercase">{selectedProduct.sku}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">Description</span>
                <p className="mt-0.5 text-slate-800">{selectedProduct.description || 'No detailed description.'}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Price</span>
                  <span className="font-extrabold text-slate-900">${Number(selectedProduct.base_price || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Tax Rate</span>
                  <span className="font-extrabold text-slate-900">{selectedProduct.tax_rate_pct || 18}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Stock Level</span>
                  <span className="font-extrabold text-emerald-600">{selectedProduct.stock_quantity || 25} {selectedProduct.unit}</span>
                </div>
              </div>

              {/* Upsell / Cross-Sell Suggestions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Upsell & Cross-Sell Products</span>
                </h4>

                {loadingUpsell ? (
                  <div className="p-4 text-center text-slate-400 font-bold">Checking co-purchase rules...</div>
                ) : upsellRules.length === 0 ? (
                  <div className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-200">
                    No active upsell rules configured for this product.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upsellRules.map((rule) => (
                      <div key={rule.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">{rule.suggested_sku}</span>
                          <h5 className="font-bold text-slate-900">{rule.suggested_product_name}</h5>
                          <p className="text-[10px] text-slate-500">Co-purchase affinity score: {(Number(rule.co_purchase_score) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-indigo-700 block">${Number(rule.base_price).toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Recommended Bundle</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
