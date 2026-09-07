# DealFlow360 — 2 Separate Vercel Projects Deployment Guide

This guide details how to deploy **DealFlow360** on Vercel as **two completely separate projects** from the same GitHub repository (`mr-baraiya/odoo-hackathon-team-561`).

---

## 1. Project 1: Deploy the Backend API (`backend/`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
2. Select your repository: `mr-baraiya/odoo-hackathon-team-561`.
3. Under **Root Directory**, click **Edit** and select `backend`.
4. Framework Preset: Leave as **Other** (Vercel automatically detects [backend/vercel.json](file:///d:/VS_CODES/Projects/odoo-hackathon-team-561/backend/vercel.json)).
5. Expand **Environment Variables** and add:
   ```env
   NODE_ENV=prod
   JWT_SECRET=dealflow360_super_secret_jwt_key_2026
   DATABASE_URL=postgres://user:password@your-pg-host:5432/dealflow360?sslmode=require
   DB_HOST=your-pg-host
   DB_PORT=5432
   DB_NAME=dealflow360
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   EMAIL_ID=vvbaraiya32@gmail.com
   EMAIL_PASSWORD=pvjz zcsd tvsg kqdx
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   FRONTEND_URL=https://your-frontend-project-name.vercel.app
   ```
6. Click **Deploy**.
7. Note down your deployed Backend URL (e.g. `https://dealflow360-backend.vercel.app`).

---

## 2. Project 2: Deploy the Frontend Web App (`frontend/`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project** again.
2. Select the same repository: `mr-baraiya/odoo-hackathon-team-561`.
3. Under **Root Directory**, click **Edit** and select `frontend`.
4. Framework Preset: Automatically detected as **Vite** (uses [frontend/vercel.json](file:///d:/VS_CODES/Projects/odoo-hackathon-team-561/frontend/vercel.json)).
5. Expand **Environment Variables** and add:
   ```env
   VITE_SERVER_URL=https://dealflow360-backend.vercel.app/api
   VITE_WHATSAPP_SERVER_URL=https://dealflow360-backend.vercel.app/api
   VITE_RAZORPAY_KEY_ID=rzp_test_ZFxDYdxbnGTEtC
   ```
   *(Be sure to replace `https://dealflow360-backend.vercel.app` with your actual Backend URL from Step 1)*
6. Click **Deploy**.

---

## 3. Dedicated Configuration Files

### Backend Configuration ([backend/vercel.json](file:///d:/VS_CODES/Projects/odoo-hackathon-team-561/backend/vercel.json))
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### Frontend Configuration ([frontend/vercel.json](file:///d:/VS_CODES/Projects/odoo-hackathon-team-561/frontend/vercel.json))
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Verification Checklist
- **Backend Health Check**: Open `https://your-backend-project.vercel.app/ping` → Returns `pong (DealFlow360)`.
- **Frontend App**: Open `https://your-frontend-project.vercel.app` → Test login and support ticket submission.
