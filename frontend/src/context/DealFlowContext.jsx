import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const API_BASE = '/dealflow';

const DealFlowContext = createContext(null);

export function DealFlowProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    id: 'user_rep_1',
    full_name: 'Alex Rep (Sales Rep)',
    email: 'rep@dealflow360.com',
    role: 'sales_rep',
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerTiers, setCustomerTiers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [dealHealth, setDealHealth] = useState({ alerts: [], stalledDeals: [] });
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, tierRes, custRes, whRes, planRes, quoteRes, healthRes] = await Promise.all([
        apiClient.get(`${API_BASE}/products`).catch(() => []),
        apiClient.get(`${API_BASE}/categories`).catch(() => []),
        apiClient.get(`${API_BASE}/customer-tiers`).catch(() => []),
        apiClient.get(`${API_BASE}/customers`).catch(() => []),
        apiClient.get(`${API_BASE}/warehouses`).catch(() => ({ warehouses: [], stock: [] })),
        apiClient.get(`${API_BASE}/subscription-plans`).catch(() => []),
        apiClient.get(`${API_BASE}/quotations`).catch(() => []),
        apiClient.get(`${API_BASE}/analytics/deal-health`).catch(() => ({ alerts: [], stalledDeals: [] })),
      ]);

      setProducts(prodRes || []);
      setCategories(catRes || []);
      setCustomerTiers(tierRes || []);
      setCustomers(custRes || []);
      setWarehouses(whRes?.warehouses || []);
      setStock(whRes?.stock || []);
      setSubscriptionPlans(planRes || []);
      setQuotations(quoteRes || []);
      setDealHealth(healthRes || { alerts: [], stalledDeals: [] });
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Switch role dynamically for demo testing
  const switchRole = (roleName) => {
    const roleUserMap = {
      sales_rep: { id: 'user_rep_1', full_name: 'Alex Rep (Sales Rep)', email: 'rep@dealflow360.com', role: 'sales_rep' },
      sales_manager: { id: 'user_mgr_1', full_name: 'Sarah Manager (Sales Manager)', email: 'manager@dealflow360.com', role: 'sales_manager' },
      finance_ops: { id: 'user_fin_1', full_name: 'Fred Finance (Finance / Ops)', email: 'finance@dealflow360.com', role: 'finance_ops' },
      admin: { id: 'user_admin_1', full_name: 'System Admin', email: 'admin@dealflow360.com', role: 'admin' },
      customer: { id: 'user_cust_1', full_name: 'Jane Doe (Acme Portal)', email: 'customer@acme.com', role: 'customer', customer_id: 'cust_acme' },
    };
    if (roleUserMap[roleName]) {
      setCurrentUser(roleUserMap[roleName]);
    }
  };

  // Logic Calls
  const calculateRisk = async (quoteData) => {
    const res = await apiClient.post(`${API_BASE}/quotations/calculate-risk`, quoteData);
    return res;
  };

  const createQuotation = async (quotePayload) => {
    const res = await apiClient.post(`${API_BASE}/quotations`, quotePayload);
    await refreshAllData();
    return res;
  };

  const approveQuotation = async (quoteId, managerId, notes) => {
    const res = await apiClient.post(`${API_BASE}/quotations/${quoteId}/approve`, {
      managerId,
      notes,
    });
    await refreshAllData();
    return res;
  };

  const getFulfillmentSplit = async (quoteId, overrideSplits = null) => {
    const res = await apiClient.post(`${API_BASE}/quotations/${quoteId}/fulfillment-split`, { overrideSplits });
    return res;
  };

  const fetchUpsellSuggestions = async (quoteId, cartLines = []) => {
    const res = await apiClient.post(`${API_BASE}/quotations/${quoteId}/upsell-suggestions`, { cartLines });
    return res;
  };

  const getBillingSchedule = async (quoteId) => {
    const res = await apiClient.get(`${API_BASE}/quotations/${quoteId}/billing`);
    return res;
  };

  const prorateChange = async (quoteId, params) => {
    const res = await apiClient.post(`${API_BASE}/quotations/${quoteId}/prorate-change`, params);
    await refreshAllData();
    return res;
  };

  const cancelSubscriptionLine = async (quoteId, params) => {
    const res = await apiClient.post(`${API_BASE}/quotations/${quoteId}/cancel-subscription`, params);
    await refreshAllData();
    return res;
  };

  const getPortalSummary = async () => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/summary`);
    return res;
  };

  const getPortalQuotations = async (status = 'all') => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/quotations`, { params: { status } });
    return res;
  };

  const getPortalQuote = async (tokenOrId) => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/quotations/${tokenOrId}`);
    return res;
  };

  const submitNegotiation = async (payload) => {
    const quoteId = payload.quotationId || payload.quoteId;
    const res = await apiClient.post(`${API_BASE}/customer-portal/quotations/${quoteId}/negotiate`, payload);
    await refreshAllData();
    return res;
  };

  const confirmPortalQuotation = async (quotationId) => {
    const res = await apiClient.post(`${API_BASE}/customer-portal/quotations/${quotationId}/confirm`);
    await refreshAllData();
    return res;
  };

  const rejectPortalQuotation = async (quotationId, reason = '') => {
    const res = await apiClient.post(`${API_BASE}/customer-portal/quotations/${quotationId}/reject`, { reason });
    await refreshAllData();
    return res;
  };

  const getPortalOrders = async () => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/orders`);
    return res;
  };

  const sendWhatsAppToRep = async (payload) => {
    const res = await apiClient.post(`${API_BASE}/customer-portal/send-whatsapp-to-rep`, payload);
    return res;
  };

  const getPortalInvoices = async () => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/invoices`);
    return res;
  };

  const payPortalInvoice = async (invoiceId, payload = {}) => {
    const res = await apiClient.post(`${API_BASE}/customer-portal/invoices/${invoiceId}/pay`, payload);
    await refreshAllData();
    return res;
  };

  const getPortalNotifications = async () => {
    const res = await apiClient.get(`${API_BASE}/customer-portal/notifications`);
    return res;
  };

  const createPortalQuotation = async (payload) => {
    const res = await apiClient.post(`${API_BASE}/customer-portal/quotations/create`, payload);
    await refreshAllData();
    return res;
  };

  const sendNudge = async (alertId, quotationId, note) => {
    const res = await apiClient.post(`${API_BASE}/analytics/nudge`, { alertId, quotationId, note });
    await refreshAllData();
    return res;
  };

  const getReports = async (filters = {}) => {
    const res = await apiClient.get(`${API_BASE}/reports`, { params: filters });
    return res;
  };

  return (
    <DealFlowContext.Provider
      value={{
        currentUser,
        switchRole,
        products,
        categories,
        customerTiers,
        customers,
        warehouses,
        stock,
        subscriptionPlans,
        quotations,
        dealHealth,
        loading,
        refreshAllData,
        calculateRisk,
        createQuotation,
        approveQuotation,
        getFulfillmentSplit,
        fetchUpsellSuggestions,
        getBillingSchedule,
        prorateChange,
        cancelSubscriptionLine,
        getPortalSummary,
        getPortalQuotations,
        getPortalQuote,
        submitNegotiation,
        confirmPortalQuotation,
        rejectPortalQuotation,
        getPortalOrders,
        getPortalInvoices,
        payPortalInvoice,
        getPortalNotifications,
        createPortalQuotation,
        sendWhatsAppToRep,
        sendNudge,
        getReports,
      }}
    >
      {children}
    </DealFlowContext.Provider>
  );
}

export function useDealFlow() {
  return useContext(DealFlowContext);
}
