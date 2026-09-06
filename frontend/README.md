# DealFlow360 — Frontend Application

DealFlow360 Frontend is an enterprise B2B Sales Operations web workspace built with React 19, Vite, Tailwind CSS, and TanStack React Query. It provides interactive quotation drafting, real-time blended risk score computation, live margin impact previews, multi-warehouse fulfillment allocation visualizers, customer negotiation portals, and Razorpay payment checkout integration.

---

## Core Capabilities

- Quotation Management & Real-Time Risk Governance: Line-item quotation drafting with live risk score calculation, approval warnings, and tier ceiling checks.
- Live Margin & Upsell Engine: Real-time margin delta previews and co-purchase recommendation cards.
- Interactive Customer Portal: Enables customers to review quotations, submit counter-discount proposals, and trigger real-time risk re-evaluations.
- Multi-Warehouse Fulfillment View: Visual representation of stock allocation splits across distribution depots and backorder tracking.
- Razorpay Payment Gateway Checkout: Integrated payment order creation, HMAC signature verification, and instant invoice status updates.
- Role-Based Dynamic UI: Dedicated view layouts and permission guards tailored to system roles (`admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`).

---

## Technical Stack

- Library: React 19
- Build Tool: Vite
- Styling: Tailwind CSS
- Data Fetching & State: TanStack React Query v5
- Router: React Router v7
- Form Management: React Hook Form & Zod Schema Validation
- UI Components: Radix UI Primitives & Shadcn UI Components
- Icons: Lucide React

---

## Workspace Structure

```text
frontend/
├── public/                 # Static public assets
├── src/                    # Source code directory
│   ├── assets/             # Images, graphics, and stylesheets
│   ├── components/         # Reusable UI components & modal dialogs
│   │   ├── ui/             # Standard Shadcn UI primitive components
│   │   ├── QuoteBuilder.jsx# Dynamic line-item quote composition workspace
│   │   ├── RiskBadge.jsx   # Blended risk score indicator
│   │   └── PaymentModal.jsx# Razorpay checkout wrapper
│   ├── hooks/              # Custom React hooks (auth, API, web sockets)
│   ├── pages/              # Primary route views (Dashboard, Quotes, Invoices, Portal)
│   ├── services/           # REST API client endpoints & fetch helpers
│   ├── types/              # TypeScript interface definitions
│   ├── utils/              # Helper utilities (currency formatters, calculations)
│   ├── App.jsx             # Main application component and routing configuration
│   └── main.jsx            # Application entry point
├── .env.example            # Environment configuration template
├── package.json            # Node.js project manifest & scripts
└── vite.config.ts          # Vite build configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Installation & Local Execution

1. Install project dependencies:

```bash
npm install
```

2. Start the local development server with hot module replacement:

```bash
npm run dev
```

The application will launch at `http://localhost:5173`.

### Production Build

1. Compile production assets:

```bash
npm run build
```

2. Preview the production build locally:

```bash
npm run preview
```

3. Run code quality linter:

```bash
npm run lint
```

---

## Integration with Backend Service

The frontend communicates with the DealFlow360 REST API service (`http://localhost:5000/api`) using JSON Web Tokens (JWT) for authentication.

For endpoint schemas, payload formats, and integration details, consult:

`../docs/frontend_api_guide.md`
