import React, { createContext, useContext, useState } from 'react';
import { 
  mockQuotations as initialQuotes, 
  mockApprovals as initialApprovals, 
  mockOrders as initialOrders, 
  mockSubscriptions as initialSubs, 
  mockInvoices as initialInvoices, 
  mockProducts as initialProducts,
  mockDealHealth as initialDealHealth,
  mockActivities as initialActivities
} from '../data/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [quotations, setQuotations] = useState(initialQuotes);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [orders, setOrders] = useState(initialOrders);
  const [subscriptions, setSubscriptions] = useState(initialSubs);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [products, setProducts] = useState(initialProducts);
  const [dealHealth, setDealHealth] = useState(initialDealHealth);
  const [activities, setActivities] = useState(initialActivities);

  const addActivity = (text, type = 'general') => {
    const newAct = {
      id: `ACT-${Date.now()}`,
      text,
      time: 'Just now',
      type
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const addQuotation = (newQuoteData) => {
    const id = `Q-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote = {
      id,
      customer: newQuoteData.customer || 'ABC Company',
      customerId: 'CUST-001',
      customerEmail: 'customer@abc.com',
      customerPhone: '+919876543210',
      customerTier: 'Gold Tier',
      amount: newQuoteData.amount || 10000,
      discountAmount: newQuoteData.discountAmount || 0,
      overallDiscountPercent: newQuoteData.overallDiscountPercent || 0,
      total: newQuoteData.total || 10000,
      status: newQuoteData.status || 'draft',
      date: new Date().toISOString().split('T')[0],
      salesRep: 'Rahul Sharma',
      margin: newQuoteData.margin || 25,
      riskScore: newQuoteData.riskScore || 'low',
      items: newQuoteData.items || [],
      riskReason: newQuoteData.riskReason || 'Standard compliance',
      approvalChain: [
        { step: 1, role: 'Sales Manager', name: 'Priya Patel', status: 'pending', date: null }
      ],
      auditTrail: [
        { date: new Date().toLocaleString(), user: 'Rahul Sharma', action: `Created quotation ${id}` }
      ]
    };

    setQuotations(prev => [newQuote, ...prev]);

    if (newQuote.status === 'pending_approval') {
      const newApproval = {
        id: `APP-${id.split('-')[1]}`,
        quoteId: id,
        customer: newQuote.customer,
        customerId: newQuote.customerId,
        customerEmail: newQuote.customerEmail,
        customerPhone: newQuote.customerPhone,
        blendedRisk: newQuote.riskScore,
        stage: 'Manager Review',
        assignedTo: 'Priya Patel',
        date: new Date().toLocaleDateString(),
        status: 'pending',
        violations: newQuote.overallDiscountPercent > 10 ? [
          { line: 'General Discount', discount: newQuote.overallDiscountPercent, limit: 10, valid: false, overLimit: newQuote.overallDiscountPercent - 10 }
        ] : [],
        worstLine: newQuote.overallDiscountPercent > 10 ? `Discount ${newQuote.overallDiscountPercent}% exceeds policy threshold` : 'Compliant',
        overallPattern: 'Newly submitted for approval',
        approvalSteps: newQuote.approvalChain,
        auditTrail: [
          { time: 'Just now', user: 'Rahul Sharma', text: `Submitted quote ${id} for approval` }
        ]
      };
      setApprovals(prev => [newApproval, ...prev]);
    }

    addActivity(`New quotation ${id} created for ${newQuote.customer}`, 'approval');
    return newQuote;
  };

  const updateQuotationStatus = (quoteId, status) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
  };

  const approveQuotationAction = (appId) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === appId || app.quoteId === appId) {
        updateQuotationStatus(app.quoteId, 'approved');
        return { ...app, status: 'approved', stage: 'Approved' };
      }
      return app;
    }));
    addActivity(`Approval ${appId} was approved`, 'approval');
  };

  const rejectQuotationAction = (appId, reason) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === appId || app.quoteId === appId) {
        updateQuotationStatus(app.quoteId, 'rejected');
        return { ...app, status: 'rejected', stage: 'Rejected' };
      }
      return app;
    }));
    addActivity(`Approval ${appId} was rejected (${reason})`, 'approval');
  };

  const returnQuotationAction = (appId, notes) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === appId || app.quoteId === appId) {
        updateQuotationStatus(app.quoteId, 'returned');
        return { ...app, status: 'returned', stage: 'Returned for Revision' };
      }
      return app;
    }));
    addActivity(`Approval ${appId} returned for revision: "${notes}"`, 'approval');
  };

  const acceptOrderSplitAction = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Ready' } : o));
    addActivity(`Warehouse split accepted for Order ${orderId}`, 'fulfillment');
  };

  const addProductAction = (product) => {
    const id = `PROD-${Math.floor(100 + Math.random() * 900)}`;
    const newP = { id, ...product };
    setProducts(prev => [newP, ...prev]);
    addActivity(`New product ${newP.name} added to catalog`, 'general');
  };

  const updateProductAction = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProductAction = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const recordInvoicePaymentAction = (invId) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: 'Paid' } : inv));
    addActivity(`Payment recorded for Invoice ${invId}`, 'invoice');
  };

  const submitCounterOffer = (quoteId, counterDiscount, message) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        const newTotal = Math.round(q.amount * (1 - counterDiscount / 100));
        return {
          ...q,
          status: 'negotiation',
          overallDiscountPercent: counterDiscount,
          total: newTotal,
          auditTrail: [
            ...(q.auditTrail || []),
            { date: new Date().toLocaleString(), user: q.customer, action: `Submitted counter discount request ${counterDiscount}%: "${message}"` }
          ]
        };
      }
      return q;
    }));
    addActivity(`Customer submitted counter-offer on quote ${quoteId} (${counterDiscount}%)`, 'customer');
  };

  return (
    <DataContext.Provider value={{
      quotations,
      approvals,
      orders,
      subscriptions,
      invoices,
      products,
      dealHealth,
      activities,
      addQuotation,
      updateQuotationStatus,
      approveQuotationAction,
      rejectQuotationAction,
      returnQuotationAction,
      acceptOrderSplitAction,
      addProductAction,
      updateProductAction,
      deleteProductAction,
      recordInvoicePaymentAction,
      submitCounterOffer
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
