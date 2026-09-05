# DealFlow360 - Frontend Application

DealFlow360 is a modern, end-to-end deal management and quotation automation platform built for high-growth sales, fulfillment, and billing workflows. Developed as part of the Odoo Hackathon (Team 561), this application streamlines quote creation, dynamic multi-tier approval chains, split-warehouse fulfillment, subscription billing, deal health analytics, and client portal interactions.

---

## 🚀 Features

### 1. 📊 Interactive Dashboard
- High-level sales performance metrics (ARR/MRR, deal volume, pipeline value).
- Quick alerts for pending approvals, fulfillment bottlenecks, and contract renewals.
- Interactive charts and deal breakdown cards.

### 2. 📝 Quotation Builder & Management
- Dynamic line item configuration (Recurring Subscriptions & One-time Products).
- Automated discount threshold checks and tax calculations.
- Multi-warehouse inventory split allocation.
- Direct link generation for Customer Portal approval.

### 3. 🛡️ Dynamic Approval Chains
- Automated multi-level approval routing based on discount percentages, deal size, and custom payment terms.
- Real-time approval history and visual audit trail for compliance.

### 4. 📦 Warehouse & Fulfillment Logistics
- Multi-location warehouse split handling (e.g., Main Warehouse vs. Regional Hubs).
- Delivery status tracking (Pending, In Progress, Partially Fulfilled, Shipped).
- Direct inventory sync and stock level warnings.

### 5. 🔄 Subscriptions & Billing Engine
- Recurring revenue models (Monthly, Quarterly, Annual billing cycles).
- Billing schedule tracking, payment milestone breakdowns, and contract auto-renewals.
- Smart upsell panels and contract add-on recommendations.

### 6. 💳 Invoicing & Payment Tracking
- Complete invoicing lifecycle (Draft, Sent, Paid, Partial, Overdue).
- Detailed line-item breakdown with tax summaries.

### 7. 🩺 Deal Health & Blended Risk Scoring
- AI-driven blended risk score evaluating discount severity, payment term risks, and inventory constraints.
- Margin health badges and risk mitigation recommendations.

### 8. 📈 Analytics & Reports
- Advanced reporting for sales conversion rates, approval cycle velocity, margin distributions, and product popularity.

### 9. 🌐 External Customer Portal
- Seamless client-facing portal (`/portal/:quoteId`) allowing customers to review quotations, inspect line items, sign online, and approve proposals directly.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📁 Directory Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/              # Static assets and media
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Atomic components (Button, Input, Card, Table, Badge, Modal, etc.)
│   │   ├── layout/          # Page layouts, TopBar, Sidebar, CustomerPortalLayout
│   │   └── special/         # Specialized widgets (ApprovalChain, AuditTrail, BlendedRiskScore, UpsellPanel, WarehouseSplit)
│   ├── context/             # Global React Contexts (AuthContext, DataContext)
│   ├── data/                # Mock data fallback (mockData.js)
│   ├── pages/               # Application view components (Dashboard, Quotations, Approvals, Invoices, etc.)
│   ├── services/            # API integration modules (api.js, auth.js, quotations.js, etc.)
│   ├── utils/               # Helper utilities and formatters
│   ├── App.jsx              # Application routing & layout definition
│   ├── index.css            # Tailwind CSS imports & global styles
│   └── main.jsx             # React entry point
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed on your system.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Backend Endpoint (Optional)

By default, API calls are configured in [`src/services/api.js`](file:///d:/odoo-hackathon-team-561/frontend/src/services/api.js):

```javascript
baseURL: 'http://192.168.9.168:5000'
```

If the backend server is unavailable, the application gracefully utilizes mock data stored in `src/data/mockData.js`.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

The compiled assets will be generated in the `dist/` directory.

---

## 🔑 Available Routes

| Path | Access Level | Description |
| :--- | :--- | :--- |
| `/login` | Public | Authentication / User Login page |
| `/` | Protected | Executive Dashboard & KPIs |
| `/quotations` | Protected | List of all quotations |
| `/quotations/new` | Protected | Quotation Builder (Create quote) |
| `/quotations/:id` | Protected | Edit / View quotation details |
| `/approvals` | Protected | Pending deal approvals list |
| `/approvals/:id` | Protected | Detailed approval decision page |
| `/fulfillment` | Protected | Orders fulfillment & shipment status |
| `/fulfillment/:id` | Protected | Warehouse split allocation & delivery details |
| `/subscriptions` | Protected | Active subscription contracts |
| `/subscriptions/:id` | Protected | Billing details & schedule |
| `/invoices` | Protected | Invoices listing |
| `/invoices/:id` | Protected | Invoice breakdown & payment status |
| `/deal-health` | Protected | Deal risk score analysis |
| `/reports` | Protected | Reports & revenue analytics |
| `/products` | Protected | Product catalog & stock |
| `/portal/:quoteId` | Public (Token/ID) | External Customer Portal for client approval |

---

## 📜 License

Created for **Odoo Hackathon - Team 561**. All rights reserved.
