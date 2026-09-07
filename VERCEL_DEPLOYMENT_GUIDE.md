# DealFlow360 — Separate Vercel Deployment Guide

This guide details how to deploy **DealFlow360** on Vercel as two separate, independent projects:
1. **Backend API Server (`backend/`)**
2. **Frontend Web Application (`frontend/`)**

---

## 1. Deploying the Backend (`backend/`)

### Option A: Via Vercel Web Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
2. Import your GitHub repository (`odoo-hackathon-team-561`).
3. Set **Root Directory** to `backend`.
4. Under **Framework Preset**, select **Other**.
5. Under **Environment Variables**, add the required backend variables:
   ```env
   NODE_ENV=prod
   SERVER_PORT=5000
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
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click **Deploy**. Vercel will create your backend URL (e.g. `https://dealflow360-backend.vercel.app`).

### Option B: Via Vercel CLI
```bash
cd backend
vercel --prod
```

---

## 2. Deploying the Frontend (`frontend/`)

### Option A: Via Vercel Web Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
2. Import your GitHub repository (`odoo-hackathon-team-561`).
3. Set **Root Directory** to `frontend`.
4. Framework Preset will auto-detect **Vite**.
5. Under **Environment Variables**, set:
   ```env
   VITE_SERVER_URL=https://dealflow360-backend.vercel.app/api
   VITE_WHATSAPP_SERVER_URL=https://dealflow360-backend.vercel.app/api
   VITE_RAZORPAY_KEY_ID=rzp_test_ZFxDYdxbnGTEtC
   ```
6. Click **Deploy**. Vercel will build your frontend URL (e.g. `https://dealflow360-frontend.vercel.app`).

### Option B: Via Vercel CLI
```bash
cd frontend
vercel --prod
```

---

## 3. Configuration Files Reference

### `backend/vercel.json`
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

### `frontend/vercel.json`
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

## 4. Post-Deployment Verification
1. Visit `https://dealflow360-backend.vercel.app/ping` → Should return `pong (DealFlow360)`.
2. Visit `https://dealflow360-backend.vercel.app/api/health` → Should return status `OK`.
3. Open `https://dealflow360-frontend.vercel.app` → Open browser DevTools Network tab to verify API requests hit `https://dealflow360-backend.vercel.app/api/...`.
