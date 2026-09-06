import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDealFlow } from '../../context/DealFlowContext';
import userService from '../../services/user.service';
import customerService from '../../services/customer.service';
import apiClient from '../../services/apiClient';

// Modular Component Imports
import AdminSidebar from './components/AdminSidebar';
import DashboardOverviewTab from './components/DashboardOverviewTab';
import UserManagementTab from './components/UserManagementTab';
import CustomersTab from './components/CustomersTab';
import ProductsTab from './components/ProductsTab';
import PricingTab from './components/PricingTab';
import ApprovalRulesTab from './components/ApprovalRulesTab';
import InventoryTab from './components/InventoryTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import UpsellTab from './components/UpsellTab';
import ReportsTab from './components/ReportsTab';
import DealHealthTab from './components/DealHealthTab';
import AuditLogsTab from './components/AuditLogsTab';
import SystemSettingsTab from './components/SystemSettingsTab';

const ROUTE_TAB_MAP = {
  '/admin/home': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/users': 'users',
  '/admin/customers': 'customers',
  '/admin/products': 'products',
  '/admin/pricing': 'pricing',
  '/admin/approvals': 'approvals',
  '/admin/inventory': 'inventory',
  '/admin/subscriptions': 'subscriptions',
  '/admin/upsell': 'upsell',
  '/admin/reports': 'reports',
  '/admin/health': 'health',
  '/admin/deal-health': 'health',
  '/admin/audit': 'audit',
  '/admin/settings': 'settings',
};

