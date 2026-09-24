# Deployment Guide: TaskFlow

This repository is organized as a monorepo containing both the frontend and backend:
- `frontend/`: Next.js 16 (App Router + Tailwind CSS)
- `backend/`: Node.js Express API + Supabase + Nodemailer

---

## 🚀 Part 1: Deploy Backend to Render

1. Go to **[Render Dashboard](https://dashboard.render.com/)** and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/Shiva-code-og/taskflow.git`.
3. Configure the service settings:
   - **Name**: `taskflow-backend` (or any custom name)
   - **Root Directory**: `backend` *(Important!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables** under the Environment tab:
   | Key | Value / Description |
   |---|---|
   | `PORT` | `5000` (or Render will assign one automatically) |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app,http://localhost:3000` *(You can update this after deploying frontend)* |
   | `SUPABASE_URL` | `https://your-project.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Your Supabase service role secret |
   | `SUPABASE_ANON_KEY` | Your Supabase anon public key |
   | `SUPABASE_JWT_SECRET` | Your Supabase JWT secret |
   | `GMAIL_USER` | *(Optional)* Your Gmail address for task alerts |
   | `GMAIL_APP_PASSWORD` | *(Optional)* Gmail 16-character App Password |
5. Click **Deploy Web Service**.
6. Note down your backend URL (e.g., `https://taskflow-backend-xxxx.onrender.com`).

---

## ⚡ Part 2: Deploy Frontend to Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/new)**.
2. Import the repository `https://github.com/Shiva-code-og/taskflow.git`.
3. Under **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `frontend` *(Important!)*
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
   | `NEXT_PUBLIC_API_URL` | `https://taskflow-backend-xxxx.onrender.com/api` *(Your Render backend URL + `/api`)* |
5. Click **Deploy**.

---

## 🔒 Part 3: Configure Supabase Auth Redirect URLs

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Go to **Authentication** -> **URL Configuration**.
3. Set **Site URL** to:
   ```
   https://your-frontend.vercel.app
   ```
4. Under **Redirect URLs**, add:
   ```
   https://your-frontend.vercel.app/**
   https://your-frontend.vercel.app/auth/callback
   http://localhost:3000/**
   ```
5. Save changes.

---

## 🔄 Part 4: Link Frontend URL in Render Backend

Once Vercel finishes deploying and assigns your domain:
1. Go back to Render Dashboard -> `taskflow-backend` -> **Environment**.
2. Update `FRONTEND_URL` to include your Vercel production domain:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
3. Save changes (Render will automatically redeploy).
