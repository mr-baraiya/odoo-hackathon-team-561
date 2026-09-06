import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, Edit, Trash2, X, Building2 } from 'lucide-react';
import customerService from '../../../services/customer.service';
import { exportInvoicePDF } from '../../../utils/invoicePdfGenerator';

export default function CustomersTab({
  customersList = [],
  setCustomersList,
  customerSearch,
  setCustomerSearch,
  customerTierFilter,
  setCustomerTierFilter,
  tiersList = [],
  salesReps = [],
  handleExportCSV,
  fetchCustomers,
}) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('overview');

  // Customer activity history state (quotations, orders, invoices)
  const [customerQuotations, setCustomerQuotations] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [sameAsBilling, setSameAsBilling] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    company_name: '',
    tier_code: 'gold',
    currency_code: 'USD',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    primary_contact_role: 'Procurement Manager',
    sales_rep_id: '',
    billing_address: '',
    shipping_address: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const filteredCustomers = customersList.filter((c) => {
    const matchesTier =
      customerTierFilter === 'all' ||
      (c.tier_code && c.tier_code.toLowerCase() === customerTierFilter.toLowerCase());
    const query = customerSearch.toLowerCase();
    const matchesSearch =
      (c.company_name && c.company_name.toLowerCase().includes(query)) ||
      (c.primary_contact_name && c.primary_contact_name.toLowerCase().includes(query)) ||
      (c.primary_contact_email && c.primary_contact_email.toLowerCase().includes(query)) ||
      (c.sales_rep_name && c.sales_rep_name.toLowerCase().includes(query));
    return matchesTier && matchesSearch;
  });

  const handleOpenFormModal = (customerToEdit = null) => {
    setFormErrors({});
    setSameAsBilling(false);
    if (customerToEdit) {
      setEditingCustomer(customerToEdit);
      setCustomerForm({
        company_name: customerToEdit.company_name || '',
        tier_code: customerToEdit.tier_code || 'gold',
        currency_code: customerToEdit.currency_code || 'USD',
        primary_contact_name: customerToEdit.primary_contact_name || '',
        primary_contact_email: customerToEdit.primary_contact_email || '',
        primary_contact_phone: customerToEdit.primary_contact_phone || '',
        primary_contact_role: customerToEdit.primary_contact_role || 'Procurement Manager',
        sales_rep_id: customerToEdit.sales_rep_id || '',
        billing_address: customerToEdit.billing_address || '',
        shipping_address: customerToEdit.shipping_address || '',
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        company_name: '',
        tier_code: 'gold',
        currency_code: 'USD',
        primary_contact_name: '',
        primary_contact_email: '',
        primary_contact_phone: '',
        primary_contact_role: 'Procurement Manager',
        sales_rep_id: salesReps.length > 0 ? salesReps[0].id : '',
        billing_address: '',
        shipping_address: '',
      });
    }
    setShowFormModal(true);
  };

  const handleViewCustomer = async (customer) => {
    setViewingCustomer(customer);
    setActiveViewTab('overview');
    setShowViewModal(true);
    setLoadingHistory(true);

    try {
      const [quotesData, ordersData, invoicesData] = await Promise.all([
        customerService.getCustomerQuotations(customer.id).catch(() => []),
        customerService.getCustomerOrders(customer.id).catch(() => []),
        customerService.getCustomerInvoices(customer.id).catch(() => []),
      ]);

      setCustomerQuotations(Array.isArray(quotesData) ? quotesData : []);
      setCustomerOrders(Array.isArray(ordersData) ? ordersData : []);
      setCustomerInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (err) {
      console.warn('Failed to load customer history details:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!customerForm.company_name || !customerForm.company_name.trim()) {
      errors.company_name = 'Company Name is required.';
    }

    if (customerForm.primary_contact_email && customerForm.primary_contact_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerForm.primary_contact_email.trim())) {
        errors.primary_contact_email = 'Invalid email address format.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    const payload = {
      ...customerForm,
      shipping_address: sameAsBilling ? customerForm.billing_address : customerForm.shipping_address,
    };

    try {
      if (editingCustomer) {
        const updated = await customerService.updateCustomer(editingCustomer.id, payload);
        toast.success(`Customer "${customerForm.company_name}" updated successfully!`);
        if (updated && updated.id && typeof setCustomersList === 'function') {
          setCustomersList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
      } else {
        const created = await customerService.createCustomer(payload);
        toast.success(`New Customer "${customerForm.company_name}" created successfully!`);
        if (created && created.id && typeof setCustomersList === 'function') {
          setCustomersList((prev) => [created, ...prev]);
        }
      }

      if (typeof fetchCustomers === 'function') {
        await fetchCustomers();
      }
      setShowFormModal(false);
    } catch (err) {
      console.error('[CustomersTab handleSaveCustomer] Error:', err);
      toast.error(err.message || 'Failed to save customer record.');
    }
  };

  const handleDeleteCustomer = async (customerId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete customer "${companyName}"?`)) return;

    try {
      await customerService.deleteCustomer(customerId);
      toast.success(`Customer "${companyName}" deleted.`);
      if (typeof setCustomersList === 'function') {
        setCustomersList((prev) => prev.filter((c) => c.id !== customerId));
      }
      if (typeof fetchCustomers === 'function') {
        await fetchCustomers();
      }
    } catch (err) {
      console.error('[CustomersTab handleDeleteCustomer] Error:', err);
      toast.error(err.message || 'Failed to delete customer.');
    }
  };

  const getTierBadgeClass = (tierCode) => {
    const code = String(tierCode || '').toLowerCase();
    switch (code) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'bronze':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Customer Companies & Tiers</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
              {filteredCustomers.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-600">
            Manage customer accounts, assign sales reps, set Bronze/Silver/Gold/Platinum tiers, and inspect quote/order history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenFormModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() =>
              handleExportCSV(
                'Customers',
                filteredCustomers.map((c) => [
                  c.id,
                  c.company_name,
                  c.tier_code || 'gold',
                  c.currency_code || 'USD',
                  c.sales_rep_name || 'Unassigned',
                  c.primary_contact_name || '',
                  c.primary_contact_email || '',
                ]),
                ['ID', 'Company Name', 'Tier', 'Currency', 'Sales Rep', 'Contact Name', 'Contact Email']
              )
            }
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search by company name, primary contact, or sales rep..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <select
          value={customerTierFilter}
          onChange={(e) => setCustomerTierFilter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
        >
          <option value="all">All Tiers (Bronze, Silver, Gold, Platinum)</option>
          <option value="bronze">Bronze Partner (5% Ceiling)</option>
          <option value="silver">Silver Partner (10% Ceiling)</option>
          <option value="gold">Gold Enterprise (15% Ceiling)</option>
          <option value="platinum">Platinum Global (25% Ceiling)</option>
        </select>
      </div>

      {/* Customers Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Company Name</th>
              <th className="p-3">Customer Tier</th>
              <th className="p-3">Sales Representative</th>
              <th className="p-3">Primary Contact</th>
              <th className="p-3">Contact Email</th>
              <th className="p-3">Max Discount</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No customers found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const tierCode = c.tier_code || c.tier_label || 'gold';
                const matchedTier = tiersList.find((t) => (t.code && t.code.toLowerCase() === tierCode.toLowerCase()) || t.id === c.tier_id);
                const discountCeiling = matchedTier ? matchedTier.default_discount_ceiling_pct : c.default_discount_ceiling_pct || 15;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                          {c.company_name ? c.company_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="truncate max-w-[170px]">{c.company_name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getTierBadgeClass(tierCode)}`}>
                        {tierCode}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                      {c.sales_rep_name || (
                        <span className="text-slate-400 font-normal italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-800 font-medium whitespace-nowrap">{c.primary_contact_name || 'N/A'}</td>
                    <td className="p-3 font-mono text-slate-600 truncate max-w-[160px]">{c.primary_contact_email || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{discountCeiling}%</td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      {/* VIEW ICON BUTTON */}
                      <button
                        onClick={() => handleViewCustomer(c)}
                        title="View Customer Profile & History"
                        className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* EDIT ICON BUTTON */}
                      <button
                        onClick={() => handleOpenFormModal(c)}
                        title="Edit Customer Details"
                        className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* DELETE ICON BUTTON */}
                      <button
                        onClick={() => handleDeleteCustomer(c.id, c.company_name)}
                        title="Delete Customer"
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

      {/* --- ADD / EDIT CUSTOMER FORM MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name *</label>
                <input
                  type="text"
                  value={customerForm.company_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, company_name: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                    formErrors.company_name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
                {formErrors.company_name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.company_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Tier */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Tier</label>
                  <select
                    value={customerForm.tier_code}
                    onChange={(e) => setCustomerForm({ ...customerForm, tier_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="bronze">Bronze Partner (5% Ceiling)</option>
                    <option value="silver">Silver Partner (10% Ceiling)</option>
                    <option value="gold">Gold Enterprise (15% Ceiling)</option>
                    <option value="platinum">Platinum Global (25% Ceiling)</option>
                  </select>
                </div>

                {/* Sales Representative */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Sales Rep</label>
                  <select
                    value={customerForm.sales_rep_id || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, sales_rep_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="">-- Select Sales Representative --</option>
                    {salesReps.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} ({rep.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    value={customerForm.primary_contact_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, primary_contact_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={customerForm.primary_contact_email}
                    onChange={(e) => setCustomerForm({ ...customerForm, primary_contact_email: e.target.value })}
                    placeholder="jane.doe@acme.com"
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${
                      formErrors.primary_contact_email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                    }`}
                  />
                  {formErrors.primary_contact_email && <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.primary_contact_email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={customerForm.primary_contact_phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, primary_contact_phone: e.target.value })}
                    placeholder="+1 555-0192"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Base Currency</label>
                  <select
                    value={customerForm.currency_code}
                    onChange={(e) => setCustomerForm({ ...customerForm, currency_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Billing & Shipping Address Section */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Address</label>
                  <textarea
                    rows="2"
                    value={customerForm.billing_address}
                    onChange={(e) => setCustomerForm({ ...customerForm, billing_address: e.target.value })}
                    placeholder="100 Acme Way, Suite 400, New York, NY 10001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shipping Address</label>
                    <label className="flex items-center space-x-1.5 text-xs text-indigo-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => {
                          setSameAsBilling(e.target.checked);
                          if (e.target.checked) {
                            setCustomerForm({ ...customerForm, shipping_address: customerForm.billing_address });
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Same as billing address</span>
                    </label>
                  </div>
                  <textarea
                    rows="2"
                    disabled={sameAsBilling}
                    value={sameAsBilling ? customerForm.billing_address : customerForm.shipping_address}
                    onChange={(e) => setCustomerForm({ ...customerForm, shipping_address: e.target.value })}
                    placeholder="100 Acme Way, Warehouse Dock B, New York, NY 10001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CUSTOMER PROFILE & HISTORY MODAL --- */}
      {showViewModal && viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingCustomer.company_name}</h3>
                <p className="text-xs text-slate-500 font-mono">Customer Account ID: {viewingCustomer.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* TAB NAVIGATION HEADER inside View Modal */}
            <div className="flex items-center space-x-2 border-b border-slate-200">
              <button
                onClick={() => setActiveViewTab('overview')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeViewTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Account Overview
              </button>

              <button
                onClick={() => setActiveViewTab('quotations')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeViewTab === 'quotations'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Quotations</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {customerQuotations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveViewTab('orders')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeViewTab === 'orders'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Orders</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {customerOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveViewTab('invoices')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeViewTab === 'invoices'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Invoices</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {customerInvoices.length}
                </span>
              </button>
            </div>

            {/* TAB CONTENT 1: OVERVIEW */}
            {activeViewTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Customer Tier</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getTierBadgeClass(viewingCustomer.tier_code || viewingCustomer.tier_label)}`}>
                      {viewingCustomer.tier_code || viewingCustomer.tier_label || 'GOLD'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Sales Representative</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{viewingCustomer.sales_rep_name || 'Unassigned'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Base Currency</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">{viewingCustomer.currency_code || 'USD'}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Primary Contact & Designation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Contact Name</span>
                      <span className="font-semibold text-slate-900">{viewingCustomer.primary_contact_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Email Address</span>
                      <span className="font-mono text-slate-900">{viewingCustomer.primary_contact_email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Phone Number</span>
                      <span className="font-mono text-slate-900">{viewingCustomer.primary_contact_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Addresses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Billing Address</span>
                      <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800 border border-slate-200 text-xs">
                        {viewingCustomer.billing_address || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Shipping Address</span>
                      <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800 border border-slate-200 text-xs">
                        {viewingCustomer.shipping_address || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: QUOTATIONS */}
            {activeViewTab === 'quotations' && (
              <div className="space-y-3">
                {loadingHistory ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Loading quotations history...</p>
                ) : customerQuotations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    No quotations generated for this customer yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Quote Ref</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Total Amount</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {customerQuotations.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900">{q.quote_number || q.id}</td>
                            <td className="p-2.5 font-mono text-slate-600">{q.created_at ? String(q.created_at).split('T')[0] : '2026-01-01'}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">${Number(q.total_amount || 0).toLocaleString()}</td>
                            <td className="p-2.5 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {q.status || 'draft'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: ORDERS */}
            {activeViewTab === 'orders' && (
              <div className="space-y-3">
                {loadingHistory ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Loading orders history...</p>
                ) : customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    No confirmed or fulfilled orders found for this customer.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Order Ref</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Total Amount</th>
                          <th className="p-2.5 text-right">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {customerOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900">{o.quote_number || o.id}</td>
                            <td className="p-2.5 font-mono text-slate-600">{o.created_at ? String(o.created_at).split('T')[0] : '2026-01-01'}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">${Number(o.total_amount || 0).toLocaleString()}</td>
                            <td className="p-2.5 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: INVOICES */}
            {activeViewTab === 'invoices' && (
              <div className="space-y-3">
                {loadingHistory ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Loading invoices history...</p>
                ) : customerInvoices.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    No billing invoices generated for this customer.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Invoice ID</th>
                          <th className="p-2.5">Quote Ref</th>
                          <th className="p-2.5">Issued Date</th>
                          <th className="p-2.5">Amount Due</th>
                          <th className="p-2.5 text-center">Payment Status</th>
                          <th className="p-2.5 text-right">PDF Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {customerInvoices.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900">{inv.invoice_id || inv.invoice_number}</td>
                            <td className="p-2.5 font-mono text-slate-600">{inv.quote_number || inv.quotation_id}</td>
                            <td className="p-2.5 font-mono text-slate-600">{inv.issued_at}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">${Number(inv.amount_due || 0).toLocaleString()}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.status === 'PAID' || inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => exportInvoicePDF({
                                  invoice_number: inv.invoice_id || inv.invoice_number,
                                  quote_number: inv.quote_number || inv.quotation_id,
                                  customer_name: viewingCustomer?.company_name,
                                  amount_due: inv.amount_due,
                                  status: inv.status,
                                })}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                                title="Download PDF Invoice"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
