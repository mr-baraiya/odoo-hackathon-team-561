import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuotationsList from './pages/QuotationsList';
import QuotationBuilder from './pages/QuotationBuilder';
import ApprovalsList from './pages/ApprovalsList';
import ApprovalDetail from './pages/ApprovalDetail';
import FulfillmentList from './pages/FulfillmentList';
import FulfillmentDetail from './pages/FulfillmentDetail';
import SubscriptionsList from './pages/SubscriptionsList';
import BillingDetail from './pages/BillingDetail';
import InvoicesList from './pages/InvoicesList';
import InvoiceDetail from './pages/InvoiceDetail';
import DealHealth from './pages/DealHealth';
import Reports from './pages/Reports';
import Products from './pages/Products';
import CustomerPortal from './pages/CustomerPortal';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/quotations" element={<ProtectedRoute><QuotationsList /></ProtectedRoute>} />
            <Route path="/quotations/new" element={<ProtectedRoute><QuotationBuilder /></ProtectedRoute>} />
            <Route path="/quotations/:id" element={<ProtectedRoute><QuotationBuilder /></ProtectedRoute>} />
            <Route path="/approvals" element={<ProtectedRoute><ApprovalsList /></ProtectedRoute>} />
            <Route path="/approvals/:id" element={<ProtectedRoute><ApprovalDetail /></ProtectedRoute>} />
            <Route path="/fulfillment" element={<ProtectedRoute><FulfillmentList /></ProtectedRoute>} />
            <Route path="/fulfillment/:id" element={<ProtectedRoute><FulfillmentDetail /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsList /></ProtectedRoute>} />
            <Route path="/subscriptions/:id" element={<ProtectedRoute><BillingDetail /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/deal-health" element={<ProtectedRoute><DealHealth /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/portal/:quoteId" element={<CustomerPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
