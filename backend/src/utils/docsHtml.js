/**
 * Clean Basic UI HTML API Documentation Generator (No Icons)
 * Divided Section-by-Section by Table / Module Name (No Table HTML Elements)
 * Complete Detailed Specification for ALL 97 DealFlow360 REST APIs
 */
function getDocsHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DealFlow360 - Table & Module Divided API Documentation</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #475569;
      --border-color: #cbd5e1;
      --primary-color: #2563eb;
      --primary-hover: #1d4ed8;
      --method-get: #0284c7;
      --method-post: #16a34a;
      --method-put: #d97706;
      --method-patch: #9333ea;
      --method-delete: #dc2626;
      --code-bg: #0f172a;
      --code-text: #f8fafc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.6;
      padding: 24px;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    header {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    p.subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 16px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .meta-item {
      font-size: 13px;
    }

    .meta-item label {
      display: block;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .meta-item span {
      font-weight: 600;
      color: var(--primary-color);
    }

    .controls {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
    }

    input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      background-color: var(--card-bg);
    }

    input[type="text"]:focus {
      border-color: var(--primary-color);
    }

    .btn-toggle {
      padding: 10px 16px;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .btn-toggle:hover {
      background-color: #e2e8f0;
      border-color: #94a3b8;
    }

    .module-section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 28px;
    }

    .module-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .module-title span.count-badge {
      font-size: 12px;
      background-color: #e0e7ff;
      color: #3730a3;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 600;
    }

    .endpoint-card {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
      background-color: var(--card-bg);
    }

    .endpoint-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      background-color: #fafafa;
      user-select: none;
    }

    .endpoint-header:hover {
      background-color: #f1f5f9;
    }

    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: monospace;
      font-size: 13.5px;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 56px;
      text-align: center;
      display: inline-block;
    }

    .badge-get { background-color: var(--method-get); }
    .badge-post { background-color: var(--method-post); }
    .badge-put { background-color: var(--method-put); }
    .badge-patch { background-color: var(--method-patch); }
    .badge-delete { background-color: var(--method-delete); }

    .role-badge {
      font-size: 11px;
      background-color: #e2e8f0;
      color: #334155;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: sans-serif;
    }

    .endpoint-path {
      font-weight: 600;
      color: var(--text-main);
    }

    .endpoint-desc {
      font-size: 13px;
      color: var(--text-muted);
    }

    .endpoint-body {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      display: none;
      background-color: #ffffff;
    }

    .endpoint-body.open {
      display: block;
    }

    .detail-group {
      margin-bottom: 12px;
    }

    .detail-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    pre {
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      overflow-x: auto;
      font-family: monospace;
    }

    footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      padding: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>DealFlow360 API Reference Documentation</h1>
      <p class="subtitle">Complete REST API Endpoint Specifications Divided by Table / Module Name</p>
      
      <div class="meta-grid">
        <div class="meta-item">
          <label>Base API Namespace</label>
          <span>/api</span>
        </div>
        <div class="meta-item">
          <label>Total REST Endpoints</label>
          <span>97 Endpoints (20 Table Modules)</span>
        </div>
        <div class="meta-item">
          <label>Authentication</label>
          <span>JWT Bearer Token (Header: Authorization)</span>
        </div>
        <div class="meta-item">
          <label>CORS Policy Origin</label>
          <span>FRONTEND_URL (http://localhost:5173)</span>
        </div>
      </div>
    </header>

    <div class="controls">
      <input type="text" id="searchInput" placeholder="Search across all modules by endpoint path, method, role, or feature (e.g. /payments, /users, razorpay, risk, approval)..." onkeyup="filterEndpoints()">
      <button class="btn-toggle" onclick="expandAllCards()">Expand All</button>
      <button class="btn-toggle" onclick="collapseAllCards()">Collapse All</button>
    </div>

    <!-- 1. System Health & Connectivity -->
    <div class="module-section">
      <div class="module-title">
        <span>1. System Health & Server Connectivity</span>
        <span class="count-badge">2 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /health /api/health system status uptime memory ping">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/health &nbsp;|&nbsp; /api/health</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">System health status, server uptime, database connection & memory metrics</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div>
          <pre>{\n  "status": "healthy",\n  "service": "dealflow360",\n  "environment": "dev",\n  "uptime_seconds": 245,\n  "timestamp": "2026-09-05T13:45:00.000Z",\n  "database": { "status": "connected", "engine": "postgresql" },\n  "memory": { "heapUsed": "18.42 MB", "heapTotal": "34.12 MB", "rss": "72.10 MB" }\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="get /ping server ping pong">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/ping</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">Simple ping server connectivity test</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>pong (DealFlow360)</pre></div>
        </div>
      </div>
    </div>

    <!-- 2. Authentication & Session Module -->
    <div class="module-section">
      <div class="module-title">
        <span>2. Authentication & Session Module (users Table Auth)</span>
        <span class="count-badge">6 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="post /api/auth/login authentication login magic link password">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/auth/login</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">Authenticate user credentials or magic token; returns JWT token & user profile</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "email": "baraiyavishalbhai32@gmail.com",\n  "password": "password123"\n}</pre></div>
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": { "id": "101", "full_name": "Sales Representative", "email": "baraiyavishalbhai32@gmail.com", "role": "sales_rep" }\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="get /api/auth/me profile user info authentication">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/auth/me</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Retrieve profile information of currently logged in user</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/auth/logout authentication clear cookie">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/auth/logout</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Log out user and clear auth session cookie</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Successfully logged out."\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/auth/forgot-password reset token email">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/auth/forgot-password</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">Initiate password reset request and generate reset token</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "email": "user@example.com"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/auth/reset-password new password token">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/auth/reset-password</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">Reset user password using generated token</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "token": "reset_1772870400000_abc123",\n  "newPassword": "newPassword123"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/auth/magic-link customer portal access">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/auth/magic-link</span>
            <span class="role-badge">Public</span>
          </div>
          <div class="endpoint-desc">Generate one-click magic link token for passwordless customer login</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "email": "customer@company.com"\n}</pre></div>
        </div>
      </div>
    </div>

    <!-- 3. Users Management (users Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>3. Users Management (users Table)</span>
        <span class="count-badge">5 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/users list users admin sales_manager finance_ops">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/users</span>
            <span class="role-badge">Admin, Sales Manager, Finance Ops</span>
          </div>
          <div class="endpoint-desc">List all system users and assigned roles</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "101", "full_name": "Sales Representative", "role": "sales_rep", "email": "..." }\n]</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/users create user admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/users</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create a new user profile with assigned RBAC role</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "full_name": "John Doe",\n  "email": "john@example.com",\n  "role": "sales_rep",\n  "password": "password123"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="get /api/users/:id user detail admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/users/:id</span>
            <span class="role-badge">Admin, Sales Manager, Finance Ops</span>
          </div>
          <div class="endpoint-desc">Get detailed user profile by ID</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="put /api/users/:id update user admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/users/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Update user profile information and assigned role</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "full_name": "John Updated",\n  "role": "sales_manager"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="delete /api/users/:id delete user admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/users/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a user profile by ID</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "User deleted successfully",\n  "id": "104"\n}</pre></div>
        </div>
      </div>
    </div>

    <!-- 4. Customers Directory (customers Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>4. Customers Directory (customers Table)</span>
        <span class="count-badge">8 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/customers list customers customer directory">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customers</span>
            <span class="role-badge">Admin, Manager, Finance, Sales Rep</span>
          </div>
          <div class="endpoint-desc">List customer accounts, assigned tiers, and contacts</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "301", "company_name": "Acme Corp", "tier_id": "203" }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/customers add customer company">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/customers</span>
            <span class="role-badge">Admin, Manager, Sales Rep</span>
          </div>
          <div class="endpoint-desc">Create new customer account record</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "company_name": "Acme Corp",\n  "tier_id": "203",\n  "email": "john@acme.com"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/customers/:id customer profile">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customers/:id</span>
            <span class="role-badge">Admin, Manager, Finance, Sales Rep</span>
          </div>
          <div class="endpoint-desc">Get specific customer profile details by ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="put /api/customers/:id update customer">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/customers/:id</span>
            <span class="role-badge">Admin, Manager, Sales Rep</span>
          </div>
          <div class="endpoint-desc">Update customer profile details</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "company_name": "Acme Corp Updated"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/customers/:id delete customer">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/customers/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a customer profile by ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Customer deleted successfully"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/customers/:id/quotations customer quotes">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customers/:id/quotations</span>
            <span class="role-badge">Admin, Manager, Finance, Rep, Customer</span>
          </div>
          <div class="endpoint-desc">List all sales quotations created for a specific customer</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/customers/:id/orders customer orders">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customers/:id/orders</span>
            <span class="role-badge">Admin, Manager, Finance, Rep, Customer</span>
          </div>
          <div class="endpoint-desc">List all confirmed orders for a specific customer</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/customers/:id/invoices customer invoices">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customers/:id/invoices</span>
            <span class="role-badge">Admin, Manager, Finance, Rep, Customer</span>
          </div>
          <div class="endpoint-desc">List all billing invoices for a specific customer</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>
    </div>

    <!-- 5. Customer Tiers (customer_tiers Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>5. Customer Tiers (customer_tiers Table)</span>
        <span class="count-badge">2 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/customer-tiers tiers ceiling discount">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/customer-tiers</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List customer tiers and maximum allowed discount ceilings</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "201", "tier_code": "bronze", "name": "Bronze Tier", "discount_ceiling_pct": 5.0 },\n  { "id": "202", "tier_code": "silver", "name": "Silver Tier", "discount_ceiling_pct": 10.0 },\n  { "id": "203", "tier_code": "gold", "name": "Gold Tier", "discount_ceiling_pct": 15.0 },\n  { "id": "204", "tier_code": "platinum", "name": "Platinum Tier", "discount_ceiling_pct": 25.0 }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/customer-tiers create tier admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/customer-tiers</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create a new customer discount governance tier</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "tier_code": "diamond",\n  "name": "Diamond Enterprise Tier",\n  "discount_ceiling_pct": 30.0\n}</pre></div></div>
      </div>
    </div>

    <!-- 6. Product Categories (product_categories Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>6. Product Categories (product_categories Table)</span>
        <span class="count-badge">5 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/categories product categories catalog">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/categories</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List product categories (hardware, service, subscription)</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "401", "name": "Hardware", "category_type": "hardware", "discount_ceiling_pct": 15.0 }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/categories/:id category detail">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/categories/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get specific product category details</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/categories create category admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/categories</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create product category with discount cap limit</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "name": "Cloud Software",\n  "category_type": "subscription",\n  "discount_ceiling_pct": 20.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="put /api/categories/:id update category admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/categories/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Update product category parameters</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "discount_ceiling_pct": 18.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/categories/:id delete category admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/categories/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a product category by ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Category deleted"\n}</pre></div></div>
      </div>
    </div>

    <!-- 7. Products & Variants (products & product_variants Tables) -->
    <div class="module-section">
      <div class="module-title">
        <span>7. Products & Variants (products & product_variants Tables)</span>
        <span class="count-badge">11 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/products catalog items price sku">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/products</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List product catalog with base prices, costs, and tax rates</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "501", "sku": "HW-SRV-01", "name": "Enterprise Server X", "base_price": 1000.0, "cost_price": 700.0 }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/products/:id product detail sku">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/products/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get detailed product record by ID or SKU</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/products create product admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/products</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create a new catalog product record</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "sku": "HW-SRV-02",\n  "name": "Rack Server Pro",\n  "category_id": "401",\n  "base_price": 2500.0,\n  "cost_price": 1800.0,\n  "tax_rate_pct": 18.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="put /api/products/:id update product admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/products/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Update existing product pricing and parameters</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "base_price": 2600.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/products/:id delete product admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/products/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a product from the catalog</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Product deleted"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="patch /api/products/:id/status activate deactivate product">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-patch">PATCH</span>
            <span class="endpoint-path">/api/products/:id/status</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Toggle product active status (active / inactive)</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "is_active": true\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="patch /api/products/:id/promotion promote product upsell">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-patch">PATCH</span>
            <span class="endpoint-path">/api/products/:id/promotion</span>
            <span class="role-badge">Admin, Sales Manager</span>
          </div>
          <div class="endpoint-desc">Toggle product promotion status for live upsell ranking engine</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "is_promoted": true\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/products/:id/variants product variants">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/products/:id/variants</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List all configuration variants for a product</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/products/:id/variants add variant admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/products/:id/variants</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create product configuration variant (e.g. RAM 64GB)</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "attribute_name": "RAM",\n  "value": "64GB",\n  "extra_price": 300.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="put /api/products/:id/variants/:variantId update variant">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/products/:id/variants/:variantId</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Update product variant pricing and attributes</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "extra_price": 350.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/products/:id/variants/:variantId delete variant">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/products/:id/variants/:variantId</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a product variant by ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Variant deleted"\n}</pre></div></div>
      </div>
    </div>

    <!-- 8. Price Lists (price_lists Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>8. Price Lists (price_lists Table)</span>
        <span class="count-badge">3 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/price-lists price books tiered pricing">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/price-lists</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List price books and tier price overrides</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "pl_101", "name": "Gold Enterprise Price List", "currency": "USD" }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/price-lists create price list admin finance">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/price-lists</span>
            <span class="role-badge">Admin, Finance Ops</span>
          </div>
          <div class="endpoint-desc">Create custom price list schedule</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "name": "APAC Regional Price List",\n  "currency": "INR"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/price-lists/:id price list detail">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/price-lists/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get specific price list details</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>
    </div>

    <!-- 9. Discount Governance Rules (discount_rules Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>9. Discount Governance Rules (discount_rules Table)</span>
        <span class="count-badge">3 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/discount/rules discount ceilings policy">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/discount/rules &nbsp;|&nbsp; /api/discount-rules</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List active category & tier discount governance rules</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "disc_101", "name": "Hardware Max Discount", "category_type": "hardware", "max_discount_pct": 15.0 }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/discount/rules create discount rule admin finance">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/discount/rules &nbsp;|&nbsp; /api/discount-rules</span>
            <span class="role-badge">Admin, Finance Ops</span>
          </div>
          <div class="endpoint-desc">Create discount cap rule for risk score engine</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "rule_name": "SaaS Subscription Discount Cap",\n  "category_type": "subscription",\n  "max_discount_pct": 20.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/discount/rules/:id delete discount rule">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/discount/rules/:id</span>
            <span class="role-badge">Admin, Finance Ops</span>
          </div>
          <div class="endpoint-desc">Delete a discount cap rule</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Discount rule deleted"\n}</pre></div></div>
      </div>
    </div>

    <!-- 10. Quotations & Risk Pre-flight Engine (quotations & quotation_line_items Tables) -->
    <div class="module-section">
      <div class="module-title">
        <span>10. Quotations & Risk Pre-flight Engine (quotations Table)</span>
        <span class="count-badge">6 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/quotations list quotes sales">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/quotations</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List all sales quotes and current risk status</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "1101", "quote_number": "QT-2026-001", "total_amount": 6390.0, "status": "pending_approval" }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/quotations/:id quote detail risk">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/quotations/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get specific sales quotation with line item breakdown</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/quotations create quote risk score engine">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/quotations</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Create sales quotation and calculate real-time blended risk score</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "customer_id": "301",\n  "customer_tier_code": "gold",\n  "order_discount_pct": 2.0,\n  "line_items": [\n    {\n      "product_id": "501",\n      "category_type": "hardware",\n      "quantity": 5,\n      "unit_price": 1000.0,\n      "cost_price": 700.0,\n      "discount_pct": 12.0\n    }\n  ]\n}</pre></div>
          <div class="detail-group"><div class="detail-label">Success Response (201 Created)</div><pre>{\n  "id": "1102",\n  "quote_number": "QT-2026-002",\n  "blended_risk_score": 21.87,\n  "status": "pending_approval",\n  "requires_approval": true,\n  "approval_levels": ["sales_manager", "finance_ops"],\n  "total_amount": 6390.0,\n  "overall_margin_pct": 33.33\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="put /api/quotations/:id update quote">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-put">PUT</span>
            <span class="endpoint-path">/api/quotations/:id</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Update sales quotation line items and discounts</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "order_discount_pct": 1.5\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="delete /api/quotations/:id delete quote">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-delete">DELETE</span>
            <span class="endpoint-path">/api/quotations/:id</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Delete a sales quotation</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "message": "Quotation deleted"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/quotations/:id/re-evaluate-risk recalculate risk score">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/quotations/:id/re-evaluate-risk</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Re-run blended risk score engine on updated quotation line items</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>
    </div>

    <!-- 11. Multi-Tier Approvals (approval_logs Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>11. Multi-Tier Approvals (approval_logs Table)</span>
        <span class="count-badge">3 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/approvals/pending pending risk quotes">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/approvals/pending</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">List quotations awaiting Manager or Finance approval</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/approvals/:id/approve approve quote">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/approvals/:id/approve</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Approve high-risk quotation and advance routing chain</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "comments": "Approved based on deal volume"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/approvals/:id/reject reject quote">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/approvals/:id/reject</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Reject quotation and record rejection reason</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "reason": "Margin below minimum threshold"\n}</pre></div></div>
      </div>
    </div>

    <!-- 12. Customer Portal Negotiations (quote_negotiations Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>12. Customer Portal Negotiations (quote_negotiations Table)</span>
        <span class="count-badge">3 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/negotiations list negotiations">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/negotiations</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List active counter-offer negotiations</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/negotiations/:quoteId/counter customer counter offer">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/negotiations/:quoteId/counter</span>
            <span class="role-badge">Customer, Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Submit customer counter-discount proposal and trigger risk re-evaluation</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "proposed_discount_pct": 14.0,\n  "customer_comments": "Can you match 14% for 2-year commitment?"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/negotiations/:quoteId/accept accept counter offer">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/negotiations/:quoteId/accept</span>
            <span class="role-badge">Customer, Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Accept counter-offer proposal and lock quotation</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>
    </div>

    <!-- 13. Live Upsell Engine (upsell_rules Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>13. Live Upsell Engine (upsell_rules Table)</span>
        <span class="count-badge">2 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/upsell-rules upsell rules margin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/upsell-rules</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List upsell promotion and co-purchase rules</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/upsell/recommendations margin delta preview">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/upsell/recommendations</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Compute live upsell recommendations and margin impact delta</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "current_cart_lines": [\n    { "productId": "501", "quantity": 5, "unitPrice": 1000, "costPrice": 700 }\n  ]\n}</pre></div>
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "currentMarginPct": 33.33,\n  "suggestions": [\n    {\n      "productId": "601",\n      "productName": "Cloud SaaS Subscription",\n      "price": 500,\n      "marginDeltaPct": 4.17,\n      "isMarginPositive": true,\n      "rankScore": 2.4\n    }\n  ]\n}</pre></div>
        </div>
      </div>
    </div>

    <!-- 14. Warehouses Management (warehouses Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>14. Warehouses Management (warehouses Table)</span>
        <span class="count-badge">2 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/warehouses list warehouses depots">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/warehouses</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List warehouses and depot locations</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "701", "name": "Main Central Warehouse", "location": "Chicago, IL" }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/warehouses create warehouse admin">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/warehouses</span>
            <span class="role-badge">Admin Only</span>
          </div>
          <div class="endpoint-desc">Create a new fulfillment warehouse location</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "name": "West Coast Logistics Center",\n  "location": "Reno, NV"\n}</pre></div></div>
      </div>
    </div>

    <!-- 15. Inventory Stock Management (inventory Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>15. Inventory Stock Management (inventory Table)</span>
        <span class="count-badge">2 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/inventory list stock levels">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/inventory</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List inventory stock counts across all warehouses</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/inventory/adjust adjust stock levels">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/inventory/adjust</span>
            <span class="role-badge">Admin, Finance Ops, Sales Manager</span>
          </div>
          <div class="endpoint-desc">Adjust stock quantities for warehouse inventory</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "warehouseId": "701",\n  "productId": "501",\n  "quantityDelta": 10\n}</pre></div></div>
      </div>
    </div>

    <!-- 16. Orders & Fulfillment (orders & fulfillment_splits Tables) -->
    <div class="module-section">
      <div class="module-title">
        <span>16. Orders & Fulfillment (orders & fulfillment_splits Tables)</span>
        <span class="count-badge">5 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/orders list orders">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/orders</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List all sales orders and fulfillment status</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>[\n  { "id": "1101", "order_number": "ORD-2026-001", "status": "confirmed" }\n]</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/orders/:id order detail">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/orders/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get detailed order record by ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/orders create order from quotation">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/orders</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Convert approved quotation into confirmed sales order</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "quotation_id": "1101"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/fulfillment/splits/:quoteId warehouse stock allocation split">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/fulfillment/splits/:quoteId</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Compute greedy multi-warehouse stock allocation and shipment cost split</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Success Response (200 OK)</div>
          <pre>{\n  "status": "fulfilled",\n  "totalShipmentCount": 2,\n  "totalEstimatedShipmentCost": 90.0,\n  "fulfillmentSplits": [\n    { "warehouseName": "Main Central Warehouse", "quantityFulfilled": 5 },\n    { "warehouseName": "East Coast Depot", "quantityFulfilled": 2 }\n  ]\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/fulfillment/ship trigger shipment">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/fulfillment/ship</span>
            <span class="role-badge">Admin, Manager, Finance Ops</span>
          </div>
          <div class="endpoint-desc">Trigger shipment order dispatch across allocated warehouses</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "orderId": "1101",\n  "trackingNumber": "TRK987654321"\n}</pre></div></div>
      </div>
    </div>

    <!-- 17. Subscriptions & Hybrid Billing (subscriptions & invoices Tables) -->
    <div class="module-section">
      <div class="module-title">
        <span>17. Subscriptions & Hybrid Billing (subscriptions & invoices Tables)</span>
        <span class="count-badge">8 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/subscriptions recurring subscriptions">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/subscriptions</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List active customer recurring SaaS subscriptions</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/subscription-plans saas billing plans">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/subscription-plans</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List subscription plans and recurring billing frequencies</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/subscriptions create subscription saas">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/subscriptions</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Create recurring subscription contract for a customer</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "customerId": "301",\n  "planId": "sub_plan_01",\n  "billingCycle": "monthly"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/invoices list invoices billing">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/invoices</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List billing invoices across hardware and recurring subscriptions</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/invoices/:id invoice detail hybrid billing">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/invoices/:id</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get detailed invoice payload with hybrid billing schedule</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/invoices generate invoice finance">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/invoices</span>
            <span class="role-badge">Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Generate billing invoice from order or subscription schedule</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "order_id": "1101"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/credit-notes list credit notes proration">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/credit-notes</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List credit notes issued for mid-cycle proration adjustments</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/credit-notes issue credit note finance">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/credit-notes</span>
            <span class="role-badge">Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Issue credit note for subscription proration or adjustment</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "invoice_id": "inv_1101",\n  "amount": 150.0,\n  "reason": "Mid-cycle subscription downgrade proration"\n}</pre></div></div>
      </div>
    </div>

    <!-- 18. Payment Gateway Integration (payment_transactions Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>18. Payment Gateway Integration (payment_transactions Table)</span>
        <span class="count-badge">7 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="post /api/payments/create-order razorpay payment order">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/payments/create-order</span>
            <span class="role-badge">Customer, Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Create Razorpay payment order for an invoice</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "invoice_id": "inv_1101",\n  "amount": 6390.0,\n  "currency": "INR"\n}</pre></div>
          <div class="detail-group"><div class="detail-label">Success Response (201 Created)</div><pre>{\n  "success": true,\n  "order_id": "order_TYHNGvqLdMAi8I",\n  "razorpay_order_id": "order_TYHNGvqLdMAi8I",\n  "amount": 6390.0,\n  "currency": "INR",\n  "key_id": "rzp_test_ZFxDYdxbnGTEtC"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/payments/verify razorpay hmac signature verify">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/payments/verify</span>
            <span class="role-badge">Customer, Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Verify Razorpay HMAC signature and set invoice status to PAID</div>
        </div>
        <div class="endpoint-body">
          <div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "invoice_id": "inv_1101",\n  "razorpay_order_id": "order_TYHNGvqLdMAi8I",\n  "razorpay_payment_id": "pay_rzp_998877",\n  "razorpay_signature": "hmac_sha256_signature"\n}</pre></div>
        </div>
      </div>

      <div class="endpoint-card" data-search="post /api/payments/webhook razorpay async notification">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/payments/webhook</span>
            <span class="role-badge">Public / Gateway</span>
          </div>
          <div class="endpoint-desc">Receive asynchronous Razorpay webhook notifications ('payment.captured')</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "status": "ok",\n  "received": true\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/payments list payment transactions">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/payments</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">List all payment transactions</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/payments/:id payment transaction detail">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/payments/:id</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Get transaction details for a specific payment ID</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/payments/:id/status check payment status">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/payments/:id/status</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Check status of payment (created, completed, failed, refunded)</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Success Response (200 OK)</div><pre>{\n  "id": "pay_101",\n  "invoice_id": "inv_1101",\n  "status": "completed",\n  "amount": 6390.0\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/payments/:id/refund initiate refund finance">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/payments/:id/refund</span>
            <span class="role-badge">Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Initiate Razorpay refund for a completed payment</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "amount": 6390.0,\n  "reason": "Customer requested cancellation"\n}</pre></div></div>
      </div>
    </div>

    <!-- 19. Analytics, Audit & Interactive Channels (audit_logs Table) -->
    <div class="module-section">
      <div class="module-title">
        <span>19. Analytics, Audit & Channels (audit_logs Table)</span>
        <span class="count-badge">9 Endpoints</span>
      </div>

      <div class="endpoint-card" data-search="get /api/dashboard/summary analytics kpi">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/dashboard/summary</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Get executive dashboard KPIs, pipeline volume, and risk summary</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/reports/sales export reports analytics">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/reports/sales</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Generate sales operations performance reports</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/deal-health/alerts deal health margin risks">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/deal-health/alerts</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Retrieve deal health risk alerts and low-margin warnings</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/discount-history discount history audit">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/discount-history</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Retrieve historical record of approved and rejected discount overrides</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/whatsapp/menu interactive whatsapp menu">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/whatsapp/menu</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Get interactive WhatsApp messaging menu tree</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/whatsapp/interact submit whatsapp response">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/whatsapp/interact</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">Submit user response for WhatsApp interactive bot session</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "selectedOption": "check_status",\n  "quotationId": "1101"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="post /api/email/send-quotation email quotation pdf">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-post">POST</span>
            <span class="endpoint-path">/api/email/send-quotation</span>
            <span class="role-badge">Sales Rep, Manager, Finance, Admin</span>
          </div>
          <div class="endpoint-desc">Send formal quotation document to customer email</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Request Body (JSON)</div><pre>{\n  "quotationId": "1101",\n  "recipientEmail": "client@example.com"\n}</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/notifications user alerts notifications">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/notifications</span>
            <span class="role-badge">All Authenticated Roles</span>
          </div>
          <div class="endpoint-desc">List pending system notifications for current user</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>

      <div class="endpoint-card" data-search="get /api/audit audit logs security trail">
        <div class="endpoint-header" onclick="toggleCard(this)">
          <div class="endpoint-left">
            <span class="badge badge-get">GET</span>
            <span class="endpoint-path">/api/audit</span>
            <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
          </div>
          <div class="endpoint-desc">Retrieve application security and activity audit logs</div>
        </div>
        <div class="endpoint-body"><div class="detail-group"><div class="detail-label">Headers</div><pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre></div></div>
      </div>
    </div>

    <footer>
      DealFlow360 B2B Sales Operations Platform API &bull; Node.js Express 5.x Backend &bull; Table & Module Divided Specifications
    </footer>
  </div>

  <script>
    function toggleCard(headerEl) {
      const bodyEl = headerEl.nextElementSibling;
      bodyEl.classList.toggle('open');
    }

    function expandAllCards() {
      const bodies = document.querySelectorAll('.endpoint-body');
      bodies.forEach(body => body.classList.add('open'));
    }

    function collapseAllCards() {
      const bodies = document.querySelectorAll('.endpoint-body');
      bodies.forEach(body => body.classList.remove('open'));
    }

    function filterEndpoints() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const moduleSections = document.querySelectorAll('.module-section');

      moduleSections.forEach(section => {
        const cards = section.querySelectorAll('.endpoint-card');
        let sectionMatchCount = 0;

        cards.forEach((card) => {
          const searchData = card.getAttribute('data-search').toLowerCase();
          if (searchData.includes(query)) {
            card.style.display = 'block';
            sectionMatchCount++;
          } else {
            card.style.display = 'none';
          }
        });

        if (sectionMatchCount === 0 && query !== '') {
          section.style.display = 'none';
        } else {
          section.style.display = 'block';
        }
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { getDocsHtml };