const TAB_ROUTE_MAP = {
  dashboard: '/admin/home',
  users: '/admin/users',
  customers: '/admin/customers',
  products: '/admin/products',
  pricing: '/admin/pricing',
  approvals: '/admin/approvals',
  inventory: '/admin/inventory',
  subscriptions: '/admin/subscriptions',
  upsell: '/admin/upsell',
  reports: '/admin/reports',
  health: '/admin/deal-health',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

export default function AdminConfigPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    products: initialProducts,
    categories: initialCategories,
    customerTiers: initialCustomerTiers,
    customers: initialCustomers,
    warehouses: initialWarehouses,
    stock: initialStock,
    subscriptionPlans: initialSubscriptionPlans,
    quotations: initialQuotations,
    dealHealth,
  } = useDealFlow();

  const currentPath = location.pathname.toLowerCase();
  const initialTab = ROUTE_TAB_MAP[currentPath] || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = ROUTE_TAB_MAP[location.pathname.toLowerCase()];
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const targetRoute = TAB_ROUTE_MAP[tabId] || '/admin/home';
    if (location.pathname.toLowerCase() !== targetRoute) {
      navigate(targetRoute);
    }
  };

  // --- STATE FOR ADMIN SECTIONS ---

  // 1. Users State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'sales_rep', is_active: true, customer_id: null, password: '' });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Reset Password State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);

  // 2. Customers State
  const [customersList, setCustomersList] = useState(initialCustomers || []);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all');

  // 3. Products & Pricing State
  const [productList, setProductList] = useState(initialProducts || []);
  const [productSearch, setProductSearch] = useState('');

  // 4. Customer Tiers State
  const [tiersList, setTiersList] = useState(initialCustomerTiers || []);

  // Fetch users directly from backend database
  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      if (Array.isArray(data)) {
        const formatted = data.map((u) => ({
          id: u.id,
          name: u.full_name || u.name || 'User',
          email: u.email,
          phone: u.phone_number || u.phone || '',
          role: u.role || 'sales_rep',
          is_active: u.is_active !== false,
          customer_id: u.customer_id || null,
          company_name: u.company_name || null,
          created_at: u.created_at ? String(u.created_at).split('T')[0] : '2026-01-01',
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.warn('Failed to load users from DB API:', err.message);
    }
  };

  // Fetch customers directly from backend database API
  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      if (Array.isArray(data) && data.length > 0) {
        setCustomersList(data);
      }
    } catch (err) {
      console.warn('Failed to load customers from DB API, using fallback:', err.message);
    }
  };

  // Fetch catalog products from backend DB
  const fetchProducts = async () => {
    try {
      const data = await apiClient.get('/catalog/products');
      if (Array.isArray(data) && data.length > 0) {
        setProductList(data);
      }
    } catch (err) {
      console.warn('Failed to load products from DB API:', err.message);
    }
  };

  // Fetch customer tiers from backend DB
  const fetchTiers = async () => {
    try {
      const data = await apiClient.get('/customer-tiers');
      if (Array.isArray(data) && data.length > 0) {
        setTiersList(data);
      }
    } catch (err) {
      console.warn('Failed to load tiers from DB API:', err.message);
    }
  };

  const [dashboardSummary, setDashboardSummary] = useState(null);

  // Fetch dashboard summary metrics from DB API
  const fetchDashboardSummary = async () => {
    try {
      const data = await apiClient.get('/dashboard/summary');
      if (data && typeof data === 'object') {
        setDashboardSummary(data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard summary from DB API:', err.message);
    }
  };

  const [liveDealHealth, setLiveDealHealth] = useState(dealHealth || { alerts: [] });

  // Fetch live deal health alerts from DB API
  const fetchLiveDealHealth = async () => {
    try {
      const data = await apiClient.get('/deal-health/alerts');
      if (Array.isArray(data)) {
        setLiveDealHealth({ alerts: data });
      }
    } catch (err) {
      console.warn('Failed to load deal health alerts from DB API:', err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCustomers();
    fetchProducts();
    fetchTiers();
    fetchDashboardSummary();
    fetchLiveDealHealth();
  }, []);

  // 5. Discount & Approval Rules State
  const [approvalRules, setApprovalRules] = useState([
    { level: 1, role: 'Sales Representative', max_discount: 10, auto_approve: true, description: 'Discounts up to 10% are auto-approved instantly.' },
    { level: 2, role: 'Sales Manager', max_discount: 25, auto_approve: false, description: 'Discounts between 10.1% and 25% require Sales Manager sign-off.' },
    { level: 3, role: 'Finance / Admin', max_discount: 50, auto_approve: false, description: 'Discounts over 25% or custom billing terms require Finance/Admin approval.' },
  ]);

  // 6. Inventory & Warehouses State
  const [warehousesList, setWarehousesList] = useState(initialWarehouses || []);
  const [stockList, setStockList] = useState(initialStock || []);

  // 7. Subscriptions State
  const [plansList, setPlansList] = useState(initialSubscriptionPlans || []);

  // 8. Upsell / Cross-sell Rules State
  const [upsellRules, setUpsellRules] = useState([
    { id: 'rule_1', trigger_product: 'Enterprise SaaS Platform License', suggested_product: 'Priority 24/7 SLA Support', discount_pct: 15, is_active: true },
    { id: 'rule_2', trigger_product: 'Sales Automation Suite', suggested_product: 'Custom Data Migration Package', discount_pct: 20, is_active: true },
    { id: 'rule_3', trigger_product: 'Analytics Add-on', suggested_product: 'Executive Reporting Module', discount_pct: 10, is_active: true },
  ]);

  // 9. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log_101', timestamp: '2026-09-05 14:30:12', actor: 'System Administrator', role: 'admin', action: 'USER_ROLE_UPDATED', target: 'baraiyavishalbhai32@gmail.com (sales_rep)', ip: '192.168.1.1' },
    { id: 'log_102', timestamp: '2026-09-05 14:15:00', actor: 'Saurabh Singh', role: 'sales_manager', action: 'DISCOUNT_APPROVED', target: 'Quotation Q-2026-001 (18% Discount)', ip: '192.168.1.4' },
    { id: 'log_103', timestamp: '2026-09-05 13:45:22', actor: 'Vijay Baraiya', role: 'finance_ops', action: 'SUBSCRIPTION_PRORATED', target: 'Customer Acme Corp (Line Item #3)', ip: '192.168.1.9' },
    { id: 'log_104', timestamp: '2026-09-05 12:10:05', actor: 'Vishal Baraiya', role: 'sales_rep', action: 'QUOTATION_CREATED', target: 'Quotation Q-2026-004 ($45,000)', ip: '192.168.1.12' },
  ]);

  // --- HANDLERS ---

  const handleOpenUserModal = (userToEdit = null) => {
    setUserFormErrors({});
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        name: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone || userToEdit.phone_number || '',
        role: userToEdit.role,
        is_active: userToEdit.is_active,
        customer_id: userToEdit.customer_id || null,
        password: '',
      });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', phone: '', role: 'sales_rep', is_active: true, customer_id: null, password: '' });
    }
    setShowUserModal(true);
  };

  const handleViewUser = (userToView) => {
    setViewingUser(userToView);
    setShowViewUserModal(true);
  };

  const handleOpenResetPasswordModal = (userToReset) => {
    setResettingUser(userToReset);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async (userId, newPassword) => {
    try {
      await userService.resetPassword(userId, newPassword);
      toast.success(`Password updated successfully for ${resettingUser?.email || 'user'}!`);
      setAuditLogs([
        { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'USER_PASSWORD_RESET', target: resettingUser?.email || userId, ip: '127.0.0.1' },
        ...auditLogs,
      ]);
      setShowResetPasswordModal(false);
      setResettingUser(null);
    } catch (err) {
      console.error('[Frontend handleConfirmResetPassword] Error:', err);
      toast.error(err.message || 'Failed to reset user password');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (!userToDelete) return;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete user "${userToDelete.name || userToDelete.email}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.name || userToDelete.email}" permanently deleted from database.`);
      setAuditLogs([
        { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'USER_DELETED', target: userToDelete.email || userToDelete.id, ip: '127.0.0.1' },
        ...auditLogs,
      ]);
      await fetchUsers();
    } catch (err) {
      console.error('[Frontend handleDeleteUser] Error:', err);
      toast.error(err.message || 'Failed to delete user account');
    }
  };

  const validateUserForm = () => {
    const errors = {};
    if (!userForm.name || !userForm.name.trim()) {
      errors.name = 'Full Name is required.';
    } else if (userForm.name.trim().length < 2) {
      errors.name = 'Full Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userForm.email || !userForm.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(userForm.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. user@dealflow360.com).';
    }

    const phoneDigits = (userForm.phone || '').replace(/\D/g, '');
    if (!userForm.phone || !userForm.phone.trim()) {
      errors.phone = 'Phone Number is required.';
    } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phone = 'Please enter a valid phone number (7 to 15 digits, e.g. +917383359679).';
    }

    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          full_name: userForm.name,
          email: userForm.email,
          phone_number: userForm.phone,
          role: userForm.role,
          is_active: userForm.is_active,
          customer_id: userForm.customer_id,
        });
        toast.success(`User ${userForm.email} updated in database!`);
        setAuditLogs([
          { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'USER_EDITED', target: userForm.email, ip: '127.0.0.1' },
          ...auditLogs,
        ]);
      } else {
        await userService.createUser({
          full_name: userForm.name,
          email: userForm.email,
          phone_number: userForm.phone,
          role: userForm.role,
          password: userForm.password || 'Darshan@1234',
          customer_id: userForm.customer_id,
        });
        toast.success(`New user ${userForm.name} created and saved to database!`);
        setAuditLogs([
          { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'USER_CREATED', target: userForm.email, ip: '127.0.0.1' },
          ...auditLogs,
        ]);
      }
      await fetchUsers();
      setShowUserModal(false);
    } catch (err) {
      console.error('[Frontend handleSaveUser] Error:', err);
      toast.error(err.message || 'Failed to save user in database');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const userObj = users.find((u) => u.id === userId);
    if (!userObj) return;
    const newStatus = !userObj.is_active;

    try {
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`User ${userObj.email} status set to ${newStatus ? 'Active' : 'Inactive'}!`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u)));
    } catch (err) {
      console.warn('[Frontend handleToggleUserStatus] DB status toggle failed:', err.message);
      toast.error('Failed to update user status in database');
    }
  };

  const handleExportCSV = (filename, dataRows, headers) => {
    if (!dataRows || dataRows.length === 0) {
      toast.error('No records available to export');
      return;
    }
    const csvContent = [headers.join(','), ...dataRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${dataRows.length} rows to ${filename}.csv`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const query = userSearch.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.company_name && u.company_name.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  const tabsList = [
    { id: 'dashboard', label: 'Dashboard Overview' },
    { id: 'users', label: 'Users & Roles' },
    { id: 'customers', label: 'Customers & Tiers' },
    { id: 'products', label: 'Product Catalog' },
    { id: 'pricing', label: 'Pricing Matrix' },
    { id: 'approvals', label: 'Discount & Approvals' },
    { id: 'inventory', label: 'Inventory & Warehouses' },
    { id: 'subscriptions', label: 'Subscription Plans' },
    { id: 'upsell', label: 'Upsell & Recommendations' },
    { id: 'reports', label: 'Analytics Reports' },
    { id: 'health', label: 'Deal Health Alerts' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'settings', label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* LEFT ADMIN SIDEBAR COMPONENT */}
      <AdminSidebar
        tabsList={tabsList}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        dealHealth={liveDealHealth}
      />

      {/* RIGHT MAIN CONTENT CONTAINER (SCROLLS INDEPENDENTLY) */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden min-h-[calc(100vh-4rem)]">
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {tabsList.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Configure system parameters, manage permissions, and monitor enterprise B2B sales operations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('users')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Manage Users
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <DashboardOverviewTab
            usersCount={users.length}
            customersCount={customersList.length}
            productsCount={productList.length}
            categoriesCount={initialCategories.length}
            healthAlertsCount={dealHealth?.alerts?.length || 0}
            initialQuotations={initialQuotations}
            auditLogs={auditLogs}
            setActiveTab={setActiveTab}
            dashboardSummary={dashboardSummary}
          />
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            filteredUsers={filteredUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            handleOpenUserModal={handleOpenUserModal}
            handleToggleUserStatus={handleToggleUserStatus}
            handleViewUser={handleViewUser}
            showUserModal={showUserModal}
            setShowUserModal={setShowUserModal}
            editingUser={editingUser}
            userForm={userForm}
            setUserForm={setUserForm}
            userFormErrors={userFormErrors}
            setUserFormErrors={setUserFormErrors}
            handleSaveUser={handleSaveUser}
            showViewUserModal={showViewUserModal}
            setShowViewUserModal={setShowViewUserModal}
            viewingUser={viewingUser}
            customersList={customersList}
            showResetPasswordModal={showResetPasswordModal}
            setShowResetPasswordModal={setShowResetPasswordModal}
            resettingUser={resettingUser}
            handleOpenResetPasswordModal={handleOpenResetPasswordModal}
            handleConfirmResetPassword={handleConfirmResetPassword}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {/* TAB 3: CUSTOMERS & TIERS */}
        {activeTab === 'customers' && (
          <CustomersTab
            customersList={customersList}
            setCustomersList={setCustomersList}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            customerTierFilter={customerTierFilter}
            setCustomerTierFilter={setCustomerTierFilter}
            tiersList={tiersList}
            salesReps={users.filter((u) => u.role === 'sales_rep' || u.role === 'sales_manager' || u.role === 'admin')}
            handleExportCSV={handleExportCSV}
            fetchCustomers={fetchCustomers}
          />
        )}

        {/* TAB 4: PRODUCT CATALOG */}
        {activeTab === 'products' && (
          <ProductsTab
            productList={productList}
            setProductList={setProductList}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            initialCategories={initialCategories}
            handleExportCSV={handleExportCSV}
            fetchProducts={fetchProducts}
          />
        )}

        {/* TAB 5: PRICING MATRIX */}
        {activeTab === 'pricing' && (
          <PricingTab
            productList={productList}
            tiersList={tiersList}
          />
        )}

        {/* TAB 6: DISCOUNT & APPROVAL RULES */}
        {activeTab === 'approvals' && (
          <ApprovalRulesTab
            approvalRules={approvalRules}
          />
        )}

        {/* TAB 7: INVENTORY & WAREHOUSES */}
        {activeTab === 'inventory' && (
          <InventoryTab
            warehousesList={warehousesList}
            stockList={stockList}
            productList={productList}
          />
        )}

        {/* TAB 8: SUBSCRIPTION PLANS */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            plansList={plansList}
            productList={productList}
          />
        )}

        {/* TAB 9: UPSELL & CROSS-SELL */}
        {activeTab === 'upsell' && (
          <UpsellTab
            upsellRules={upsellRules}
            productList={productList}
          />
        )}

        {/* TAB 10: ANALYTICS REPORTS */}
        {activeTab === 'reports' && (
          <ReportsTab
            initialQuotations={initialQuotations}
            handleExportCSV={handleExportCSV}
          />
        )}

        {/* TAB 11: DEAL HEALTH ALERTS */}
        {activeTab === 'health' && (
          <DealHealthTab
            dealHealth={liveDealHealth}
            onRefresh={fetchLiveDealHealth}
          />
        )}

        {/* TAB 12: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <AuditLogsTab
            auditLogs={auditLogs}
            handleExportCSV={handleExportCSV}
          />
        )}

        {/* TAB 13: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <SystemSettingsTab />
        )}
      </main>
    </div>
  );
}
