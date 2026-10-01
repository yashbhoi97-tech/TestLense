# TrustLense — AI Security, Privacy & Trust Platform

> **"See the risk before it sees you."**

[![CI / Smoke Test Suite](https://img.shields.io/badge/smoke--tests-22%2F22%20passed-10B981.svg)](#testing)
[![Architecture](https://img.shields.io/badge/architecture-decoupled%20client%2Fserver-0F766E.svg)](#architecture)
[![Database](https://img.shields.io/badge/database-Supabase%20PostgreSQL-3ECF8E.svg)](#database-layer--supabase-postgresql)
[![Privacy](https://img.shields.io/badge/privacy-zero%20raw%20data%20storage-1D4ED8.svg)](#privacy-by-design)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-9333EA.svg)](#ai-engine--fail-safe-architecture)

---

## 1. Problem Statement

Every day, digital users and developers are bombarded with deceptive content:
- **Urgent Phishing & Fake KYC SMS:** Fake bank deactivation threats leading to credential harvesting.
- **Deceptive UPI PIN Traps:** Scammers asking users to enter their UPI PIN to "receive money or lottery rewards".
- **Accidental PII / Secret Leaks:** Pasting sensitive Indian Aadhaar, PAN cards, payment card numbers, or AWS / OpenAI secret tokens into codebases or third-party AI prompts.
- **Unintelligible Privacy Policies:** Complex legal policies disguising third-party data broker sharing and perpetual retention.
- **AI Hallucinations & Injections:** Untrusted AI-generated responses with synthetic citations, overconfidence bias, or jailbreak vulnerabilities.

---

## 2. The Solution: TrustLense

**TrustLense** combines **deterministic security algorithms**, **privacy redaction**, and **contextual AI reasoning** into one explainable, privacy-first security platform.

```
                  ┌─────────────────────────────────────────────────┐
                  │                 TrustLense Core                 │
                  │   Security • Explainability • Privacy-by-Design  │
                  └───────────────────────┬─────────────────────────┘
                                          │
    ┌──────────────────┬──────────────────┼──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐
│ Leak Guard  │  │    Scam     │  │   Policy    │  │    Trust    │  │       Lense       │
│             │  │  Analyzer   │  │   Decoder   │  │   Auditor   │  │  24/7 AI Assistant│
│ PII & Keys  │  │ UPI/SMS/KYC │  │ Data Sharing│  │ AI Safety & │  │  Guidance & Nav  │
│  Redaction  │  │ Phishing    │  │ & Retention │  │ Hallucinate │  │    Escalations    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────────┘
```

---

## 3. Four Core Analysis Modes

| Mode | Capabilities & Detections |
|---|---|
| **🛡️ Leak Guard** | Detects & masks Aadhaar (Verhoeff check), PAN cards, Indian phone numbers, Emails, Credit/Debit cards (Luhn algorithm), UPI IDs, Bank IFSCs, Passports, AWS keys, Google AIza keys, OpenAI `sk-` tokens, GitHub PATs, JWTs, private RSA/EC keys, and passwords. Generates clean **redacted text** ready to share. |
| **🚨 Scam Analyzer** | Analyzes SMS, WhatsApp messages, payment requests, and suspicious links. Detects coercive urgency, fake KYC deactivation alerts, advance-fee work-from-home scams, and the classic **UPI PIN Trap** (*"You never need a PIN to receive money"*). |
| **📜 Policy Decoder** | Uncovers third-party data monetization, advertising data broker sales, indefinite retention clauses, and unilateral terms changes in legal privacy policies. |
| **🤖 Trust Auditor** | Inspects AI-generated answers for hallucination indicators, unverified synthetic citations, absolute overconfidence claims, and prompt injection / jailbreak attempts. |

---

## 4. Privacy by Design Guarantee

### **Absolute Rule: NEVER Store Raw User Input**
- The original content submitted by users is **NEVER stored** in Supabase, server logs, console logs, or audit records.
- Input exists in-memory only during the lifecycle of the scan request.
- The database persists **only**:
  - Sanitized redacted text with sensitive numbers masked (e.g. `XXXX-XXXX-1234`, `j***@example.com`, `[REDACTED]`).
  - Masked finding previews.
  - Calculated risk score and security recommendations.
- **Right to Erasure:** Authenticated users can permanently delete all scan history and audit logs at any time via the **Privacy & Audit** page.

---

## 5. System Architecture

TrustLense maintains a **strict separation between Frontend and Backend**:

```mermaid
graph TD
    User([Digital User / Judge]) -->|HTTPS / UI| Frontend[React + Vite Frontend (Vercel)]
    
    subgraph Client Architecture [/client]
        Frontend --> Router[React Router]
        Frontend --> R3F[Three.js / 3D Shield Engine]
        Frontend --> Recharts[Telemetry Dashboard]
        Frontend --> LenseWidget[Lense 24/7 AI Assistant Widget]
    end

    Frontend -->|REST API Requests (VITE_API_URL)| Backend[Node.js + Express API (Render)]

    subgraph Server Architecture [/server]
        Backend --> Helmet[Helmet + Strict CORS]
        Backend --> RateLimit[Rate Limiters: Auth/Scan/Chat]
        Backend --> Engine[Deterministic Rules Engine]
        
        Engine --> Validators[Luhn, Verhoeff, PAN, IFSC]
        Engine --> Redactor[Redaction & Masking Service]
        
        Backend --> GeminiBridge[Gemini AI Bridge (gemini-2.5-flash)]
        
        GeminiBridge -.->|AI Fallback if offline| Engine
        
        Backend --> SupabaseClient[Supabase PostgreSQL Client (@supabase/supabase-js)]
    end

    SupabaseClient -->|Encrypted Storage| SupabaseDB[(Supabase PostgreSQL)]
    GeminiBridge -->|Secure AI Calls| GoogleGemini[Google Gemini 2.5 Flash API]
```

---

## 6. Database Layer — Supabase PostgreSQL

All data models are defined in [`supabase_schema.sql`](./supabase_schema.sql):

- `users` (id UUID, name TEXT, email TEXT UNIQUE, password_hash TEXT, created_at TIMESTAMPTZ)
- `scans` (id UUID, user_id UUID, mode TEXT, risk_score INT, risk_level TEXT, verdict TEXT, summary TEXT, findings JSONB, redacted_text TEXT, recommended_actions JSONB, extras JSONB, ai_unavailable BOOL, input_length INT, created_at TIMESTAMPTZ)
- `audit_logs` (id UUID, user_id UUID, action TEXT, mode TEXT, ip TEXT, user_agent TEXT, created_at TIMESTAMPTZ)
- `tickets` (id UUID, user_id UUID, email TEXT, subject TEXT, message TEXT, chat_transcript JSONB, status TEXT, created_at TIMESTAMPTZ)

> **Security Rule:** Supabase credentials (`SUPABASE_SECRET_KEY`) exist **exclusively** on the backend and are NEVER exposed to the frontend.

---

## 7. Technology Stack

### **Frontend (`/client`)**
- **Core:** React 18, Vite
- **Styling:** Tailwind CSS (Curated SaaS theme: `#F8FAFC`, `#0F172A`, `#0F766E`, `#1D4ED8`)
- **Typography:** Inter + Playfair Display font pairings
- **Icons & Motion:** `lucide-react`, `framer-motion`
- **Charts:** `recharts` (Clean 2D donut & bar telemetry)
- **3D Visuals:** `three`, `@react-three/fiber`, `@react-three/drei` (Procedural geometry with WebGL error fallback)
- **HTTP Client:** `axios`

### **Backend (`/server`)**
- **Runtime:** Node.js (ES Modules), Express
- **Database:** Supabase PostgreSQL (`@supabase/supabase-js`)
- **Authentication:** JWT (7-day expiry), `bcryptjs` (&ge; 10 rounds)
- **Validation & Security:** `zod`, `helmet`, `cors`, `express-rate-limit`, `morgan`
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)

---

## 8. Quick Start & Local Setup

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/<your-username>/TrustLense.git
cd TrustLense

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_service_role_key
JWT_SECRET=trustlense_dev_secret_98f4c1e82a3b4c5d6e7f8091a2b3c4d5e6f7
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```
*(Note: If `SUPABASE_URL` and `GEMINI_API_KEY` are empty in local development, TrustLense automatically initializes an in-memory database adapter and uses its deterministic rules engine).*

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Seed Database with Realistic Scans

```bash
cd server
npm run seed
```
*Creates demo user `demo@trustlense.dev` / `Demo@1234` with 25 diverse scans across the past 30 days.*

### 4. Run Locally

**Start Backend:**
```bash
cd server
npm start
# Running at http://localhost:5000
```

**Start Frontend:**
```bash
cd client
npm run dev
# Running at http://localhost:5173
```

---

## 9. Testing & Quality Gate

TrustLense includes an automated **22-point end-to-end API smoke test suite**:

```bash
cd server
npm run test:api
```

---

## 10. Demo Credentials for Hackathon Judges

| Field | Value |
|---|---|
| **Email** | `demo@trustlense.dev` |
| **Password** | `Demo@1234` |
| **Quick Login** | Click **"Use Demo"** button on the Login page for 1-click access |

---

## 11. Deployment

Refer to [`DEPLOY_CHECKLIST.md`](./DEPLOY_CHECKLIST.md) for step-by-step instructions to deploy the frontend to **Vercel** and backend to **Render** with **Supabase PostgreSQL** and **Google Gemini API**.

---

## 12. License

Distributed under the MIT License. Built for the AI Security, Privacy & Trust Hackathon.
