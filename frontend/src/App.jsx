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
import MagicLinkVerifyPage from "./pages/auth/MagicLinkVerifyPage";
import ContactSupportPage from "./pages/support/ContactSupportPage";

import PipelinePage from "./pages/sales/PipelinePage";
import QuotationBuilderPage from "./pages/sales/QuotationBuilderPage";
import DiscountApprovalPage from "./pages/sales/DiscountApprovalPage";
import FulfillmentSplitPage from "./pages/sales/FulfillmentSplitPage";
import SubscriptionBillingPage from "./pages/sales/SubscriptionBillingPage";
import CustomerPortalPage from "./pages/customer/CustomerPortalPage";
import SalesRepPage from "./pages/salesRep/SalesRepPage";
import SalesRepOverviewPage from "./pages/salesRep/pages/SalesRepOverviewPage";
import SalesRepQuotationsPage from "./pages/salesRep/pages/SalesRepQuotationsPage";
import SalesRepCustomersPage from "./pages/salesRep/pages/SalesRepCustomersPage";
import SalesRepApprovalsPage from "./pages/salesRep/pages/SalesRepApprovalsPage";
import SalesManagerPage from "./pages/salesManager/SalesManagerPage";
import SalesManagerDashboardPage from "./pages/salesManager/pages/SalesManagerDashboardPage";
import SalesManagerApprovalsPage from "./pages/salesManager/pages/SalesManagerApprovalsPage";
import SalesManagerDiscountsPage from "./pages/salesManager/pages/SalesManagerDiscountsPage";
import SalesManagerNegotiationsPage from "./pages/salesManager/pages/SalesManagerNegotiationsPage";
import SalesManagerTeamPage from "./pages/salesManager/pages/SalesManagerTeamPage";
import SalesManagerCustomersPage from "./pages/salesManager/pages/SalesManagerCustomersPage";
import SalesManagerPipelinePage from "./pages/salesManager/pages/SalesManagerPipelinePage";
import SalesManagerFulfillmentPage from "./pages/salesManager/pages/SalesManagerFulfillmentPage";
import SalesManagerAnalyticsPage from "./pages/salesManager/pages/SalesManagerAnalyticsPage";
import SalesManagerNotificationsPage from "./pages/salesManager/pages/SalesManagerNotificationsPage";

import FinanceOpsDashboardPage from "./pages/financeOps/pages/FinanceOpsDashboardPage";
import FinanceOpsApprovalsPage from "./pages/financeOps/pages/FinanceOpsApprovalsPage";
import FinanceOpsInvoicesPage from "./pages/financeOps/pages/FinanceOpsInvoicesPage";
import FinanceOpsPaymentsPage from "./pages/financeOps/pages/FinanceOpsPaymentsPage";
import FinanceOpsFulfillmentPage from "./pages/financeOps/pages/FinanceOpsFulfillmentPage";
import FinanceOpsSubscriptionsPage from "./pages/financeOps/pages/FinanceOpsSubscriptionsPage";
import FinanceOpsCreditNotesPage from "./pages/financeOps/pages/FinanceOpsCreditNotesPage";
import FinanceOpsReportsPage from "./pages/financeOps/pages/FinanceOpsReportsPage";
import FinanceOpsNotificationsPage from "./pages/financeOps/pages/FinanceOpsNotificationsPage";

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
      <Route path="/auth/verify-magic-link" element={<MagicLinkVerifyPage />} />
      <Route path="/customer/portal/magic-login" element={<MagicLinkVerifyPage />} />
      <Route path="/m/:code" element={<MagicLinkVerifyPage />} />
      <Route path="/support" element={<ContactSupportPage />} />
      <Route path="/contact-support" element={<ContactSupportPage />} />

      {/* Dedicated Sales Representative Portal Module Routes */}
      <Route
        path="/sales-rep/overview"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/quotations"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/customers"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/approvals"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/dashboard"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/*"
        element={
          <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesRepPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/sales-rep" element={<Navigate to="/sales-rep/overview" replace />} />
      <Route path="/sales-portal" element={<Navigate to="/sales-rep/overview" replace />} />
      <Route path="/sales_rep/home" element={<Navigate to="/sales-rep/overview" replace />} />
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

      {/* 2. Sales Manager Portal Routes (Sidebar Navigation & Dedicated Sub-Routes) */}
      <Route
        path="/sales-manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerDashboardPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/approvals"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerApprovalsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/discounts"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerDiscountsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/negotiations"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerNegotiationsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/team"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerTeamPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/customers"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerCustomersPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/pipeline"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerPipelinePage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerFulfillmentPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/analytics"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerAnalyticsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-manager/notifications"
        element={
          <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
            <DealFlowLayout>
              <SalesManagerNotificationsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/sales-manager" element={<Navigate to="/sales-manager/dashboard" replace />} />
      <Route path="/sales_manager/home" element={<Navigate to="/sales-manager/dashboard" replace />} />
      <Route path="/sales_manager/approvals" element={<Navigate to="/sales-manager/approvals" replace />} />
      <Route path="/sales_manager/pipeline" element={<Navigate to="/sales-manager/pipeline" replace />} />
      <Route path="/sales_manager/*" element={<Navigate to="/sales-manager/dashboard" replace />} />

      {/* 3. Dedicated Finance Operations Portal Routes */}
      <Route
        path="/finance-ops/dashboard"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsDashboardPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/approvals"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsApprovalsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/invoices"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsInvoicesPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/payments"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsPaymentsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/fulfillment"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsFulfillmentPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/subscriptions"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsSubscriptionsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/credit-notes"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsCreditNotesPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/reports"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsReportsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-ops/notifications"
        element={
          <ProtectedRoute allowedRoles={["finance_ops", "admin"]}>
            <DealFlowLayout>
              <FinanceOpsNotificationsPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/finance-ops" element={<Navigate to="/finance-ops/dashboard" replace />} />
      <Route path="/finance_ops/dashboard" element={<Navigate to="/finance-ops/dashboard" replace />} />
      <Route path="/finance_ops/home" element={<Navigate to="/finance-ops/dashboard" replace />} />
      <Route path="/finance_ops/approvals" element={<Navigate to="/finance-ops/approvals" replace />} />
      <Route path="/finance_ops/billing" element={<Navigate to="/finance-ops/invoices" replace />} />
      <Route path="/finance_ops/fulfillment" element={<Navigate to="/finance-ops/fulfillment" replace />} />
      <Route path="/finance_ops/*" element={<Navigate to="/finance-ops/dashboard" replace />} />

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
              <AdminConfigPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approval-queue"
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
              <AdminConfigPage />
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
      <Route path="/portal" element={<Navigate to="/customer/portal" replace />} />
      <Route path="/portal/*" element={<Navigate to="/customer/portal" replace />} />
      <Route path="/customer" element={<Navigate to="/customer/portal" replace />} />
      <Route
        path="/customer/home"
        element={<Navigate to="/customer/portal" replace />}
      />
      <Route
        path="/customer/portal"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <DealFlowLayout>
              <CustomerPortalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/quotations"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <DealFlowLayout>
              <CustomerPortalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <DealFlowLayout>
              <CustomerPortalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/portal/quote/:id"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <DealFlowLayout>
              <CustomerPortalPage />
            </DealFlowLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <DealFlowLayout>
              <CustomerPortalPage />
            </DealFlowLayout>
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
