const express = require('express');
const dealflowRoutes = require('./dealflow.route');

const authRoutes = require('./auth.route');
const usersRoutes = require('./users.route');
const customersRoutes = require('./customers.route');
const tiersRoutes = require('./tiers.route');
const catalogRoutes = require('./catalog.route');
const priceListsRoutes = require('./priceLists.route');
const discountRulesRoutes = require('./discountRules.route');
const quotationsRoutes = require('./quotations.route');
const approvalsRoutes = require('./approvals.route');
const negotiationsRoutes = require('./negotiations.route');
const upsellRoutes = require('./upsell.route');
const warehousesRoutes = require('./warehouses.route');
const inventoryRoutes = require('./inventory.route');
const ordersRoutes = require('./orders.route');
const fulfillmentRoutes = require('./fulfillment.route');
const subscriptionsRoutes = require('./subscriptions.route');
const billingRoutes = require('./billing.route');
const paymentsRoutes = require('./payments.route');
const dealHealthRoutes = require('./dealHealth.route');
const dashboardRoutes = require('./dashboard.route');
const reportsRoutes = require('./reports.route');
const whatsappRoutes = require('./whatsapp.route');
const emailRoutes = require('./email.route');
const notificationsRoutes = require('./notifications.route');
const auditRoutes = require('./audit.route');
const settingsRoutes = require('./settings.route');
const customerPortalRoutes = require('./customerPortal.route');
const salesRepRoutes = require('./salesRep.route');
const salesManagerRoutes = require('./salesManager.route');
const financeOpsRoutes = require('./financeOps.route');
const healthRoutes = require('./health.route');

const router = express.Router();

// Modular API Routes with distinct prefix namespaces
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/customers', customersRoutes);
router.use('/customer-tiers', tiersRoutes);
router.use('/tiers', tiersRoutes);
router.use('/discount', discountRulesRoutes);
router.use('/discount-rules', discountRulesRoutes);
router.use('/quotations', quotationsRoutes);
router.use('/approvals', approvalsRoutes);
router.use('/negotiations', negotiationsRoutes);
router.use('/warehouses', warehousesRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', ordersRoutes);
router.use('/fulfillment', fulfillmentRoutes);
router.use('/payments', paymentsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/email', emailRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingsRoutes);
router.use('/customer-portal', customerPortalRoutes);
router.use('/customer', customerPortalRoutes);
router.use('/portal', customerPortalRoutes);
router.use('/dealflow/customer-portal', customerPortalRoutes);
router.use('/dealflow/portal', customerPortalRoutes);

// Dedicated Sales Representative, Sales Manager, & Finance Ops Routes
router.use('/sales-rep', salesRepRoutes);
router.use('/dealflow/sales-rep', salesRepRoutes);
router.use('/sales-manager', salesManagerRoutes);
router.use('/dealflow/sales-manager', salesManagerRoutes);
router.use('/finance-ops', financeOpsRoutes);
router.use('/finance_ops', financeOpsRoutes);
router.use('/dealflow/finance-ops', financeOpsRoutes);
router.use('/dealflow/finance_ops', financeOpsRoutes);

// Root-level path handlers (catalog, price-lists, upsell, subscriptions, billing, deal-health)
router.use('/catalog', catalogRoutes);
router.use('/', catalogRoutes);
router.use('/', priceListsRoutes);
router.use('/', upsellRoutes);
router.use('/', subscriptionsRoutes);
router.use('/', billingRoutes);
router.use('/', dealHealthRoutes);

// Legacy routes fallback
router.use('/dealflow', dealflowRoutes);
router.use('/', dealflowRoutes);

module.exports = router;
