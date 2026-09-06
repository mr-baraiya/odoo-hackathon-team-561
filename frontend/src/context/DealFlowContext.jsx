import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "/api/dealflow";

const DealFlowContext = createContext(null);

export function DealFlowProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    id: "user_rep_1",
    full_name: "Alex Rep (Sales Rep)",
    email: "rep@dealflow360.com",
    role: "sales_rep",
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerTiers, setCustomerTiers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [dealHealth, setDealHealth] = useState({
    alerts: [],
    stalledDeals: [],
  });
  const [loading, setLoading] = useState(false);

  const http = axios.create({ baseURL: API_BASE });
  http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token)
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    return config;
  });

  // Fetch initial data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [
        prodRes,
        catRes,
        tierRes,
        custRes,
        whRes,
        planRes,
        quoteRes,
        healthRes,
      ] = await Promise.all([
        http.get(`${API_BASE}/products`),
        http.get(`${API_BASE}/categories`),
        http.get(`${API_BASE}/customer-tiers`),
        http.get(`${API_BASE}/customers`),
        http.get(`${API_BASE}/warehouses`),
        http.get(`${API_BASE}/subscription-plans`),
        http.get(`${API_BASE}/quotations`),
        http.get(`${API_BASE}/analytics/deal-health`),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setCustomerTiers(tierRes.data || []);
      setCustomers(custRes.data || []);
      setWarehouses(whRes.data.warehouses || []);
      setStock(whRes.data.stock || []);
      setSubscriptionPlans(planRes.data || []);
      setQuotations(quoteRes.data || []);
      setDealHealth(healthRes.data || { alerts: [], stalledDeals: [] });
    } catch (err) {
      console.error("Failed to load DealFlow360 data", err);
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
      sales_rep: {
        id: "user_rep_1",
        full_name: "Alex Rep (Sales Rep)",
        email: "rep@dealflow360.com",
        role: "sales_rep",
      },
      sales_manager: {
        id: "user_mgr_1",
        full_name: "Sarah Manager (Sales Manager)",
        email: "manager@dealflow360.com",
        role: "sales_manager",
      },
      finance_ops: {
        id: "user_fin_1",
        full_name: "Fred Finance (Finance / Ops)",
        email: "finance@dealflow360.com",
        role: "finance_ops",
      },
      admin: {
        id: "user_admin_1",
        full_name: "System Admin",
        email: "admin@dealflow360.com",
        role: "admin",
      },
      customer: {
        id: "user_cust_1",
        full_name: "Jane Doe (Acme Portal)",
        email: "customer@acme.com",
        role: "customer",
        customer_id: "cust_acme",
      },
    };
    if (roleUserMap[roleName]) {
      setCurrentUser(roleUserMap[roleName]);
    }
  };

  // Logic Calls
  const calculateRisk = async (
    customerTierCode,
    lineItems,
    orderDiscountPct = 0,
  ) => {
    const res = await http.post(`${API_BASE}/quotations/calculate-risk`, {
      customerTierCode,
      lineItems,
      orderDiscountPct,
    });
    return res.data;
  };

  const createQuotation = async (payload) => {
    const res = await http.post(`${API_BASE}/quotations`, payload);
    await refreshAllData();
    return res.data;
  };

  const approveQuotation = async (quoteId, action, reason) => {
    const res = await axios.post(`${API_BASE}/quotations/${quoteId}/approve`, {
      userId: currentUser.id,
      userRole: currentUser.role,
      action,
      reason,
    });
    await refreshAllData();
    return res.data;
  };

  const getFulfillmentSplit = async (quoteId, overrideSplits = null) => {
    const res = await axios.post(
      `${API_BASE}/quotations/${quoteId}/fulfillment-split`,
      { overrideSplits },
    );
    return res.data;
  };

  const fetchUpsellSuggestions = async (quoteId, cartLines = []) => {
    const res = await axios.post(
      `${API_BASE}/quotations/${quoteId}/upsell-suggestions`,
      { cartLines },
    );
    return res.data;
  };

  const getBillingSchedule = async (quoteId) => {
    const res = await axios.get(`${API_BASE}/quotations/${quoteId}/billing`);
    return res.data;
  };

  const prorateChange = async (quoteId, params) => {
    const res = await axios.post(
      `${API_BASE}/quotations/${quoteId}/prorate-change`,
      params,
    );
    return res.data;
  };

  const cancelSubscriptionLine = async (quoteId, params) => {
    const res = await axios.post(
      `${API_BASE}/quotations/${quoteId}/cancel-subscription`,
      params,
    );
    await refreshAllData();
    return res.data;
  };

  const getPortalQuote = async (tokenOrId) => {
    const res = await axios.get(`${API_BASE}/portal/quote/${tokenOrId}`);
    return res.data;
  };

  const submitNegotiation = async (payload) => {
    const res = await axios.post(`${API_BASE}/portal/negotiate`, payload);
    await refreshAllData();
    return res.data;
  };

  const confirmPortalQuotation = async (quotationId) => {
    const res = await axios.post(`${API_BASE}/portal/confirm`, {
      quotationId,
      customerUserId: currentUser.id,
    });
    await refreshAllData();
    return res.data;
  };

  const sendNudge = async (alertId, quotationId, note) => {
    const res = await axios.post(`${API_BASE}/analytics/nudge`, {
      alertId,
      quotationId,
      note,
    });
    await refreshAllData();
    return res.data;
  };

  const getReports = async (filters = {}) => {
    const res = await axios.get(`${API_BASE}/reports`, { params: filters });
    return res.data;
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
        getPortalQuote,
        submitNegotiation,
        confirmPortalQuotation,
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
