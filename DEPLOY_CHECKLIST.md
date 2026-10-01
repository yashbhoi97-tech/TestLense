# TrustLense — Production Deployment Checklist

This guide provides step-by-step deployment instructions for **TrustLense** (React/Vite frontend on Vercel + Node/Express backend on Render + MongoDB Atlas + Google Gemini API).

---

## Architecture Overview

```
User (Browser)
      ↓
Vercel (React Frontend)
      ↓ HTTPS / REST
Render (Node.js/Express API)
      ├── MongoDB Atlas (Encrypted Store - Zero Raw Inputs)
      └── Google Gemini API (gemini-2.5-flash)
```

---

## Step 1: Create Google Gemini API Key
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** &rarr; **Create API key in new project**.
3. Copy your API Key (e.g., `AIzaSy...`).

---

## Step 2: Create MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster (AWS or GCP region closest to your users).
3. Name your cluster (e.g., `TrustLenseCluster`).

---

## Step 3: Configure Database Access & Connection String
1. Under **Security &rarr; Database Access**, add a new database user:
   - Authentication Method: **Password**
   - Username: `trustlense_admin`
   - Password: `<secure-password>`
   - Database User Privileges: **Read and write to any database**
2. Under **Security &rarr; Network Access**, click **Add IP Address**:
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** (Required for Render dynamic IPs).
3. Under **Database &rarr; Connect &rarr; Drivers (Node.js)**, copy your connection URI:
   ```
   mongodb+srv://trustlense_admin:<password>@cluster0.mongodb.net/trustlense?retryWrites=true&w=majority
   ```

---

## Step 4: Push Project to GitHub
1. In your project root, make sure all files are committed to Git:
   ```bash
   git init
   git add .
   git commit -m "feat: complete TrustLense security platform release"
   ```
2. Create a new repository on GitHub: `TrustLense`.
3. Push your main branch:
   ```bash
   git remote add origin https://github.com/<your-username>/TrustLense.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 5: Create Render Web Service (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New &rarr; Web Service**.
2. Connect your GitHub repository `TrustLense`.
3. Configure the service settings:
   - **Name**: `trustlense-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Closest to your MongoDB Atlas region
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

## Step 6: Add Backend Environment Variables on Render
Under **Environment Variables** in Render, add the following keys:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production error sanitization |
| `PORT` | `5000` | Render internal port |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `<random-64-character-secret>` | Secret for token signing |
| `JWT_EXPIRES_IN` | `7d` | 7-day token expiration |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `CLIENT_URL` | `http://localhost:5173` | Temporary value (will update in Step 13) |

---

## Step 7: Deploy Backend
1. Click **Create Web Service**.
2. Wait for Render build logs to show:
   ```
   [Database] Connected to external MongoDB cluster.
   TrustLense API Server Running at http://localhost:5000
   ```
3. Copy your live Render Backend URL (e.g., `https://trustlense-api.onrender.com`).

---

## Step 8: Verify Backend Health Check
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
    "database": "connected",
    "aiEngine": {
      "configured": true,
      "model": "gemini-2.5-flash"
    }
  }
}
```

---

## Step 9: Create Vercel Project (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New &rarr; Project**.
2. Import your GitHub repository `TrustLense`.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`

---

## Step 10: Set Frontend Environment Variable on Vercel
In the Vercel **Environment Variables** section, add:
- **Key**: `VITE_API_URL`
- **Value**: `https://trustlense-api.onrender.com` (Your Render Backend URL from Step 7 without trailing slash)

---

## Step 11: Deploy Frontend
1. Click **Deploy**.
2. Wait for the build to finish.
3. Vercel will generate your live production URL (e.g., `https://trustlense.vercel.app`).

---

## Step 12: Copy Vercel Production URL
Copy the generated production URL: `https://trustlense.vercel.app`.

---

## Step 13: Update Render Backend `CLIENT_URL`
1. Go back to [Render Dashboard](https://dashboard.render.com/) &rarr; `trustlense-api` &rarr; **Environment**.
2. Edit `CLIENT_URL` and set it to your Vercel URL:
   ```
   CLIENT_URL=https://trustlense.vercel.app
   ```
3. Save changes.

---

## Step 14: Redeploy Backend
Render will automatically redeploy with the updated CORS whitelist.

---

## Step 15: Test Complete Production Flow
1. Open your live Vercel URL: `https://trustlense.vercel.app`.
2. Click **Sign In &rarr; Use Demo** (`demo@trustlense.dev` / `Demo@1234`).
3. Verify **Dashboard** telemetry charts render with seed data.
4. Go to **Security Scanner** &rarr; select **Scam Analyzer** &rarr; load sample UPI scam &rarr; click **Analyze Security & Privacy**.
5. Test **Leak Guard** with Indian Aadhaar/PAN sample & check sanitized output.
6. Open **Lense AI Assistant** widget (bottom-right) & test live chat.
7. Go to **Privacy & Audit** & verify zero raw data is stored.
