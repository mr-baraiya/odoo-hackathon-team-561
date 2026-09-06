# DealFlow360 — Complete Environment Setup Guide

This guide provides step-by-step instructions for configuring and running both the **Backend API Server** and the **Frontend Web Application** for DealFlow360.

---

## 1. Backend Environment Setup (`backend/.env`)

### Step 1: Create the `.env` File
In the `backend/` directory, create a `.env` file by copying the template:

```bash
cd backend
cp .env.example .env
```

### Step 2: Configure Environment Variables

Open `backend/.env` and update the values according to your environment:

```ini
# Environment Mode & Server Port
NODE_ENV=dev
SERVICE_NAME=dealflow360
SERVER_PORT=5000

# Security Credentials
JWT_SECRET=your_jwt_secret_key_here

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dealflow360
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DATABASE_URL="postgres://postgres:your_postgres_password_here@localhost:5432/dealflow360?sslmode=disable"

# Application Logging
CONSOLE_LOG_LEVEL=info
FILE_LOG_LEVEL=false

# External Integrations & Messaging
WHATSAPP_SERVICE=false

# SMTP Email Configuration
EMAIL_ID=your_email@example.com
EMAIL_PASSWORD=your_email_app_password_here
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WHATSAPP_JOIN_MESSAGE=join stand-exclaimed
TWILIO_WHATSAPP_SANDBOX_NUMBER=+1 415 523 8886

# CORS Origin Allowed
FRONTEND_URL=http://localhost:5173

# Razorpay Payment Gateway Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### Step 3: Install & Start Backend

```bash
# Install node dependencies
npm install

# Apply Database Migrations (via dbmate or postgres seed)
npm run db:up

# Start Development Server (runs on http://localhost:5000)
npm run dev
```

---

## 2. Frontend Environment Setup (`frontend/.env`)

### Step 1: Create the `.env` File
In the `frontend/` directory, create a `.env` file by copying the template:

```bash
cd frontend
cp .env.example .env
```

### Step 2: Configure Environment Variables

Open `frontend/.env` and ensure the values point to your backend server:

```ini
# Backend API Base URL
VITE_SERVER_URL="http://localhost:5000/api"

# WhatsApp Service Base URL
VITE_WHATSAPP_SERVER_URL="http://localhost:5000/api"

# Razorpay Key ID (Optional client override)
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id_here"
```

### Step 3: Install & Start Frontend

```bash
# Install node dependencies
npm install --legacy-peer-deps

# Start Vite Development Server (runs on http://localhost:5173)
npm run dev
```

---

## 3. Quick Reference Matrix

| Variable | Environment | Description | Placeholder / Example |
| :--- | :--- | :--- | :--- |
| `SERVER_PORT` | Backend | Port number for Express server | `5000` |
| `DATABASE_URL` | Backend | PostgreSQL connection URL | `postgres://postgres:your_password@localhost:5432/dealflow360?sslmode=disable` |
| `JWT_SECRET` | Backend | Secret key for signing JWT tokens | `your_jwt_secret_key_here` |
| `RAZORPAY_KEY_ID` | Backend | Razorpay API Key ID | `your_razorpay_key_id_here` |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay API Secret Key | `your_razorpay_key_secret_here` |
| `FRONTEND_URL` | Backend | Allowed CORS client origin | `http://localhost:5173` |
| `VITE_SERVER_URL` | Frontend | Backend API endpoint for Axios | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | Frontend | Razorpay Key ID for Checkout SDK | `your_razorpay_key_id_here` |

---

## 4. Security Checklist

> [!CAUTION]
> - Never commit real `.env` files or API secrets into git repositories.
> - Ensure `.env` is listed in your `.gitignore` file.
> - Use `.env.example` templates with sanitized dummy placeholders when sharing code.
