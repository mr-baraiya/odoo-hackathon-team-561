# DealFlow360 — Backend API Service

DealFlow360 is an intelligent, self-governing B2B sales operations platform backend API built with Node.js and Express.js. It features automated discount governance, blended risk scoring, multi-tier approval routing, greedy multi-warehouse fulfillment splitting, hybrid billing schedules, live upsell engines, and integrated Razorpay payment processing.

---

## Technical Stack & Architecture

- Runtime: Node.js (v18+)
- Framework: Express.js (v5.x)
- Database: PostgreSQL (v14+) with connection pooling (`pg`)
- Migration Tool: Dbmate (`dbmate`)
- Authentication: JSON Web Tokens (`jsonwebtoken`) & HTTP Bearer strategy
- Validation: Joi schema validation
- Logger: Winston structured logging with console and file transports
- Real-time Communications: Socket.IO
- Payment Gateway: Razorpay SDK integration (`razorpay`)
- Code Style: Airbnb Base JavaScript style guide

---

## Directory Structure

```text
backend/
├── db/                     # Database migrations, seed scripts & SQL schemas
│   └── migrations/         # Dbmate SQL migration files
├── src/                    # Source code
│   ├── config/             # Environment configs, constants, error dictionaries
│   │   ├── constant.js     # Storage paths & system constants
│   │   ├── env.js          # Dotenv loader & Joi schema validation
│   │   ├── errorCode.js    # Standardized HTTP & Postgres error code mappings
│   │   └── var.js          # Application variable exports
│   ├── db/                 # Seed data store & migration references
│   ├── middleware/         # Essential Express middleware
│   │   ├── auth.middleware.js # JWT verification & role authorization (RBAC)
│   │   ├── errorHandler.js # Global error handler middleware
│   │   └── requestId.js    # Request tracing ID generator
│   ├── routes/             # Modular API route controllers
│   │   ├── app.route.js    # Main router mounting all module routes
│   │   ├── auth.route.js   # Login, logout, profile & password reset
│   │   ├── payments.route.js # Payment gateway APIs (create-order, verify, webhook, refund)
│   │   └── ... (24 modular route files)
│   ├── service/            # Core business logic engines & background services
│   │   ├── billingEngine.js    # Hybrid billing & mid-cycle proration engine
│   │   ├── fulfillmentEngine.js# Multi-warehouse stock splitting & backorders engine
│   │   ├── riskScoreEngine.js  # Blended risk score calculation & approval routing
│   │   ├── upsellEngine.js     # Live upsell recommendations & margin delta preview
│   │   ├── database/       # PostgreSQL pool connection helper
│   │   ├── fileStorage/    # Local disk storage utility
│   │   ├── logger/         # Winston logger configuration
│   │   └── socket/         # Socket.IO connection handlers
│   ├── types/              # Global JSDoc type definitions for IDE intellisense
│   ├── utils/              # Utility helpers (JWT, error formatting, phone/currency formatters)
│   ├── app.js              # Express application configuration
│   └── index.js            # Server entry point
├── .env                    # Active local environment variables
├── .env.example            # Template environment variables
└── package.json            # Dependencies and npm scripts
```

---

## Environment Setup

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Server Configuration
NODE_ENV = dev
SERVICE_NAME = dealflow360
SERVER_PORT = 5000

# Authentication
JWT_SECRET = dealflow360_super_secret_jwt_key_2026

# PostgreSQL Database Configuration
DB_HOST = localhost
DB_PORT = 5432
DB_NAME = dealflow360
DB_USER = postgres
DB_PASSWORD = postgres
DATABASE_URL = "postgres://postgres:postgres@localhost:5432/dealflow360?sslmode=disable"

# Logger Configuration
CONSOLE_LOG_LEVEL = info
FILE_LOG_LEVEL = false

# Twilio / WhatsApp Configuration
TWILIO_ACCOUNT_SID = your_twilio_account_sid
TWILIO_AUTH_TOKEN = your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER = whatsapp:+14155238886

# Razorpay Configuration
RAZORPAY_KEY_ID = rzp_test_ZFxDYdxbnGTEtC
RAZORPAY_KEY_SECRET = Gkmmmqm0L3trSvm4KwLMGoen
```

---

## Installation & Local Execution

1. Install Dependencies:
```bash
npm install
```

2. Run Database Migrations:
```bash
npm run dbmate
```

3. Start Development Server (Hot Reload):
```bash
npm run dev
```

4. Start Production Server:
```bash
npm start
```

---

## Security & Role-Based Access Control (RBAC)

The backend enforces strict JWT authentication (`authenticateJWT`) and role-based permissions (`authorizeRoles`). Unauthenticated requests return HTTP 401, while unauthorized access attempts return HTTP 403.

### Supported System Roles
- admin: System-wide administrative access.
- sales_manager: Team management, quotation approvals, discount overrides, sales reports.
- finance_ops: Financial approvals, billing, invoices, credit notes, payment refunds.
- sales_rep: Quotation creation, line item drafting, customer directory lookup.
- customer: Portal viewing, counter-negotiations, payment execution.

---

## Test Verification Suites

Run the automated test suites from the backend directory:

- Core Business Logic Suite:
```bash
npm test
```

- Security & RBAC Guard Suite:
```bash
node ../scripts/verify_security_rbac.js
```

- Complete 30-Module REST API Suite:
```bash
node ../scripts/verify_api_suite.js
```

- Payment Gateway Test Suite:
```bash
node ../scripts/verify_payment_gateway.js
```

---

## API Documentation

For full endpoint schemas, request bodies, query parameters, and response payloads, refer to the frontend developer guide:

`../docs/frontend_api_guide.md`
