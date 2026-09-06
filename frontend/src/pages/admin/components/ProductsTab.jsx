import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Download, Eye, Edit, Trash2, X, Tag, Percent, Layers, ShieldAlert, CheckCircle2,
  AlertCircle, Package, Sparkles, Boxes, TrendingUp, Info, Sliders, DollarSign, Warehouse,
  Zap, Check, ShoppingBag, BarChart3, AlertTriangle
} from 'lucide-react';
import productService from '../../../services/product.service';
import apiClient from '../../../services/apiClient';

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
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('hardware');
  const [newCatCeiling, setNewCatCeiling] = useState(15);
  const [newCatParentId, setNewCatParentId] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewModalTab, setViewModalTab] = useState('overview');
  const [viewModalUpsells, setViewModalUpsells] = useState([]);
  const [viewModalStock, setViewModalStock] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const handleOpenProductModal = async (productToEdit = null) => {
    setFormErrors({});
    if (productToEdit) {
      setEditingProduct(productToEdit);
      let vars = Array.isArray(productToEdit.variants) ? productToEdit.variants : [];
      try {
        const fullProd = await productService.getProductById(productToEdit.id);
        if (fullProd && Array.isArray(fullProd.variants)) {
          vars = fullProd.variants;
        }
      } catch (e) {}

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
        variants: vars,
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

  const handleViewProduct = async (prod) => {
    setViewingProduct(prod);
    setViewModalTab('overview');
    setShowViewModal(true);
    setLoadingDetails(true);

    try {
      const [upsellRes, stockRes, prodRes] = await Promise.allSettled([
        apiClient.get('/upsell-rules'),
        apiClient.get('/inventory'),
        productService.getProductById(prod.id),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value) {
        setViewingProduct(prodRes.value);
      }

      let upsells = [];
      if (upsellRes.status === 'fulfilled' && Array.isArray(upsellRes.value)) {
        upsells = upsellRes.value.filter(
          (u) =>
            String(u.base_product_id) === String(prod.id) ||
            (u.base_product_sku && u.base_product_sku === prod.sku)
        );
      }
      setViewModalUpsells(upsells);

      let stockList = [];
      if (stockRes.status === 'fulfilled' && Array.isArray(stockRes.value)) {
        stockList = stockRes.value.filter(
          (s) =>
            String(s.product_id) === String(prod.id) ||
            (s.product_sku && s.product_sku === prod.sku)
        );
      }
      setViewModalStock(stockList);
    } catch (err) {
      console.warn('[ProductsTab handleViewProduct] Error loading extra details:', err);
    } finally {
      setLoadingDetails(false);
    }
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

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatCeiling(15);
    setNewCatParentId('');
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setNewCatName(cat.name || '');
    setNewCatCeiling(cat.discount_ceiling_pct !== undefined ? cat.discount_ceiling_pct : 15);
    setNewCatParentId(cat.parent_id || '');
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete sub-category "${catName}"?`)) return;

    try {
      await productService.deleteCategory(catId);
      toast.success(`Sub-category "${catName}" deleted successfully!`);
      await fetchCategories();
      if (editingCategory && editingCategory.id === catId) {
        resetCategoryForm();
      }
    } catch (err) {
      console.error('[ProductsTab handleDeleteCategory] Error:', err);
      toast.error(err.message || 'Failed to delete sub-category.');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Sub-Category Name is required.');
      return;
    }

    let targetParent = categoriesList.find((c) => c.id === newCatParentId) || categoriesList.find((c) => !c.parent_id);
    if (!targetParent) {
      toast.error('Please select a Main Parent Category (Hardware, Services, or Subscriptions).');
      return;
    }

    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, {
          name: newCatName.trim(),
          category_type: targetParent.category_type || 'hardware',
          discount_ceiling_pct: Number(newCatCeiling || targetParent.discount_ceiling_pct || 15),
          parent_id: targetParent.id,
        });
        toast.success(`Sub-category "${newCatName.trim()}" updated successfully!`);
      } else {
        await productService.createCategory({
          name: newCatName.trim(),
          category_type: targetParent.category_type || 'hardware',
          discount_ceiling_pct: Number(newCatCeiling || targetParent.discount_ceiling_pct || 15),
          parent_id: targetParent.id,
        });
        toast.success(`Sub-category "${newCatName.trim()}" added under ${targetParent.name}!`);
      }
      await fetchCategories();
      resetCategoryForm();
    } catch (err) {
      console.error('[ProductsTab handleSaveCategory] Error:', err);
      toast.error(err.message || 'Failed to save sub-category.');
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
            <option value="all">All Categories & Sub-Categories</option>
            {categoriesList.filter(c => !c.parent_id).map((mainCat) => {
              const subCats = categoriesList.filter(sc => sc.parent_id === mainCat.id);
              return (
                <optgroup key={mainCat.id} label={`${mainCat.name} (${mainCat.category_type.toUpperCase()})`}>
                  <option value={mainCat.id}>{mainCat.name} (All {mainCat.name})</option>
                  {subCats.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      &nbsp;&nbsp;↳ {sc.name} ({sc.discount_ceiling_pct}% Ceiling)
                    </option>
                  ))}
                </optgroup>
              );
            })}
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
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Category / Sub-Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {categoriesList.filter(c => !c.parent_id).map((mainCat) => {
                      const subCats = categoriesList.filter(sc => sc.parent_id === mainCat.id);
                      return (
                        <optgroup key={mainCat.id} label={`${mainCat.name} (${mainCat.category_type.toUpperCase()})`}>
                          <option value={mainCat.id}>{mainCat.name} (General)</option>
                          {subCats.map((sc) => (
                            <option key={sc.id} value={sc.id}>
                              &nbsp;&nbsp;↳ {sc.name} ({sc.discount_ceiling_pct}% Ceiling)
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {viewingProduct.sku}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      (viewingProduct.status || (viewingProduct.is_active ? 'active' : 'draft')) === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : (viewingProduct.status || (viewingProduct.is_active ? 'active' : 'draft')) === 'draft'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {viewingProduct.status || (viewingProduct.is_active ? 'active' : 'draft')}
                  </span>
                  {viewingProduct.is_promoted && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-purple-200 flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{viewingProduct.promo_discount_pct || 10}% PROMO</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{viewingProduct.name}</h3>
                <p className="text-xs text-slate-500 flex items-center space-x-2">
                  <span>Category: <strong className="text-slate-800 uppercase">{viewingProduct.category_name || 'Hardware'}</strong></span>
                  <span>•</span>
                  <span>Unit: <strong className="text-slate-800">{viewingProduct.unit || 'unit'}</strong></span>
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center space-x-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setViewModalTab('overview')}
                className={`px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                  viewModalTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Overview & Pricing</span>
              </button>

              <button
                onClick={() => setViewModalTab('variants')}
                className={`px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                  viewModalTab === 'variants'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Variants & Add-ons</span>
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {viewingProduct.variants?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setViewModalTab('addons')}
                className={`px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                  viewModalTab === 'addons'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upsell & Pairing Rules</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {viewModalUpsells.length}
                </span>
              </button>

              <button
                onClick={() => setViewModalTab('stock')}
                className={`px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                  viewModalTab === 'stock'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>Warehouse Stock</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {viewModalStock.reduce((acc, curr) => acc + Number(curr.quantity_on_hand || 0), 0)}
                </span>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            {loadingDetails ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs">Loading complete product specification details...</p>
              </div>
            ) : (
              <div>
                {/* TAB 1: OVERVIEW & PRICING */}
                {viewModalTab === 'overview' && (
                  <div className="space-y-4 text-xs">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Base List Price</span>
                        <span className="font-mono font-bold text-slate-900 text-base">
                          ${Number(viewingProduct.base_price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Cost Price</span>
                        <span className="font-mono font-semibold text-slate-700 text-base">
                          ${Number(viewingProduct.cost_price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Gross Profit</span>
                        <span className="font-mono font-bold text-indigo-700 text-base">
                          ${(Number(viewingProduct.base_price || 0) - Number(viewingProduct.cost_price || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Gross Margin</span>
                        <span className="font-mono font-extrabold text-emerald-700 text-base">
                          {calculateMargin(viewingProduct.base_price, viewingProduct.cost_price)}%
                        </span>
                      </div>
                    </div>

                    {/* Secondary Specs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Tax Rate</span>
                        <span className="font-mono font-bold text-slate-900">{viewingProduct.tax_rate_pct || 18}% GST / VAT</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Category Ceiling Rule</span>
                        <span className="font-semibold text-indigo-700">
                          Max {categoriesList.find((c) => c.id === viewingProduct.category_id)?.discount_ceiling_pct || 15}% Discount
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Promotional Status</span>
                        {viewingProduct.is_promoted ? (
                          <span className="font-bold text-purple-700">
                            {viewingProduct.promo_discount_pct || 10}% OFF Promo Active
                          </span>
                        ) : (
                          <span className="font-medium text-slate-500">Standard List Pricing</span>
                        )}
                      </div>
                    </div>

                    {/* Promo Price Highlights */}
                    {viewingProduct.is_promoted && (
                      <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-purple-700 shrink-0" />
                          <div>
                            <p className="font-bold text-purple-900">Active Promotional Discount</p>
                            <p className="text-[11px] text-purple-700">
                              Applies a {viewingProduct.promo_discount_pct || 10}% discount to base pricing automatically during quotation line entry.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-purple-600 block uppercase font-bold">Net Promo Price</span>
                          <span className="font-mono font-extrabold text-purple-900 text-sm">
                            ${(Number(viewingProduct.base_price || 0) * (1 - (viewingProduct.promo_discount_pct || 10) / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Description & Scope */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                        Product Specification & Feature Scope
                      </span>
                      <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed min-h-[60px]">
                        {viewingProduct.description || 'No detailed description specified for this product.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: VARIANTS & ATTRIBUTES */}
                {viewModalTab === 'variants' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Configured Product Variants & Options
                      </h4>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleOpenProductModal(viewingProduct);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Manage Variants</span>
                      </button>
                    </div>

                    {viewingProduct.variants && viewingProduct.variants.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="p-2.5">Attribute</th>
                              <th className="p-2.5">Option Value</th>
                              <th className="p-2.5">Extra Charge ($)</th>
                              <th className="p-2.5 text-right">Combined Variant List Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800">
                            {viewingProduct.variants.map((v) => {
                              const extra = Number(v.extra_price || 0);
                              const totalVarPrice = Number(viewingProduct.base_price || 0) + extra;
                              return (
                                <tr key={v.id || v.attribute_name} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-2.5 font-bold text-indigo-700">{v.attribute_name}</td>
                                  <td className="p-2.5 font-medium">{v.value}</td>
                                  <td className="p-2.5 font-mono">
                                    {extra > 0 ? (
                                      <span className="text-emerald-700 font-bold">+${extra.toLocaleString()}</span>
                                    ) : (
                                      <span className="text-slate-400">+$0 (Included)</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                    ${totalVarPrice.toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
                        <Sliders className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="font-bold text-slate-800">No Custom Variants Configured</p>
                        <p className="text-slate-500 max-w-sm mx-auto">
                          This product is currently offered as a standard single SKU without extra memory, storage, or license term add-ons.
                        </p>
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            handleOpenProductModal(viewingProduct);
                          }}
                          className="mt-2 inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Variant Attributes</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: UPSELL & PAIRING RULES */}
                {viewModalTab === 'addons' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Automated Upsell Rules & Suggested Add-ons
                      </h4>
                      <span className="text-[11px] text-slate-500">Engine-powered recommendation pairing</span>
                    </div>

                    {viewModalUpsells.length > 0 ? (
                      <div className="space-y-2">
                        {viewModalUpsells.map((rule) => {
                          const scorePct = Math.round(Number(rule.co_purchase_score || 0.8) * 100);
                          return (
                            <div
                              key={rule.id}
                              className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                                    {rule.suggested_product_sku || 'ADD-ON'}
                                  </span>
                                  <span className="font-bold text-slate-900 text-xs">{rule.suggested_product_name}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[11px] text-slate-600">
                                  <span>Affinity Score: <strong className="text-purple-700">{scorePct}%</strong></span>
                                  <span>•</span>
                                  <span>Required Min Margin: <strong className="text-emerald-700">{rule.min_margin_pct_required || 15}%</strong></span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Add-on Price</span>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  ${Number(rule.suggested_price || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                        <p className="font-bold text-slate-800">No Specific Upsell Rules Linked</p>
                        <p className="text-slate-500 max-w-md mx-auto">
                          Standard complementary add-ons like Onsite Deployment & Extended Support are automatically available during quote creation based on category affinity.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: WAREHOUSE STOCK */}
                {viewModalTab === 'stock' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Warehouse Stock Allocation & Inventory
                      </h4>
                      <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px]">
                        Total On Hand: {viewModalStock.reduce((acc, curr) => acc + Number(curr.quantity_on_hand || 0), 0)} Units
                      </span>
                    </div>

                    {viewModalStock.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="p-2.5">Depot Warehouse Location</th>
                              <th className="p-2.5">Qty on Hand</th>
                              <th className="p-2.5">Reorder Level</th>
                              <th className="p-2.5 text-right">Inventory Health Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800">
                            {viewModalStock.map((stk) => {
                              const qty = Number(stk.quantity_on_hand || 0);
                              const threshold = Number(stk.reorder_threshold || 2);
                              const status = qty === 0 ? 'Out of Stock' : qty <= threshold ? 'Low Stock Warning' : 'In Stock';
                              return (
                                <tr key={stk.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-2.5 font-bold text-slate-900">
                                    <div>
                                      <span>{stk.warehouse_name || 'Central Warehouse'}</span>
                                      {stk.warehouse_location && (
                                        <span className="text-[10px] text-slate-500 block font-normal">{stk.warehouse_location}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-slate-900">{qty} Units</td>
                                  <td className="p-2.5 font-mono text-slate-600">{threshold} Units</td>
                                  <td className="p-2.5 text-right">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                        qty === 0
                                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                                          : qty <= threshold
                                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      }`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
                        <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="font-bold text-slate-800">No Warehouse Allocation Records</p>
                        <p className="text-slate-500 max-w-sm mx-auto">
                          This product item does not have physical warehouse stock constraints or is managed as an unlimited digital service / subscription.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenProductModal(viewingProduct);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Product Record</span>
              </button>

              <button
                onClick={() => setShowViewModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
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
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form to add or edit sub-category */}
            <form onSubmit={handleSaveCategory} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  {editingCategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}
                </h4>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold cursor-pointer"
                  >
                    + Switch to Add New
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="text-slate-600 text-[10px] uppercase font-bold block mb-0.5">Select Main Parent Category *</label>
                  <select
                    value={newCatParentId || (categoriesList.find(c => !c.parent_id)?.id || '')}
                    onChange={(e) => setNewCatParentId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none cursor-pointer font-bold"
                  >
                    {categoriesList.filter(c => !c.parent_id).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.category_type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 text-[10px] uppercase font-bold block mb-0.5">Sub-Category Name *</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Rack Servers / Laptops / SaaS Licenses"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-[10px] uppercase font-bold block mb-0.5">Discount Ceiling Limit (%)</label>
                  <input
                    type="number"
                    value={newCatCeiling}
                    onChange={(e) => setNewCatCeiling(e.target.value)}
                    placeholder="15"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div className="flex justify-end items-center space-x-2 pt-1">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    {editingCategory ? 'Update Sub-Category' : '+ Add Sub-Category'}
                  </button>
                </div>
              </div>
            </form>

            {/* List existing categories grouped by main category */}
            <div className="space-y-3 max-h-64 overflow-y-auto text-xs pr-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Main Categories & Sub-Categories</h4>
              {categoriesList.filter(c => !c.parent_id).map((mainCat) => {
                const subCats = categoriesList.filter(sc => sc.parent_id === mainCat.id);
                return (
                  <div key={mainCat.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        <span>{mainCat.name}</span>
                        <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
                          MAIN CATEGORY
                        </span>
                      </span>
                      <span className="font-mono text-slate-600 text-[10px]">{mainCat.discount_ceiling_pct}% Default Ceiling</span>
                    </div>

                    {subCats.length > 0 ? (
                      <div className="space-y-1.5 pl-2 border-l-2 border-indigo-200">
                        {subCats.map((sc) => (
                          <div
                            key={sc.id}
                            className={`flex items-center justify-between bg-white p-2 rounded-lg border transition-colors ${
                              editingCategory?.id === sc.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-semibold text-slate-800 flex items-center space-x-1">
                              <span className="text-indigo-500 font-mono text-xs">↳</span>
                              <span>{sc.name}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-emerald-700 font-bold text-[11px] mr-1">
                                {sc.discount_ceiling_pct}% Ceiling
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEditCategoryClick(sc)}
                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Sub-Category"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(sc.id, sc.name)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Delete Sub-Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pl-3">No custom sub-categories added under {mainCat.name} yet.</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
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
