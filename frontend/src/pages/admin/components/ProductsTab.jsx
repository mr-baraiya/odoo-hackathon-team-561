import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, Edit, Trash2, X, Tag, Percent, Layers, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import productService from '../../../services/product.service';

export default function ProductsTab({
  productList = [],
  setProductList,
  productSearch = '',
  setProductSearch,
  initialCategories = [],
  handleExportCSV,
  fetchProducts,
}) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [categoriesList, setCategoriesList] = useState(initialCategories || []);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('hardware');
  const [newCatCeiling, setNewCatCeiling] = useState(15);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    unit: 'unit',
    base_price: '',
    cost_price: '',
    tax_rate_pct: 18,
    status: 'active',
    is_promoted: false,
    promo_discount_pct: 10,
    variants: [],
  });

  const [newVariantAttr, setNewVariantAttr] = useState('');
  const [newVariantVal, setNewVariantVal] = useState('');
  const [newVariantExtra, setNewVariantExtra] = useState(0);

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategoriesList(data);
      }
    } catch (err) {
      console.warn('Failed to load categories from API:', err.message);
    }
  };

  const filteredProducts = productList.filter((p) => {
    const matchesCategory =
      categoryFilter === 'all' ||
      p.category_id === categoryFilter ||
      (p.category_name && p.category_name.toLowerCase() === categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (p.is_active || p.status === 'active')) ||
      (statusFilter === 'draft' && (p.status === 'draft' || (!p.is_active && p.status !== 'discontinued'))) ||
      (statusFilter === 'discontinued' && p.status === 'discontinued');

    const query = productSearch.toLowerCase();
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleOpenProductModal = (productToEdit = null) => {
    setFormErrors({});
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setProductForm({
        sku: productToEdit.sku || '',
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        category_id: productToEdit.category_id || (categoriesList[0] ? categoriesList[0].id : ''),
        unit: productToEdit.unit || 'unit',
        base_price: productToEdit.base_price !== undefined ? productToEdit.base_price : '',
        cost_price: productToEdit.cost_price !== undefined ? productToEdit.cost_price : '',
        tax_rate_pct: productToEdit.tax_rate_pct !== undefined ? productToEdit.tax_rate_pct : 18,
        status: productToEdit.status || (productToEdit.is_active ? 'active' : 'draft'),
        is_promoted: Boolean(productToEdit.is_promoted),
        promo_discount_pct: productToEdit.promo_discount_pct || 10,
        variants: Array.isArray(productToEdit.variants) ? productToEdit.variants : [],
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        sku: '',
        name: '',
        description: '',
        category_id: categoriesList[0] ? categoriesList[0].id : '',
        unit: 'unit',
        base_price: '',
        cost_price: '',
        tax_rate_pct: 18,
        status: 'active',
        is_promoted: false,
        promo_discount_pct: 10,
        variants: [],
      });
    }
    setShowProductModal(true);
  };

  const handleViewProduct = (prod) => {
    setViewingProduct(prod);
    setShowViewModal(true);
  };

  const handleAddVariant = () => {
    if (!newVariantAttr.trim() || !newVariantVal.trim()) {
      toast.error('Please specify both variant attribute and value (e.g. RAM: 64GB).');
      return;
    }
    const newVariant = {
      id: `var_${Date.now()}`,
      attribute_name: newVariantAttr.trim(),
      value: newVariantVal.trim(),
      extra_price: Number(newVariantExtra || 0),
    };
    setProductForm({ ...productForm, variants: [...productForm.variants, newVariant] });
    setNewVariantAttr('');
    setNewVariantVal('');
    setNewVariantExtra(0);
  };

  const handleRemoveVariant = (variantId) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants.filter((v) => v.id !== variantId),
    });
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productForm.name || !productForm.name.trim()) {
      errors.name = 'Product Name is required.';
    }
    if (productForm.base_price === '' || isNaN(productForm.base_price) || Number(productForm.base_price) < 0) {
      errors.base_price = 'Base List Price must be a non-negative number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    try {
      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct.id, productForm);
        toast.success(`Product "${productForm.name}" updated successfully!`);
        if (typeof setProductList === 'function') {
          setProductList((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p)));
        }
      } else {
        const created = await productService.createProduct(productForm);
        toast.success(`New product "${productForm.name}" created!`);
        if (typeof setProductList === 'function' && created) {
          setProductList((prev) => [created, ...prev]);
        }
      }

      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
      setShowProductModal(false);
    } catch (err) {
      console.error('[ProductsTab handleSaveProduct] Error:', err);
      toast.error(err.message || 'Failed to save product record.');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete product "${productName}"?`)) return;

    try {
      await productService.deleteProduct(productId);
      toast.success(`Product "${productName}" deleted.`);
      if (typeof setProductList === 'function') {
        setProductList((prev) => prev.filter((p) => p.id !== productId));
      }
      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
    } catch (err) {
      console.error('[ProductsTab handleDeleteProduct] Error:', err);
      toast.error(err.message || 'Failed to delete product.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category Name is required.');
      return;
    }

    try {
      const created = await productService.createCategory({
        name: newCatName.trim(),
        category_type: newCatType,
        discount_ceiling_pct: Number(newCatCeiling || 15),
      });
      toast.success(`Category "${newCatName}" created in database!`);
      await fetchCategories();
      setNewCatName('');
      setNewCatCeiling(15);
    } catch (err) {
      console.error('[ProductsTab handleCreateCategory] Error:', err);
      toast.error(err.message || 'Failed to create category.');
    }
  };

  const calculateMargin = (base, cost) => {
    const b = Number(base || 0);
    const c = Number(cost || 0);
    if (b <= 0) return 0;
    return (((b - c) / b) * 100).toFixed(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Product & Service Catalog</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
              {filteredProducts.length} Products
            </span>
          </h2>
          <p className="text-xs text-slate-600">
            Manage SKUs, categories, variants, base list prices, cost margins, product statuses, and promotional discounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenProductModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() =>
              handleExportCSV(
                'Products',
                filteredProducts.map((p) => [
                  p.sku,
                  p.name,
                  p.category_name || 'Hardware',
                  p.unit || 'unit',
                  p.base_price,
                  p.cost_price || 0,
                  p.status || (p.is_active ? 'active' : 'draft'),
                  p.is_promoted ? `${p.promo_discount_pct || 10}% OFF` : 'None',
                ]),
                ['SKU', 'Product Name', 'Category', 'Unit', 'Base Price', 'Cost Price', 'Status', 'Promotion']
              )
            }
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by SKU or Name..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.discount_ceiling_pct || 15}% Ceiling)
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">SKU Code</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">List Price</th>
              <th className="p-3">Cost Price</th>
              <th className="p-3">Gross Margin</th>
              <th className="p-3">Status</th>
              <th className="p-3">Promotion</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-slate-500">
                  No products found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const category = categoriesList.find((cat) => cat.id === p.category_id);
                const marginPct = calculateMargin(p.base_price, p.cost_price);
                const currentStatus = p.status || (p.is_active ? 'active' : 'draft');
                const promoPct = p.promo_discount_pct || 10;
                const promoPrice = p.is_promoted ? Number(p.base_price || 0) * (1 - promoPct / 100) : null;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">{p.sku}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>
                        <span className="truncate max-w-[200px] block">{p.name}</span>
                        {p.variants && p.variants.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            {p.variants.length} Variant(s) available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[10px] font-bold uppercase border border-slate-200">
                        {category?.name || p.category_name || 'Hardware'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${Number(p.base_price || 0).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      ${Number(p.cost_price || 0).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`font-mono font-bold ${Number(marginPct) > 40 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {marginPct}%
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                          currentStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : currentStatus === 'draft'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {p.is_promoted ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                          <Tag className="w-3 h-3" />
                          <span>{promoPct}% OFF (${promoPrice ? promoPrice.toFixed(0) : ''})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      {/* VIEW ICON BUTTON */}
                      <button
                        onClick={() => handleViewProduct(p)}
                        title="View Product Details"
                        className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* EDIT ICON BUTTON */}
                      <button
                        onClick={() => handleOpenProductModal(p)}
                        title="Edit Product Details"
                        className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* DELETE ICON BUTTON */}
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        title="Delete Product"
                        className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Item' : 'Add New Catalog Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Enterprise Cloud SaaS Platform License"
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                      formErrors.name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="Leave blank to auto-generate"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Product Pricing & Cost Margin</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base List Price ($) *</label>
                    <input
                      type="number"
                      value={productForm.base_price}
                      onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                    <input
                      type="number"
                      value={productForm.cost_price}
                      onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={productForm.tax_rate_pct}
                      onChange={(e) => setProductForm({ ...productForm, tax_rate_pct: e.target.value })}
                      placeholder="18"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {productForm.base_price && (
                  <div className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between pt-1">
                    <span>Calculated Gross Margin:</span>
                    <span className="font-mono font-bold">{calculateMargin(productForm.base_price, productForm.cost_price)}%</span>
                  </div>
                )}
              </div>

              {/* Status and Promotions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Status</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="active">Active (Available for Quotes)</option>
                    <option value="draft">Draft (In Review)</option>
                    <option value="discontinued">Discontinued (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Promotional Discount</label>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={productForm.is_promoted}
                        onChange={(e) => setProductForm({ ...productForm, is_promoted: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Enable Promo</span>
                    </label>

                    {productForm.is_promoted && (
                      <input
                        type="number"
                        value={productForm.promo_discount_pct}
                        onChange={(e) => setProductForm({ ...productForm, promo_discount_pct: e.target.value })}
                        placeholder="Discount %"
                        className="w-24 bg-purple-50 border border-purple-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-900 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Product Variants Section */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Product Variants & Add-ons</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newVariantAttr}
                    onChange={(e) => setNewVariantAttr(e.target.value)}
                    placeholder="Attribute (e.g. License Term / RAM)"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newVariantVal}
                    onChange={(e) => setNewVariantVal(e.target.value)}
                    placeholder="Value (e.g. Annual / 64GB)"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newVariantExtra}
                    onChange={(e) => setNewVariantExtra(e.target.value)}
                    placeholder="Extra $"
                    className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold cursor-pointer shrink-0"
                  >
                    + Variant
                  </button>
                </div>

                {productForm.variants.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {productForm.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">
                          {v.attribute_name}: <strong>{v.value}</strong>
                          {v.extra_price > 0 && <span className="text-emerald-700 ml-1 font-mono">(+${v.extra_price})</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Enter detailed specification or feature scope..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRODUCT DETAILS MODAL --- */}
      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingProduct.name}</h3>
                <p className="text-xs text-slate-500 font-mono">SKU: {viewingProduct.sku}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Base Price</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">${Number(viewingProduct.base_price || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cost Price</span>
                  <span className="font-mono font-semibold text-slate-700 text-sm">${Number(viewingProduct.cost_price || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Gross Margin</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{calculateMargin(viewingProduct.base_price, viewingProduct.cost_price)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Category</span>
                  <span className="font-semibold text-indigo-700 uppercase">{viewingProduct.category_name || 'Hardware'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                  <span className="font-bold text-slate-800 uppercase">{viewingProduct.status || (viewingProduct.is_active ? 'active' : 'draft')}</span>
                </div>
              </div>

              {viewingProduct.description && (
                <div className="space-y-1 border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Description</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Configured Variants</span>
                  <div className="space-y-1">
                    {viewingProduct.variants.map((v) => (
                      <div key={v.id} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">{v.attribute_name}: {v.value}</span>
                        {v.extra_price > 0 && <span className="font-mono text-emerald-700 font-bold">+${v.extra_price}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CATEGORY MANAGER MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Manage Product Categories</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form to add new category */}
            <form onSubmit={handleCreateCategory} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Add New Category</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name (e.g. Cloud Services)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 text-[10px] uppercase font-bold block mb-0.5">Category Type</label>
                    <select
                      value={newCatType}
                      onChange={(e) => setNewCatType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="hardware">Hardware</option>
                      <option value="service">Service</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 text-[10px] uppercase font-bold block mb-0.5">Discount Ceiling (%)</label>
                    <input
                      type="number"
                      value={newCatCeiling}
                      onChange={(e) => setNewCatCeiling(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    + Save Category to DB
                  </button>
                </div>
              </div>
            </form>

            {/* List existing categories */}
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Existing Categories</h4>
              <div className="space-y-1.5">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900">{cat.name}</span>
                    <span className="font-mono text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {cat.discount_ceiling_pct || 15}% Ceiling
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
