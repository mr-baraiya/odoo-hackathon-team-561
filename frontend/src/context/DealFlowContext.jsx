import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../services/apiClient";

const LEGACY_API_BASE = "/dealflow";

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
        apiClient.get("/products"),
        apiClient.get("/categories"),
        apiClient.get("/customer-tiers"),
        apiClient.get("/customers"),
        apiClient.get("/warehouses"),
        apiClient.get("/subscription-plans"),
        apiClient.get("/quotations"),
        apiClient.get("/deal-health/alerts"),
      ]);

      setProducts(prodRes || []);
      setCategories(catRes || []);
      setCustomerTiers(tierRes || []);
      setCustomers(custRes || []);
      setWarehouses(whRes.warehouses || whRes || []);
      setStock(whRes.stock || []);
      setSubscriptionPlans(planRes || []);
      setQuotations(quoteRes || []);
      setDealHealth({ alerts: healthRes || [], stalledDeals: [] });
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
    const res = await apiClient.post(`${LEGACY_API_BASE}/quotations/calculate-risk`, {
      customerTierCode,
      lineItems,
      orderDiscountPct,
    });
    return res.data;
  };

  const createQuotation = async (payload) => {
    const res = await apiClient.post("/quotations", payload);
    await refreshAllData();
    return res.data;
  };

  const approveQuotation = async (quoteId, action, reason) => {
    const res = await apiClient.post(`${LEGACY_API_BASE}/quotations/${quoteId}/approve`, {
      userId: currentUser.id,
      userRole: currentUser.role,
      action,
      reason,
    });
    await refreshAllData();
    return res.data;
  };

  const getFulfillmentSplit = async (quoteId, overrideSplits = null) => {
    const res = await apiClient.post(
      `${LEGACY_API_BASE}/quotations/${quoteId}/fulfillment-split`,
      { overrideSplits },
    );
    return res.data;
  };

  const fetchUpsellSuggestions = async (quoteId, cartLines = []) => {
    const res = await apiClient.post(
      `${LEGACY_API_BASE}/quotations/${quoteId}/upsell-suggestions`,
      { cartLines },
    );
    return res.data;
  };

  const getBillingSchedule = async (quoteId) => {
    const res = await apiClient.get(`${LEGACY_API_BASE}/quotations/${quoteId}/billing`);
    return res.data;
  };

  const prorateChange = async (quoteId, params) => {
    const res = await apiClient.post(
      `${LEGACY_API_BASE}/quotations/${quoteId}/prorate-change`,
      params,
    );
    return res.data;
  };

  const cancelSubscriptionLine = async (quoteId, params) => {
    const res = await apiClient.post(
      `${LEGACY_API_BASE}/quotations/${quoteId}/cancel-subscription`,
      params,
    );
    await refreshAllData();
    return res.data;
  };

  const getPortalQuote = async (tokenOrId) => {
    const res = await apiClient.get(`${LEGACY_API_BASE}/portal/quote/${tokenOrId}`);
    return res.data;
  };

  const submitNegotiation = async (payload) => {
    const res = await apiClient.post(`${LEGACY_API_BASE}/portal/negotiate`, payload);
    await refreshAllData();
    return res.data;
  };

  const confirmPortalQuotation = async (quotationId) => {
    const res = await apiClient.post(`${LEGACY_API_BASE}/portal/confirm`, {
      quotationId,
      customerUserId: currentUser.id,
    });
    await refreshAllData();
    return res.data;
  };

  const sendNudge = async (alertId, quotationId, note) => {
    const res = await apiClient.post(`${LEGACY_API_BASE}/analytics/nudge`, {
      alertId,
      quotationId,
      note,
    });
    await refreshAllData();
    return res.data;
  };

  const getReports = async (filters = {}) => {
    const res = await apiClient.get(`${LEGACY_API_BASE}/reports`, { params: filters });
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
