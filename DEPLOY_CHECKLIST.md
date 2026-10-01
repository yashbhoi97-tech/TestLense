# TrustLense — Production Deployment Checklist (Supabase Edition)

This guide provides step-by-step deployment instructions for **TrustLense** (React/Vite frontend on Vercel + Node/Express backend on Render + Supabase PostgreSQL + Google Gemini API).

---

## Architecture Overview

```
User (Browser)
      ↓
Vercel (React Frontend)
      ↓ HTTPS / REST
Render (Node.js/Express API)
      ├── Supabase PostgreSQL (Encrypted Database Store - Zero Raw Inputs)
      └── Google Gemini API (gemini-2.5-flash)
```

---

## Step 1: Create Google Gemini API Key
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** &rarr; **Create API key in new project**.
3. Copy your API Key (e.g., `AIzaSy...`).

---

## Step 2: Create Supabase Project
1. Sign in to [Supabase](https://supabase.com/).
2. Click **New Project** and select your organization.
3. Enter Project Name: `TrustLense` and create a strong database password.
4. Choose the region closest to your users.

---

## Step 3: Run Database Schema SQL in Supabase
1. In your Supabase project dashboard, open **SQL Editor** from the left navigation.
2. Click **New query**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from the root of this project and paste the entire script into the query editor.
4. Click **Run**.
5. Verify all four tables are created under **Table Editor**:
   - `users`
   - `scans`
   - `audit_logs`
   - `tickets`

---

## Step 4: Obtain Supabase API Credentials
1. In Supabase dashboard, go to **Project Settings &rarr; API**.
2. Copy:
   - **Project URL** (e.g., `https://abcdefghijkl.supabase.co`) &rarr; use for `SUPABASE_URL`
   - **service_role secret key** (under *Project API keys*) &rarr; use for `SUPABASE_SECRET_KEY`

> ⚠️ **CRITICAL SECURITY NOTE:** The `service_role` secret key must **ONLY** be placed in the backend (`/server`). It is never exposed to the frontend client.

---

## Step 5: Push Project to GitHub
1. In your project root, make sure all files are committed to Git:
   ```bash
   git add .
   git commit -m "feat: complete TrustLense Supabase PostgreSQL migration"
   ```
2. Create a new repository on GitHub: `TrustLense`.
3. Push your main branch:
   ```bash
   git remote add origin https://github.com/<your-username>/TrustLense.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 6: Create Render Web Service (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New &rarr; Web Service**.
2. Connect your GitHub repository `TrustLense`.
3. Configure the service settings:
   - **Name**: `trustlense-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Closest to your Supabase region
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

## Step 7: Add Backend Environment Variables on Render
Under **Environment Variables** in Render, add the following keys:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production error sanitization |
| `PORT` | `5000` | Render internal port |
| `SUPABASE_URL` | `https://your-ref.supabase.co` | Your Supabase Project URL |
| `SUPABASE_SECRET_KEY` | `eyJ...` | Your Supabase service_role secret key |
| `JWT_SECRET` | `<random-64-character-secret>` | Secret for token signing |
| `JWT_EXPIRES_IN` | `7d` | 7-day token expiration |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `CLIENT_URL` | `http://localhost:5173` | Temporary value (updated in Step 14) |

---

## Step 8: Deploy Backend
1. Click **Create Web Service**.
2. Wait for Render build logs to show:
   ```
   [Supabase] Initialized client connected to https://...
   TrustLense API Server Running at http://localhost:5000
   ```
3. Copy your live Render Backend URL (e.g., `https://trustlense-api.onrender.com`).

---

## Step 9: Verify Backend Health Check
Open your browser or curl the `/api/health` endpoint:
```bash
curl https://trustlense-api.onrender.com/api/health
```
Expected output:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "TrustLense Security API",
    "database": {
      "provider": "Supabase PostgreSQL",
      "status": "connected"
    },
    "aiEngine": {
      "configured": true,
      "model": "gemini-2.5-flash"
    }
  }
}
```

---

## Step 10: Create Vercel Project (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New &rarr; Project**.
2. Import your GitHub repository `TrustLense`.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`

---

## Step 11: Set Frontend Environment Variable on Vercel
In the Vercel **Environment Variables** section, add:
- **Key**: `VITE_API_URL`
- **Value**: `https://trustlense-api.onrender.com` (Your Render Backend URL from Step 8 without trailing slash)

---

## Step 12: Deploy Frontend
1. Click **Deploy**.
2. Wait for the build to finish.
3. Vercel will generate your live production URL (e.g., `https://trustlense.vercel.app`).

---

## Step 13: Copy Vercel Production URL
Copy the generated production URL: `https://trustlense.vercel.app`.

---

## Step 14: Update Render Backend `CLIENT_URL`
1. Go back to [Render Dashboard](https://dashboard.render.com/) &rarr; `trustlense-api` &rarr; **Environment**.
2. Edit `CLIENT_URL` and set it to your Vercel URL:
   ```
   CLIENT_URL=https://trustlense.vercel.app
   ```
3. Save changes.

---

## Step 15: Test Complete Production Flow
1. Open your live Vercel URL: `https://trustlense.vercel.app`.
2. Click **Sign In &rarr; Use Demo** (`demo@trustlense.dev` / `Demo@1234`).
3. Verify **Dashboard** telemetry charts render.
4. Go to **Security Scanner** &rarr; select **Scam Analyzer** &rarr; load sample UPI scam &rarr; click **Analyze Security & Privacy**.
5. Test **Leak Guard** with Indian Aadhaar/PAN sample & check sanitized output.
6. Open **Lense AI Assistant** widget (bottom-right) & test live chat.
7. Go to **Privacy & Audit** & verify zero raw data is stored.
