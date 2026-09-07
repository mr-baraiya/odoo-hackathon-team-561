# DealFlow360 — Vercel Multi-Service Monorepo Deployment Guide

This guide details how to deploy **DealFlow360** on Vercel using Vercel's unified Monorepo Multi-Service architecture.

---

## 1. Root `vercel.json` Multi-Service Configuration

The root directory contains [vercel.json](file:///d:/VS_CODES/Projects/odoo-hackathon-team-561/vercel.json) configuring both `frontend` (Vite) and `backend` (Express) services in a single repository import:

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    },
    "backend": {
      "root": "backend"
    }
  },
  "rewrites": [
    {
      "source": "/api(/.*)?",
      "destination": {
        "type": "service",
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "type": "service",
        "service": "frontend"
      }
    }
  ]
}
```

---

## 2. Deploying on Vercel Dashboard

1. Import your GitHub repository (`mr-baraiya/odoo-hackathon-team-561`) in Vercel.
2. Vercel will automatically detect the root `vercel.json` and configure both `frontend` (Vite) and `backend` (Express) services.
3. Under **Environment Variables**, configure the backend secrets:
   ```env
   NODE_ENV=prod
   JWT_SECRET=your_secure_jwt_secret_key_2026
   DATABASE_URL=postgres://user:password@your-pg-host:5432/dealflow360?sslmode=require
   DB_HOST=your-pg-host
   DB_PORT=5432
   DB_NAME=dealflow360
   DB_USER=user
   DB_PASSWORD=password
   EMAIL_ID=vvbaraiya32@gmail.com
   EMAIL_PASSWORD=pvjz zcsd tvsg kqdx
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   ```
4. Under **Frontend Environment Variables**, configure:
   ```env
   VITE_SERVER_URL=/api
   VITE_WHATSAPP_SERVER_URL=/api
   VITE_RAZORPAY_KEY_ID=rzp_test_ZFxDYdxbnGTEtC
   ```
5. Click **Deploy**.

---

## 3. Benefits of Multi-Service Routing
- **Unified Domain**: Both API requests (`/api/*`) and SPA pages (`/*`) run under the same domain, eliminating cross-origin cookie restrictions and complex CORS configurations.
- **Zero Proxy Overhead**: Built-in Vercel Edge rewriting routes backend traffic straight to the serverless function `backend/api/index.js`.
