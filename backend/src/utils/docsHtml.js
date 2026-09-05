/**
 * Clean Basic UI HTML API Documentation Generator (No Icons)
 * Complete Detailed Specification for all 30+ DealFlow360 REST APIs
 */
function getDocsHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DealFlow360 - Complete API Reference</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #475569;
      --border-color: #e2e8f0;
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
      max-width: 1240px;
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

    .section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: monospace;
      font-size: 14px;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 54px;
      text-align: center;
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
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
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

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 8px;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      font-weight: 600;
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
      <h1>DealFlow360 Complete API Reference Documentation</h1>
      <p class="subtitle">Detailed Specification of All REST API Endpoints & Self-Governing Engines</p>
      
      <div class="meta-grid">
        <div class="meta-item">
          <label>Base API Namespace</label>
          <span>/api</span>
        </div>
        <div class="meta-item">
          <label>Authentication</label>
          <span>JWT Bearer Token (Header: Authorization)</span>
        </div>
        <div class="meta-item">
          <label>CORS Policy Origin</label>
          <span>FRONTEND_URL (http://localhost:5173)</span>
        </div>
        <div class="meta-item">
          <label>Environment / Port</label>
          <span>dev (Port 5000)</span>
        </div>
      </div>
    </header>

    <div class="controls">
      <input type="text" id="searchInput" placeholder="Search by endpoint path, method, role, or feature (e.g. /payments, /users, razorpay, risk, approval)..." onkeyup="filterEndpoints()">
    </div>

    <!-- Core Business Logic Engines Table -->
    <div class="section">
      <div class="section-title">Self-Governing Core Engines</div>
      <table>
        <thead>
          <tr>
            <th>Engine Name</th>
            <th>File Location</th>
            <th>Primary Function & Rules</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Blended Risk Score Engine</td>
            <td>src/service/riskScoreEngine.js</td>
            <td>Calculates line & order discount excess over tier/category ceilings. Determines auto-approval vs dual approval routing chains.</td>
          </tr>
          <tr>
            <td>Live Upsell Engine</td>
            <td>src/service/upsellEngine.js</td>
            <td>Evaluates cart co-purchases & promotions; computes rank scores with live margin delta preview.</td>
          </tr>
          <tr>
            <td>Multi-Warehouse Split Engine</td>
            <td>src/service/fulfillmentEngine.js</td>
            <td>Greedily allocates inventory across depots sorted by shipping cost weight; computes backorders and split shipments.</td>
          </tr>
          <tr>
            <td>Hybrid Billing Engine</td>
            <td>src/service/billingEngine.js</td>
            <td>Separates hardware from recurring subscriptions; computes mid-cycle proration & issues credit notes.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Complete Endpoints Reference Container -->
    <div class="section">
      <div class="section-title">
        <span>Complete REST API Endpoints List</span>
        <button onclick="toggleAllCards()" style="font-size:12px; padding:4px 10px; cursor:pointer; background:#e2e8f0; border:none; border-radius:4px; font-weight:600;">Toggle Expand All</button>
      </div>
      
      <div id="endpointsContainer">

        <!-- 0. System Health & Ping Module -->
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
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "status": "healthy",\n  "service": "dealflow360",\n  "environment": "dev",\n  "uptime_seconds": 184,\n  "timestamp": "2026-09-05T08:06:39.311Z",\n  "database": {\n    "status": "connected",\n    "engine": "postgresql"\n  },\n  "memory": {\n    "heapUsed": "17.58 MB",\n    "heapTotal": "33.01 MB",\n    "rss": "71.86 MB"\n  }\n}</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>pong (DealFlow360)</pre>
            </div>
          </div>
        </div>

        <!-- 1. Authentication Module -->
        <div class="endpoint-card" data-search="post /api/auth/login authentication login magic link password">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/auth/login</span>
              <span class="role-badge">Public</span>
            </div>
            <div class="endpoint-desc">Authenticate user credentials or magic token; returns JWT token & user info</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "email": "baraiyavishalbhai32@gmail.com",\n  "password": "password123"\n}</pre>
            </div>
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": {\n    "id": "101",\n    "full_name": "Sales Representative",\n    "email": "baraiyavishalbhai32@gmail.com",\n    "role": "sales_rep"\n  }\n}</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="get /api/auth/me profile user info authentication">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/auth/me</span>
              <span class="role-badge">All Authenticated</span>
            </div>
            <div class="endpoint-desc">Retrieve profile information of currently authenticated user</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="post /api/auth/logout authentication clear cookie">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/auth/logout</span>
              <span class="role-badge">All Authenticated</span>
            </div>
            <div class="endpoint-desc">Log out user and clear auth session cookie</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "message": "Successfully logged out."\n}</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "email": "baraiyavishalbhai32@gmail.com"\n}</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="post /api/auth/reset-password new password token">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/auth/reset-password</span>
              <span class="role-badge">Public</span>
            </div>
            <div class="endpoint-desc">Reset password using token</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "token": "reset_1772870400000_abc123",\n  "newPassword": "newPassword123"\n}</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "email": "mayankpathar49@gmail.com"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 2. Users Management Module -->
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
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "101", "full_name": "Sales Representative", "role": "sales_rep", "email": "..." },\n  { "id": "102", "full_name": "Sales Manager", "role": "sales_manager", "email": "..." }\n]</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "full_name": "John Doe",\n  "email": "john@example.com",\n  "role": "sales_rep",\n  "password": "password123"\n}</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "message": "User deleted successfully",\n  "id": "104"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 3. Customers Directory Module -->
        <div class="endpoint-card" data-search="get /api/customers list customers customer directory">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/customers</span>
              <span class="role-badge">Admin, Manager, Finance, Sales Rep</span>
            </div>
            <div class="endpoint-desc">List customer accounts, assigned tiers, and GSTIN numbers</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "301", "company_name": "Acme Corporation", "tier_id": "203", "tier_name": "Gold Tier" }\n]</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="post /api/customers add customer company">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/customers</span>
              <span class="role-badge">Admin, Manager, Finance, Sales Rep</span>
            </div>
            <div class="endpoint-desc">Create new customer account record</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "company_name": "Acme Corp",\n  "contact_person": "John Smith",\n  "email": "john@acme.com",\n  "phone_number": "+919876543210",\n  "tier_id": "203"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 4. Customer Tiers Module -->
        <div class="endpoint-card" data-search="get /api/customer-tiers tiers ceiling discount">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/customer-tiers</span>
              <span class="role-badge">All Authenticated Roles</span>
            </div>
            <div class="endpoint-desc">List customer tiers and maximum allowed discount ceilings</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "201", "tier_code": "bronze", "name": "Bronze Tier", "discount_ceiling_pct": 5.0 },\n  { "id": "202", "tier_code": "silver", "name": "Silver Tier", "discount_ceiling_pct": 10.0 },\n  { "id": "203", "tier_code": "gold", "name": "Gold Tier", "discount_ceiling_pct": 15.0 },\n  { "id": "204", "tier_code": "platinum", "name": "Platinum Tier", "discount_ceiling_pct": 25.0 }\n]</pre>
            </div>
          </div>
        </div>

        <!-- 5. Catalog & Pricing Module -->
        <div class="endpoint-card" data-search="get /api/categories product categories catalog">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/categories</span>
              <span class="role-badge">All Authenticated Roles</span>
            </div>
            <div class="endpoint-desc">List product categories (hardware, service, subscription)</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "401", "name": "Hardware", "category_type": "hardware", "discount_ceiling_pct": 15.0 },\n  { "id": "402", "name": "Services", "category_type": "service", "discount_ceiling_pct": 10.0 }\n]</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="get /api/products catalog items price sku">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/products</span>
              <span class="role-badge">All Authenticated Roles</span>
            </div>
            <div class="endpoint-desc">List products catalog with pricing, cost, and stock quantities</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "501", "sku": "HW-SRV-01", "name": "Enterprise Server X", "base_price": 1000.0, "cost_price": 700.0 }\n]</pre>
            </div>
          </div>
        </div>

        <!-- 6. Discount Governance Rules Module -->
        <div class="endpoint-card" data-search="get /api/discount/rules discount ceilings policy">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/discount/rules</span>
              <span class="role-badge">All Authenticated Roles</span>
            </div>
            <div class="endpoint-desc">List active category & tier discount governance rules</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "disc_101", "name": "Hardware Max Discount", "category_type": "hardware", "max_discount_pct": 15.0 }\n]</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="post /api/discount/rules create discount rule admin finance">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/discount/rules</span>
              <span class="role-badge">Admin, Finance Ops</span>
            </div>
            <div class="endpoint-desc">Create discount cap rule for governance engine</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "rule_name": "SaaS Subscription Discount Cap",\n  "category_type": "subscription",\n  "max_discount_pct": 20.0\n}</pre>
            </div>
          </div>
        </div>

        <!-- 7. Quotations & Risk Pre-flight Engine -->
        <div class="endpoint-card" data-search="get /api/quotations list quotes sales">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/quotations</span>
              <span class="role-badge">All Authenticated Roles</span>
            </div>
            <div class="endpoint-desc">List all sales quotes and current approval status</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>[\n  { "id": "1101", "quote_number": "QT-2026-001", "total_amount": 6390.0, "status": "pending_approval" }\n]</pre>
            </div>
          </div>
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "customer_id": "301",\n  "customer_tier_code": "gold",\n  "order_discount_pct": 2.0,\n  "line_items": [\n    {\n      "product_id": "501",\n      "category_type": "hardware",\n      "quantity": 5,\n      "unit_price": 1000.0,\n      "cost_price": 700.0,\n      "discount_pct": 12.0\n    }\n  ]\n}</pre>
            </div>
            <div class="detail-group">
              <div class="detail-label">Success Response (201 Created)</div>
              <pre>{\n  "id": "1102",\n  "quote_number": "QT-2026-002",\n  "blended_risk_score": 21.87,\n  "status": "pending_approval",\n  "requires_approval": true,\n  "approval_levels": ["sales_manager", "finance_ops"],\n  "total_amount": 6390.0,\n  "overall_margin_pct": 33.33\n}</pre>
            </div>
          </div>
        </div>

        <!-- 8. Multi-Tier Approvals Module -->
        <div class="endpoint-card" data-search="get /api/approvals/pending pending risk quotes">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/approvals/pending</span>
              <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
            </div>
            <div class="endpoint-desc">List quotations awaiting Manager or Finance approval</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "comments": "Approved based on deal volume"\n}</pre>
            </div>
          </div>
        </div>

        <div class="endpoint-card" data-search="post /api/approvals/:id/reject reject quote">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/approvals/:id/reject</span>
              <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
            </div>
            <div class="endpoint-desc">Reject quotation and record reason</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "reason": "Margin below minimum threshold"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 9. Customer Portal Negotiation Module -->
        <div class="endpoint-card" data-search="post /api/negotiations/:quoteId/counter customer counter offer">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-post">POST</span>
              <span class="endpoint-path">/api/negotiations/:quoteId/counter</span>
              <span class="role-badge">Customer, Sales Rep, Manager, Finance, Admin</span>
            </div>
            <div class="endpoint-desc">Submit customer counter-discount proposal and trigger risk re-evaluation</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "proposed_discount_pct": 14.0,\n  "customer_comments": "Can you match 14% for 2-year commitment?"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 10. Live Upsell Engine Module -->
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "current_cart_lines": [\n    { "productId": "501", "quantity": 5, "unitPrice": 1000, "costPrice": 700 }\n  ]\n}</pre>
            </div>
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "currentMarginPct": 33.33,\n  "suggestions": [\n    {\n      "productId": "601",\n      "productName": "Cloud SaaS Subscription",\n      "price": 500,\n      "marginDeltaPct": 4.17,\n      "isMarginPositive": true,\n      "rankScore": 2.4\n    }\n  ]\n}</pre>
            </div>
          </div>
        </div>

        <!-- 11. Multi-Warehouse & Fulfillment Engine -->
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
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "status": "fulfilled",\n  "totalShipmentCount": 2,\n  "totalEstimatedShipmentCost": 90.0,\n  "fulfillmentSplits": [\n    { "warehouseName": "Main Central Warehouse", "quantityFulfilled": 5 },\n    { "warehouseName": "East Coast Depot", "quantityFulfilled": 2 }\n  ]\n}</pre>
            </div>
          </div>
        </div>

        <!-- 12. Payment Gateway Module (Razorpay) -->
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "invoice_id": "inv_1101",\n  "amount": 6390.0,\n  "currency": "INR"\n}</pre>
            </div>
            <div class="detail-group">
              <div class="detail-label">Success Response (201 Created)</div>
              <pre>{\n  "success": true,\n  "order_id": "order_TYHNGvqLdMAi8I",\n  "razorpay_order_id": "order_TYHNGvqLdMAi8I",\n  "amount": 6390.0,\n  "currency": "INR",\n  "key_id": "rzp_test_ZFxDYdxbnGTEtC"\n}</pre>
            </div>
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
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "invoice_id": "inv_1101",\n  "razorpay_order_id": "order_TYHNGvqLdMAi8I",\n  "razorpay_payment_id": "pay_rzp_998877",\n  "razorpay_signature": "hmac_sha256_signature"\n}</pre>
            </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "status": "ok",\n  "received": true\n}</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Success Response (200 OK)</div>
              <pre>{\n  "id": "pay_101",\n  "invoice_id": "inv_1101",\n  "status": "completed",\n  "amount": 6390.0\n}</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Request Body (JSON)</div>
              <pre>{\n  "amount": 6390.0,\n  "reason": "Customer requested cancellation"\n}</pre>
            </div>
          </div>
        </div>

        <!-- 13. Analytics & Dashboard Module -->
        <div class="endpoint-card" data-search="get /api/dashboard/summary analytics kpi">
          <div class="endpoint-header" onclick="toggleCard(this)">
            <div class="endpoint-left">
              <span class="badge badge-get">GET</span>
              <span class="endpoint-path">/api/dashboard/summary</span>
              <span class="role-badge">Sales Manager, Finance Ops, Admin</span>
            </div>
            <div class="endpoint-desc">Get executive dashboard KPIs, pipeline volume, and risk summary</div>
          </div>
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
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
          <div class="endpoint-body">
            <div class="detail-group">
              <div class="detail-label">Headers</div>
              <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
            </div>
          </div>
        </div>

      </div>
    </div>

    <footer>
      DealFlow360 B2B Sales Operations Platform API &bull; Node.js Express 5.x Backend
    </footer>
  </div>

  <script>
    function toggleCard(headerEl) {
      const bodyEl = headerEl.nextElementSibling;
      bodyEl.classList.toggle('open');
    }

    function toggleAllCards() {
      const bodies = document.querySelectorAll('.endpoint-body');
      const anyClosed = Array.from(bodies).some(b => !b.classList.contains('open'));
      bodies.forEach(b => {
        if (anyClosed) b.classList.add('open');
        else b.classList.remove('open');
      });
    }

    function filterEndpoints() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.endpoint-card');
      
      cards.forEach(card => {
        const searchData = card.getAttribute('data-search').toLowerCase();
        if (searchData.includes(query)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { getDocsHtml };
