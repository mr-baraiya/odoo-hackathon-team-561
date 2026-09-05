import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { DealFlowProvider } from "./context/DealFlowContext";

import DealFlowHeader from "./components/layout/DealFlowHeader";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ContactSupportPage from "./pages/support/ContactSupportPage";

import PipelinePage from "./pages/sales/PipelinePage";
import QuotationBuilderPage from "./pages/sales/QuotationBuilderPage";
import DiscountApprovalPage from "./pages/sales/DiscountApprovalPage";
import FulfillmentSplitPage from "./pages/sales/FulfillmentSplitPage";
import SubscriptionBillingPage from "./pages/sales/SubscriptionBillingPage";
import CustomerPortalPage from "./pages/portal/CustomerPortalPage";
import DealHealthDashboard from "./pages/dashboard/DealHealthDashboard";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import NotFound from "./pages/notfound/NotFound";

function DealFlowLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white pt-16">
      <DealFlowHeader />
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Authentication Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/support" element={<ContactSupportPage />} />
      <Route path="/contact-support" element={<ContactSupportPage />} />

      {/* Role Specific Routes Pattern (e.g. /sales_rep/home, /sales_manager/home) */}
      
      {/* 1. Sales Representative Routes */}
      <Route
        path="/sales_rep/home"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/pipeline"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/builder"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <QuotationBuilderPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/approvals"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FulfillmentSplitPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/billing"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/deal-health"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "finance_ops", "admin"]}>
            <DealFlowLayout>
              <DealHealthDashboard />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_rep/config"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />

      {/* 2. Sales Manager Routes */}
      <Route
        path="/sales_manager/home"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/approvals"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/pipeline"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FulfillmentSplitPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/billing"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/deal-health"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <DealHealthDashboard />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales_manager/config"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />

      {/* 3. Finance Operations Routes */}
      <Route
        path="/finance_ops/home"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/pipeline"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/billing"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FulfillmentSplitPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/approvals"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/deal-health"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <DealHealthDashboard />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance_ops/config"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />

      {/* 4. System Administrator Routes */}
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pricing"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/upsell"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/config"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pipeline"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <FulfillmentSplitPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/deal-health"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <DealHealthDashboard />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />

      {/* 5. Customer Routes */}
      <Route
        path="/customer/home"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <CustomerPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/portal/quote/:id"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <CustomerPortalPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy / Alias DealFlow Platform Routes */}
      <Route
        path="/dealflow/pipeline"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/quotations"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <PipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/builder"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <QuotationBuilderPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/builder/:id"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <QuotationBuilderPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/approvals"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "finance_ops", "admin"]}>
            <DealFlowLayout>
              <DiscountApprovalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FulfillmentSplitPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/billing"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <SubscriptionBillingPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/deal-health"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "finance_ops", "admin"]}>
            <DealFlowLayout>
              <DealHealthDashboard />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealflow/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DealFlowLayout>
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />

      {/* Customer Portal Restricted Standalone Route */}
      <Route path="/dealflow/portal/quote/:id" element={<CustomerPortalPage />} />

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DealFlowProvider>
        <Router>
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          <AppRoutes />
        </Router>
      </DealFlowProvider>
    </AuthProvider>
  );
}
