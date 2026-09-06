import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  ArrowRight,
  X,
  AlertTriangle,
  UserPlus,
  Building,
  Clock,
} from 'lucide-react';

export default function SalesRepQuotationsTab({ quotations = [], customers: customersProp = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Negotiation response modal state
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseAction, setResponseAction] = useState('accept'); // accept, counter, reject
  const [revisedDiscount, setRevisedDiscount] = useState('10');
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Quotation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState(customersProp);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderDiscountPct, setOrderDiscountPct] = useState(0);

  const [lineItems, setLineItems] = useState([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  // Quick Customer Creation Modal State
  const [showQuickCustModal, setShowQuickCustModal] = useState(false);
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustContactName, setNewCustContactName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustTier, setNewCustTier] = useState('gold');
  const [isCreatingCust, setIsCreatingCust] = useState(false);

  const loadCreateDependencies = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        apiClient.get('/sales-rep/customers').catch(() => []),
        apiClient.get('/catalog/products').catch(() => []),
      ]);
      const fetchedCust = Array.isArray(custRes) ? custRes : (custRes?.data || []);
      const fetchedProd = Array.isArray(prodRes) ? prodRes : (prodRes?.data || []);

      const combinedCust = fetchedCust.length > 0 ? fetchedCust : (customersProp.length > 0 ? customersProp : []);
      setCustomers(combinedCust);
      setProducts(fetchedProd);

      if (combinedCust.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(combinedCust[0].id);
      }
    } catch (err) {
      console.warn('Failed to load dependencies for quote builder:', err);
    }
  };

  useEffect(() => {
    loadCreateDependencies();
  }, []);

  useEffect(() => {
    if (customersProp && customersProp.length > 0 && customers.length === 0) {
      setCustomers(customersProp);
      if (!selectedCustomerId) {
        setSelectedCustomerId(customersProp[0].id);
      }
    }
  }, [customersProp]);

  const selectedCustomerObj = customers.find((c) => String(c.id) === String(selectedCustomerId));
  const customerDiscountCeiling = selectedCustomerObj?.discount_ceiling_pct || 15;

  const handleAddLineItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setLineItems((prev) => [
      ...prev,
      {
        productId: p.id,
        name: p.name,
        unitPrice: Number(p.base_price || 100),
        quantity: 1,
        discountPct: 0,
        is_recurring: p.category_type === 'subscription',
      },
    ]);
  };

  const handleUpdateLine = (index, field, value) => {
    const updated = [...lineItems];
    if (field === 'productId') {
      const p = products.find((prod) => String(prod.id) === String(value));
      if (p) {
        updated[index].productId = p.id;
        updated[index].name = p.name;
        updated[index].unitPrice = Number(p.base_price || 100);
        updated[index].is_recurring = p.category_type === 'subscription';
      }
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
  };

  const handleRemoveLine = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculations
  const rawSubtotal = lineItems.reduce((acc, l) => acc + (Number(l.unitPrice) || 0) * (Number(l.quantity) || 1), 0);
  const lineDiscounts = lineItems.reduce((acc, l) => {
    const lineVal = (Number(l.unitPrice) || 0) * (Number(l.quantity) || 1);
    return acc + (lineVal * (Number(l.discountPct) || 0)) / 100;
  }, 0);
  const subtotalAfterLineDisc = rawSubtotal - lineDiscounts;
  const orderDiscountAmount = (subtotalAfterLineDisc * (Number(orderDiscountPct) || 0)) / 100;
  const netBeforeTax = subtotalAfterLineDisc - orderDiscountAmount;
  const taxAmount = netBeforeTax * 0.18; // 18% tax standard
  const finalTotalAmount = netBeforeTax + taxAmount;

  const maxDiscountApplied = Math.max(
    Number(orderDiscountPct || 0),
    ...lineItems.map((l) => Number(l.discountPct || 0))
  );

  const getDiscountGovernanceInfo = (discountPct) => {
    const pct = Math.round(Number(discountPct || 0) * 100) / 100;
    if (pct > 50.0) {
      return { isBlocked: true, badge: '❌ Exceeds 50% Max Limit (Prohibited)', level: 'blocked', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    if (pct <= 5.0) {
      return { isBlocked: false, badge: '✓ No Additional Approval Required (0-5% Direct Send)', level: 'none', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (pct > 5.0 && pct <= 25.0) {
      return { isBlocked: false, badge: 'Requires Sales Manager Approval (>5-25%)', level: 'sales_manager', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (pct > 25.0 && pct <= 50.0) {
      return { isBlocked: false, badge: 'Requires Sales Manager + Finance Dual Approval (>25-50%)', level: 'sales_manager_finance', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
    return { isBlocked: false, badge: '✓ Direct Send', level: 'none', color: 'bg-emerald-50 text-emerald-800' };
  };

  const governanceInfo = getDiscountGovernanceInfo(maxDiscountApplied);
  const exceedsCeiling = maxDiscountApplied > 5.0;

  const handleCreateNewCustomerAccount = async (e) => {
    e.preventDefault();
    if (!newCustCompany.trim()) {
      toast.error('Company Name is required');
      return;
    }

    setIsCreatingCust(true);
    try {
      const payload = {
        company_name: newCustCompany,
        primary_contact_name: newCustContactName || 'Primary Contact',
        primary_contact_email: newCustEmail || 'contact@client.com',
        primary_contact_phone: newCustPhone || '+919876543210',
        tier_code: newCustTier,
      };

      const res = await apiClient.post('/customers', payload);
      const created = res?.data || res;

      toast.success(`Customer "${created.company_name || newCustCompany}" created in DB!`);
      setCustomers((prev) => [created, ...prev]);
      setSelectedCustomerId(created.id);

      setShowQuickCustModal(false);
      setNewCustCompany('');
      setNewCustContactName('');
      setNewCustEmail('');
      setNewCustPhone('');

      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Failed to create customer account:', err);
      toast.error('Failed to create customer account.');
    } finally {
      setIsCreatingCust(false);
    }
  };

  const handleSaveQuotation = async (statusTarget = 'draft') => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer account.');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item product.');
      return;
    }

    setIsCreatingQuote(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        orderDiscountPct: Number(orderDiscountPct || 0),
        status: exceedsCeiling && statusTarget === 'sent_to_customer' ? 'pending_approval' : statusTarget,
        lineItems: lineItems.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          discountPct: Number(l.discountPct),
          lineTotal: Number(l.unitPrice) * Number(l.quantity) * (1 - Number(l.discountPct) / 100),
          is_recurring: Boolean(l.is_recurring),
        })),
      };

      await apiClient.post('/quotations', payload);
      toast.success(
        exceedsCeiling && statusTarget === 'sent_to_customer'
          ? 'Quotation submitted for Sales Manager discount approval!'
          : 'Quotation created successfully!'
      );
      setShowCreateModal(false);
      setLineItems([]);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Failed to create quotation:', err);
      toast.error('Failed to create quotation.');
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const getQuotePriority = (q) => {
    const status = (q.status || '').toLowerCase();
    if (q.has_open_negotiation || status === 'under_negotiation' || status === 'customer_counter_offer') return 1;
    if (status === 'pending_approval') return 2;
    if (status === 'draft') return 3;
    if (status === 'sent_to_customer') return 4;
    return 5;
  };

  const filteredQuotes = quotations
    .filter(
      (q) =>
        q.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => getQuotePriority(a) - getQuotePriority(b) || new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const handleQuickAccept = async (q) => {
    try {
      toast.loading(`Accepting quotation #${q.quote_number}...`, { id: 'accepting' });
      if (q.has_open_negotiation || q.status === 'under_negotiation') {
        await apiClient.post(`/sales-rep/quotations/${q.id}/respond-negotiation`, {
          action: 'accept',
          revisedDiscountPct: q.order_level_discount_pct || 0,
          message: 'Counter-offer accepted directly by representative.',
        });
      } else {
        await apiClient.post(`/customer-portal/quotations/${q.id}/confirm`);
      }
      toast.dismiss('accepting');
      toast.success(`Quotation #${q.quote_number} accepted and confirmed!`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Accept quote error:', err);
      toast.dismiss('accepting');
      toast.error(err?.response?.data?.message || 'Failed to accept quotation.');
    }
  };

  const getStatusBadge = (status, hasOpenNeg) => {
    if (hasOpenNeg) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
          <MessageSquare className="w-3 h-3 text-amber-700" />
          <span>Customer Counter-Offer</span>
        </span>
      );
    }

    const s = (status || '').toLowerCase();
    switch (s) {
      case 'under_negotiation':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100/90 text-indigo-900 border border-indigo-300 shadow-2xs">
            <Clock className="w-3 h-3 text-indigo-700" />
            <span>UNDER NEGOTIATION</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-100/90 text-purple-900 border border-purple-300 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-purple-700" />
            <span>PENDING APPROVAL</span>
          </span>
        );
      case 'sent_to_customer':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-sky-100/90 text-sky-900 border border-sky-300 shadow-2xs">
            <Send className="w-3 h-3 text-sky-700" />
            <span>SENT TO CUSTOMER</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
            <FileText className="w-3 h-3 text-slate-600" />
            <span>DRAFT</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-teal-100/90 text-teal-900 border border-teal-300 shadow-2xs">
            <CheckCircle className="w-3 h-3 text-teal-700" />
            <span>APPROVED</span>
          </span>
        );
      case 'confirmed':
      case 'fulfilled':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle className="w-3 h-3 text-emerald-700" />
            <span>{s.toUpperCase()}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-100/90 text-rose-900 border border-rose-300 shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 uppercase shadow-2xs">
            <span>{status?.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  const handleSendQuotation = async (quoteId) => {
    try {
      const res = await apiClient.post(`/sales-rep/quotations/${quoteId}/send`);
      toast.success(res?.message || res?.data?.message || 'Quotation sent to customer!');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Send quotation error:', err);
      toast.error(err?.response?.data?.message || 'Cannot send quotation awaiting approval.');
    }
  };

  const handleRespondToNegotiation = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;

    const discountVal = Number(revisedDiscount || 0);
    const gov = getDiscountGovernanceInfo(discountVal);
    if (responseAction !== 'reject' && gov.isBlocked) {
      toast.error('Discounts exceeding 50% are strictly prohibited by company policy.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post(`/sales-rep/quotations/${selectedQuote.id}/respond-negotiation`, {
        action: responseAction,
        revisedDiscountPct: discountVal,
        message: responseNote,
      });

      let successMsg = res?.message || res?.data?.message || 'Negotiation response sent successfully!';
      if (responseAction !== 'reject') {
        if (discountVal > 25) {
          successMsg = `Quotation submitted! ${discountVal}% discount requires Sales Manager + Finance Operations dual sign-off.`;
        } else if (discountVal > 5) {
          successMsg = `Quotation submitted! ${discountVal}% discount requires Sales Manager sign-off.`;
        } else {
          successMsg = `Quotation approved with ${discountVal}% discount and sent to customer!`;
        }
      }
      toast.success(successMsg);
      setSelectedQuote(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error responding to negotiation:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotations by quote # or customer company name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            if (lineItems.length === 0) handleAddLineItem();
          }}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Quotation Ref</th>
                <th className="px-6 py-3.5">Customer Account</th>
                <th className="px-6 py-3.5">Total Value</th>
                <th className="px-6 py-3.5">Discount %</th>
                <th className="px-6 py-3.5">Status / State</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No quotations found. Click "Create New Quotation" to build one!
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const hasOpenNeg = q.has_open_negotiation;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-700" />
                        <span>{q.quote_number}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{q.company_name}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${(q.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{q.order_level_discount_pct || 0}%</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(q.status, hasOpenNeg)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {q.status !== 'confirmed' && q.status !== 'fulfilled' && q.status !== 'rejected' && (
                          <button
                            onClick={() => handleQuickAccept(q)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1 text-[11px] cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                        )}
                        {hasOpenNeg ? (
                          <button
                            onClick={() => setSelectedQuote(q)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1 text-[11px] cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Respond to Counter-Offer</span>
                          </button>
                        ) : (
                          <>
                            {q.status === 'draft' || q.status === 'approved' ? (
                              <button
                                onClick={() => handleSendQuotation(q.id)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1 text-[11px] cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send to Customer</span>
                              </button>
                            ) : null}
                            <button
                              onClick={() => setSelectedQuote(q)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1 text-[11px] cursor-pointer"
                            >
                              <span>Manage Quote</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Quotation</h3>
                  <p className="text-xs text-slate-500">Configure customer account, product line items, tax & discount limits</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Customer Selector & Tier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Select Customer Account</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCustModal(true)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3 text-slate-600" />
                      <span>+ Create Account</span>
                    </button>
                  </div>
                  {customers.length === 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-semibold py-2">No customer accounts found.</span>
                      <button
                        type="button"
                        onClick={() => setShowQuickCustModal(true)}
                        className="px-2.5 py-1 bg-slate-800 text-white font-bold rounded-lg text-xs"
                      >
                        Create First Customer
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium focus:border-slate-500 focus:outline-none text-xs cursor-pointer shadow-xs"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id} className="text-slate-900 bg-white py-1">
                          {c.company_name} ({c.tier_label || 'Gold'} Tier - Max {c.discount_ceiling_pct || 15}% Discount)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Order-Level Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={orderDiscountPct}
                    onChange={(e) => setOrderDiscountPct(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium focus:border-slate-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Customer Tier Allowed Ceiling: <strong className="text-slate-900">{customerDiscountCeiling}%</strong>
                  </p>
                </div>
              </div>

              {/* Discount Ceiling Alert Warning */}
              {exceedsCeiling && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Manager Discount Approval Required:</span>
                    <p className="text-[11px] mt-0.5">
                      Applied discount ({maxDiscountApplied}%) exceeds customer tier ceiling ({customerDiscountCeiling}%). Sending will trigger a Manager Approval Request (`quotation_approvals`).
                    </p>
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Product Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center space-x-1 cursor-pointer border border-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 w-24">Unit Price ($)</th>
                        <th className="p-3 w-20">Qty</th>
                        <th className="p-3 w-24">Disc %</th>
                        <th className="p-3 w-28 text-right">Line Total</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {lineItems.map((line, idx) => {
                        const lineVal = (Number(line.unitPrice) || 0) * (Number(line.quantity) || 1);
                        const lineTotal = lineVal * (1 - (Number(line.discountPct) || 0) / 100);

                        return (
                          <tr key={idx}>
                            <td className="p-2">
                              <select
                                value={line.productId}
                                onChange={(e) => handleUpdateLine(idx, 'productId', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-none focus:border-slate-500"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                                    {p.name} (${p.base_price})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={line.unitPrice}
                                onChange={(e) => handleUpdateLine(idx, 'unitPrice', e.target.value)}
                                className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) => handleUpdateLine(idx, 'quantity', e.target.value)}
                                className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={line.discountPct}
                                onChange={(e) => handleUpdateLine(idx, 'discountPct', e.target.value)}
                                className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              ${lineTotal.toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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

              {/* Price Calculations Breakdown - Light Simple Cards */}
              <div className="bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl space-y-2 text-xs font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Before Discount):</span>
                  <span className="font-bold text-slate-900">${rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Total Discount Savings:</span>
                  <span className="font-bold">-${(lineDiscounts + orderDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax (18%):</span>
                  <span className="font-bold text-slate-900">+${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-emerald-700">
                  <span>Final Total Amount:</span>
                  <span>${finalTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('draft')}
                  disabled={isCreatingQuote}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('sent_to_customer')}
                  disabled={isCreatingQuote}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>{exceedsCeiling ? 'Submit for Approval' : 'Send Quotation'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Customer Creation Modal */}
      {showQuickCustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Customer Account</h3>
                  <p className="text-[11px] text-slate-500">Save directly to PostgreSQL database</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickCustModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCustomerAccount} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  placeholder="e.g. Nexus Apex Logistics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  value={newCustContactName}
                  onChange={(e) => setNewCustContactName(e.target.value)}
                  placeholder="e.g. Ramesh Shah"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="contact@nexus.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Tier</label>
                <select
                  value={newCustTier}
                  onChange={(e) => setNewCustTier(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-medium focus:border-slate-500 focus:outline-none"
                >
                  <option value="silver" className="bg-white text-slate-900">Silver Tier (10% max disc)</option>
                  <option value="gold" className="bg-white text-slate-900">Gold Tier (15% max disc)</option>
                  <option value="platinum" className="bg-white text-slate-900">Platinum Tier (25% max disc)</option>
                  <option value="enterprise" className="bg-white text-slate-900">Enterprise Tier (35% max disc)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCust}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isCreatingCust ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter-offer Response Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Manage Proposal & Respond</h3>
                <p className="text-[11px] text-slate-500">Quotation #{selectedQuote.quote_number}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Customer Account:</span>
                <span className="font-bold text-slate-900">{selectedQuote.company_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quote Total Amount:</span>
                <span className="font-bold text-slate-900">${(selectedQuote.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRespondToNegotiation} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Representative Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResponseAction('accept')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      responseAction === 'accept'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Accept Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponseAction('counter')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      responseAction === 'counter'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Counter-Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponseAction('reject')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      responseAction === 'reject'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Decline
                  </button>
                </div>
              </div>

              {responseAction !== 'reject' && (() => {
                const gov = getDiscountGovernanceInfo(revisedDiscount);
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 block">Approved Discount %</label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">Policy Ceiling: 50.00%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={revisedDiscount}
                      onChange={(e) => setRevisedDiscount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                      placeholder="e.g. 10"
                    />
                    {/* Dynamic Governance Callout Badge */}
                    <div className={`p-3 rounded-xl border text-[11px] font-bold leading-snug flex items-start space-x-2 ${gov.color}`}>
                      <span className="shrink-0">{gov.badge}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Note for Customer</label>
                <textarea
                  rows={3}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Type message explaining response..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {(() => {
                const gov = getDiscountGovernanceInfo(revisedDiscount);
                const isBlocked = responseAction !== 'reject' && gov.isBlocked;
                let btnLabel = 'Send Response';
                if (responseAction === 'reject') {
                  btnLabel = 'Decline Offer';
                } else if (gov.level === 'sales_manager') {
                  btnLabel = 'Submit for Sales Manager Approval';
                } else if (gov.level === 'sales_manager_finance') {
                  btnLabel = 'Submit for Manager & Finance Approval';
                } else {
                  btnLabel = 'Accept & Send to Customer';
                }

                return (
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuote(null)}
                      className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isBlocked}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                        isBlocked
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : responseAction === 'reject'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : gov.level === 'sales_manager' || gov.level === 'sales_manager_finance'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span>{isSubmitting ? 'Submitting...' : btnLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


