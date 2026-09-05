import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDealFlow } from '../../context/DealFlowContext';
import userService from '../../services/user.service';

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

  // Selected Admin Section Tab dynamically synced with URL path
  const currentPath = location.pathname.toLowerCase();
  const initialTab = ROUTE_TAB_MAP[currentPath] || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state when location changes
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
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'sales_rep', is_active: true });

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
          created_at: u.created_at ? String(u.created_at).split('T')[0] : '2026-01-01',
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error('Failed to load users from DB:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Customers State
  const [customersList, setCustomersList] = useState(initialCustomers || []);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all');

  // 3. Products & Pricing State
  const [productList, setProductList] = useState(initialProducts || []);
  const [productSearch, setProductSearch] = useState('');

  // 4. Customer Tiers State
  const [tiersList, setTiersList] = useState(initialCustomerTiers || []);

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

  // 9. Reports State
  const [reportFilterCategory, setReportFilterCategory] = useState('all');

  // 10. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log_101', timestamp: '2026-09-05 14:30:12', actor: 'System Administrator', role: 'admin', action: 'USER_ROLE_UPDATED', target: 'baraiyavishalbhai32@gmail.com (sales_rep)', ip: '192.168.1.1' },
    { id: 'log_102', timestamp: '2026-09-05 14:15:00', actor: 'Saurabh Singh', role: 'sales_manager', action: 'DISCOUNT_APPROVED', target: 'Quotation Q-2026-001 (18% Discount)', ip: '192.168.1.4' },
    { id: 'log_103', timestamp: '2026-09-05 13:45:22', actor: 'Vijay Baraiya', role: 'finance_ops', action: 'SUBSCRIPTION_PRORATED', target: 'Customer Acme Corp (Line Item #3)', ip: '192.168.1.9' },
    { id: 'log_104', timestamp: '2026-09-05 12:10:05', actor: 'Vishal Baraiya', role: 'sales_rep', action: 'QUOTATION_CREATED', target: 'Quotation Q-2026-004 ($45,000)', ip: '192.168.1.12' },
  ]);

  // 11. Platform Settings State
  const [settings, setSettings] = useState({
    companyName: 'DealFlow360 Technologies Inc.',
    supportEmail: 'admin@dealflow360.com',
    currency: 'USD ($)',
    defaultTaxRate: '18%',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'admin@dealflow360.com',
    twilioSid: '''',
    twilioNumber: 'whatsapp:+14155238886',
    enforce2FA: true,
    sessionTimeout: '24 Hours',
  });

  // --- HANDLERS ---

  // User Management Handlers (Synced with Backend Database)
  const handleOpenUserModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({ name: userToEdit.name, email: userToEdit.email, phone: userToEdit.phone || '', role: userToEdit.role, is_active: userToEdit.is_active });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', phone: '', role: 'sales_rep', is_active: true });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    console.log('[Frontend handleSaveUser] Submitting user form:', userForm);
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.phone.trim()) {
      toast.error('Full Name, Email Address, and Phone Number are required.');
      return;
    }

    const phoneDigits = userForm.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      toast.error('Please enter a valid phone number (7 to 15 digits, e.g. +917383359679).');
      return;
    }

    try {
      if (editingUser) {
        console.log('[Frontend handleSaveUser] Calling userService.updateUser:', editingUser.id);
        const res = await userService.updateUser(editingUser.id, {
          full_name: userForm.name,
          email: userForm.email,
          phone_number: userForm.phone,
          role: userForm.role,
          is_active: userForm.is_active,
        });
        console.log('[Frontend handleSaveUser] updateUser result:', res);
        toast.success(`User ${userForm.email} updated in database!`);
        setAuditLogs([
          { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'USER_EDITED', target: userForm.email, ip: '127.0.0.1' },
          ...auditLogs,
        ]);
      } else {
        console.log('[Frontend handleSaveUser] Calling userService.createUser...');
        const res = await userService.createUser({
          full_name: userForm.name,
          email: userForm.email,
          phone_number: userForm.phone,
          role: userForm.role,
          password: 'Darshan@1234',
        });
        console.log('[Frontend handleSaveUser] createUser result:', res);
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
      toast.success(`User ${userObj.name} status updated to ${newStatus ? 'Active' : 'Inactive'}!`);
      setAuditLogs([
        { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', target: userObj.email, ip: '127.0.0.1' },
        ...auditLogs,
      ]);
      await fetchUsers();
    } catch (err) {
      console.error('Toggle Status Error:', err);
      toast.error(err.message || 'Failed to update user status');
    }
  };

  // CSV Export Handler
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

  // Save Settings Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully!');
    setAuditLogs([
      { id: `log_${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), actor: 'System Administrator', role: 'admin', action: 'SETTINGS_UPDATED', target: 'Platform Global Configuration', ip: '127.0.0.1' },
      ...auditLogs,
    ]);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Admin Navigation Tabs List
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
    { id: 'settings', label: 'Platform Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* LEFT ADMIN SIDEBAR (FIXED) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 md:fixed md:top-16 md:bottom-0 md:left-0 md:overflow-y-auto z-30">
        <nav className="space-y-1">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'health' && dealHealth?.alerts?.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    {dealHealth.alerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

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
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              System Settings
            </button>
          </div>
        </div>

        {/* ==================== TAB 1: DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Total System Users</span>
                <div className="text-2xl font-black text-slate-900">{users.length}</div>
                <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">{users.filter((u) => u.is_active).length} Active Users</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Managed Customers</span>
                <div className="text-2xl font-black text-slate-900">{customersList.length}</div>
                <span className="text-[11px] font-semibold text-indigo-600 mt-1 inline-block">Across Platinum & Gold Tiers</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Catalog Products</span>
                <div className="text-2xl font-black text-slate-900">{productList.length}</div>
                <span className="text-[11px] font-semibold text-slate-600 mt-1 inline-block">{initialCategories.length} Categories</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Health Alerts</span>
                <div className="text-2xl font-black text-rose-600">{dealHealth?.alerts?.length || 0}</div>
                <span className="text-[11px] font-semibold text-rose-600 mt-1 inline-block">Requires Attention</span>
              </div>
            </div>

            {/* Quick Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Quotations Overview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Recent Quotation Workflow</h3>
                  <button onClick={() => setActiveTab('reports')} className="text-xs text-indigo-600 font-semibold hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {initialQuotations.slice(0, 4).map((q) => (
                    <div key={q.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold font-mono text-indigo-700">{q.quote_number}</div>
                        <div className="text-slate-600 font-medium">{q.customer_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">${Number(q.total_amount || 0).toLocaleString()}</div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Audit Activity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">System Audit Stream</h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-indigo-600 font-semibold hover:underline">
                    View Logs
                  </button>
                </div>
                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{log.actor}</span>
                        <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-mono text-indigo-600 font-semibold">{log.action}</span>
                        <span className="text-slate-600 truncate max-w-[180px]">{log.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: USERS & ROLES ==================== */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Platform User Accounts</h2>
                <p className="text-xs text-slate-600">Create, edit, activate/deactivate accounts and assign operational roles.</p>
              </div>

              <button
                onClick={() => handleOpenUserModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                + Create New User
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="all">All Roles</option>
                <option value="sales_rep">Sales Representative</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="finance_ops">Finance Operations</option>
                <option value="admin">System Administrator</option>
                <option value="customer">Customer User</option>
              </select>
            </div>

            {/* Users Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3 font-mono text-slate-500">{u.phone || 'N/A'}</td>
                      <td className="p-3">
                        <span className="inline-block w-32 text-center py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          title={`Click to ${u.is_active ? 'Deactivate' : 'Activate'} user`}
                          className="inline-flex items-center focus:outline-none cursor-pointer"
                        >
                          <div
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              u.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                u.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USER MODAL FORM */}
        {showUserModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                {editingUser ? 'Edit User Profile' : 'Create New System User'}
              </h3>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Darshan Baraiya"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@dealflow360.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Operational Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="sales_rep">Sales Representative</option>
                    <option value="sales_manager">Sales Manager</option>
                    <option value="finance_ops">Finance Operations</option>
                    <option value="admin">System Administrator</option>
                    <option value="customer">Customer User</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active_check" className="text-xs font-semibold text-slate-800">
                    Account Status Active
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    Save User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CUSTOMERS ==================== */}
        {activeTab === 'customers' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Customer Companies & Tier Management</h2>
                <p className="text-xs text-slate-600">Assign customer tiers, credit terms, and designated sales representatives.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Customer Tier</th>
                    <th className="p-3">Assigned Sales Rep</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {customersList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.company_name}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{c.customer_code || c.id}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold uppercase">
                          {c.tier_code || c.tier_name || 'Platinum'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{c.sales_rep_name || 'Vishal Baraiya'}</td>
                      <td className="p-3 text-slate-600">{c.primary_contact_name || 'Acme Procurement'}</td>
                      <td className="p-3 font-mono text-slate-500">{c.primary_contact_email || 'procurement@company.com'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: PRODUCT CATALOG ==================== */}
        {activeTab === 'products' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Master Product Catalog</h2>
                <p className="text-xs text-slate-600">Base prices, cost prices, SKUs, and calculated profit margins.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3">Cost Price</th>
                    <th className="p-3">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {productList.map((p) => {
                    const margin = p.base_price > 0 ? (((p.base_price - p.cost_price) / p.base_price) * 100).toFixed(1) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-700">{p.sku}</td>
                        <td className="p-3 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3 uppercase text-slate-600 font-semibold">{p.category_name}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">${Number(p.base_price || 0).toLocaleString()}</td>
                        <td className="p-3 font-mono text-slate-500">${Number(p.cost_price || 0).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: PRICING MATRIX ==================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Customer Tier Price Matrix</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiersList.map((t) => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Tier Code: {t.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{t.label}</h3>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-600">Default Discount Ceiling:</span>
                      <span className="font-mono font-bold text-emerald-700">{t.default_discount_ceiling_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: DISCOUNT & APPROVALS ==================== */}
        {activeTab === 'approvals' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Discount Governance & Approval Chains</h2>
              <p className="text-xs text-slate-600">Set discount threshold rules and sign-off escalation policies.</p>
            </div>

            <div className="space-y-3">
              {approvalRules.map((rule) => (
                <div key={rule.level} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-700">Level {rule.level}: {rule.role}</span>
                      {rule.auto_approve && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">Auto-Approved</span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">{rule.description}</p>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    Max: {rule.max_discount}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 7: INVENTORY & WAREHOUSES ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Warehouse Locations & Shipping Freight Multipliers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {warehousesList.map((wh) => (
                  <div key={wh.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <div className="font-bold text-slate-900 text-sm">{wh.name}</div>
                    <div className="text-xs text-slate-500">{wh.location}</div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-600">Freight Weight:</span>
                      <span className="font-mono font-bold text-indigo-700">{wh.shipping_cost_weight}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Warehouse Stock Allocations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Warehouse</th>
                      <th className="p-3">On-Hand Stock</th>
                      <th className="p-3">Reorder Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {stockList.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-700">{s.sku}</td>
                        <td className="p-3 font-bold text-slate-900">{s.product_name}</td>
                        <td className="p-3 text-slate-600">{s.warehouse_name}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{s.quantity_on_hand} Units</td>
                        <td className="p-3 font-mono text-amber-700 font-bold">{s.reorder_level || 50} Units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: SUBSCRIPTION PLANS ==================== */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Subscription Plans & Billing Cycle Governance</h2>
              <p className="text-xs text-slate-600">Proration methods, billing intervals, and subscription tier rules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plansList.map((plan) => (
                <div key={plan.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {plan.billing_cycle}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">{plan.name}</h3>
                  <div className="text-xl font-black text-slate-900 font-mono">${plan.price} <span className="text-xs font-normal text-slate-500">/ cycle</span></div>
                  <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 9: UPSELL & RECOMMENDATIONS ==================== */}
        {activeTab === 'upsell' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Cross-sell & Upsell Rule Engine</h2>
              <p className="text-xs text-slate-600">Automated product recommendations and bundle discount triggers.</p>
            </div>

            <div className="space-y-3">
              {upsellRules.map((rule) => (
                <div key={rule.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 mb-1">
                      If cart contains: <span className="text-indigo-700">{rule.trigger_product}</span>
                    </div>
                    <div className="text-slate-600">
                      Recommend: <strong className="text-slate-800">{rule.suggested_product}</strong>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    {rule.discount_pct}% Bundle Discount
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 10: REPORTS & EXPORT ==================== */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Platform Analytics Reports</h2>
                <p className="text-xs text-slate-600">Export quotations, revenue performance, and discount metrics to CSV.</p>
              </div>

              <button
                onClick={() =>
                  handleExportCSV(
                    'dealflow_sales_report',
                    initialQuotations.map((q) => [q.quote_number, q.customer_name, q.status, q.total_amount, q.blended_risk_score]),
                    ['Quote Number', 'Customer Name', 'Status', 'Total Amount ($)', 'Blended Risk Score']
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Export CSV Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Quote #</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {initialQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-700">{q.quote_number}</td>
                      <td className="p-3 font-bold text-slate-900">{q.customer_name}</td>
                      <td className="p-3 uppercase text-slate-600 font-semibold">{q.status}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">${Number(q.total_amount || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-amber-700">{q.blended_risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 11: DEAL HEALTH ALERTS ==================== */}
        {activeTab === 'health' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Deal Health & Operational Risk Alerts</h2>
              <p className="text-xs text-slate-600">Stalled negotiations, discount ceiling breaches, and delivery slippage risks.</p>
            </div>

            <div className="space-y-3">
              {(dealHealth?.alerts || []).map((alert, idx) => (
                <div key={idx} className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">High Priority Alert</span>
                    <span className="font-mono text-rose-700 font-bold">{alert.quotation_number}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{alert.message || alert.issue}</p>
                </div>
              ))}

              {(!dealHealth?.alerts || dealHealth.alerts.length === 0) && (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
                  No active deal health alerts. All sales workflows are operating within normal parameters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 12: AUDIT LOGS ==================== */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">System Audit Trail</h2>
                <p className="text-xs text-slate-600">Complete log of user actions, approvals, edits, and timestamps.</p>
              </div>

              <button
                onClick={() =>
                  handleExportCSV(
                    'dealflow_audit_logs',
                    auditLogs.map((l) => [l.timestamp, l.actor, l.role, l.action, l.target, l.ip]),
                    ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'IP Address']
                  )
                }
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
              >
                Export Audit Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Event Action</th>
                    <th className="p-3">Target Details</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-3 font-bold text-slate-900">{log.actor}</td>
                      <td className="p-3 uppercase text-indigo-700 font-semibold">{log.role}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.target}</td>
                      <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 13: SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Platform System Configuration</h2>
              <p className="text-xs text-slate-600">Company parameters, tax rates, currency, email SMTP, WhatsApp integration, and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Company & Finance</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Tax Rate</label>
                  <input
                    type="text"
                    value={settings.defaultTaxRate}
                    onChange={(e) => setSettings({ ...settings, defaultTaxRate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Email SMTP Config */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Email & Messaging Integration</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Sandbox Number</label>
                  <input
                    type="text"
                    value={settings.twilioNumber}
                    onChange={(e) => setSettings({ ...settings, twilioNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Timeout</label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="1 Hour">1 Hour</option>
                    <option value="8 Hours">8 Hours</option>
                    <option value="24 Hours">24 Hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Save System Settings
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
