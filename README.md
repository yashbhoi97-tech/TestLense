# TrustLense — AI Security, Privacy & Trust Platform

> **"See the risk before it sees you."**

[![CI / Smoke Test Suite](https://img.shields.io/badge/smoke--tests-22%2F22%20passed-10B981.svg)](#testing)
[![Architecture](https://img.shields.io/badge/architecture-decoupled%20client%2Fserver-0F766E.svg)](#architecture)
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

Most users lack immediate, explainable tools to answer:
1. *Is this message safe or fraudulent?*
2. *What sensitive information is exposed here?*
3. *What should I do next?*
4. *Can I test this without having my data stored?*

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
- The original content submitted by users is **NEVER stored** in MongoDB, server logs, console logs, or audit records.
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

    Frontend -->|REST API Requests| Backend[Node.js + Express API (Render)]

    subgraph Server Architecture [/server]
        Backend --> Helmet[Helmet + Strict CORS]
        Backend --> RateLimit[Rate Limiters: Auth/Scan/Chat]
        Backend --> Engine[Deterministic Rules Engine]
        
        Engine --> Validators[Luhn, Verhoeff, PAN, IFSC]
        Engine --> Redactor[Redaction & Masking Service]
        
        Backend --> GeminiBridge[Gemini AI Bridge (gemini-2.5-flash)]
        
        GeminiBridge -.->|AI Fallback if offline| Engine
        
        Backend --> DB[(MongoDB Atlas / In-Memory Dev)]
    end

    GeminiBridge -->|Secure AI Calls| GoogleGemini[Google Gemini 2.5 Flash API]
```

---

## 6. AI Engine & Fail-Safe Fallback

1. **Strict Input Boundary:** All submitted user content is passed to Gemini explicitly treated as **untrusted data**. System prompts enforce strict JSON output with Zod validation.
2. **Deterministic Rules First:** Deterministic regex algorithms and mathematical validators run first to establish baseline security flags.
3. **Graceful Fallback:** If the Gemini API key is missing, times out (20s limit), or encounters rate limits:
   - The platform **never crashes**.
   - It sets `aiUnavailable: true`.
   - The UI displays an informative notice while continuing to provide comprehensive rule-based risk scores and redactions.

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
- **Database:** MongoDB with Mongoose (automatic `mongodb-memory-server` in development)
- **Authentication:** JWT (7-day expiry), `bcryptjs` (&ge; 10 rounds)
- **Validation & Security:** `zod`, `helmet`, `cors`, `express-rate-limit`, `morgan`
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)

---

## 8. Quick Start & Local Setup

### Prerequisites
- Node.js &ge; 18.x
- npm &ge; 9.x

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
MONGODB_URI=
JWT_SECRET=trustlense_dev_secret_98f4c1e82a3b4c5d6e7f8091a2b3c4d5e6f7
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```
*(Note: If `MONGODB_URI` and `GEMINI_API_KEY` are empty in development, TrustLense automatically starts an in-memory database and uses its deterministic rules engine).*

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

### Test Assertions Verified:
1. `GET /api/health` returns status 200 and healthy.
2. `POST /api/auth/register` creates user and returns JWT.
3. `POST /api/auth/login` verifies bcrypt credentials.
4. `GET /api/auth/me` retrieves authenticated profile.
5. Unauthorized requests return `401 Unauthorized`.
6. Validation errors trigger formatted `400 Bad Request`.
7. `POST /api/scan` executes Leak Guard mode.
8. Verifies Aadhaar detection.
9. Verifies Indian PAN card detection.
10. Verifies Payment Card detection via Luhn algorithm.
11. Verifies sensitive redaction output.
12. **Privacy Guarantee:** Verifies raw sensitive numbers are NOT present in database documents.
13. Verifies Scam Analyzer detects UPI PIN traps & phishing URLs.
14. Verifies Policy Decoder detects third-party data broker sharing.
15. Verifies Trust Auditor detects prompt injection sequences.
16. `GET /api/scans` returns user scan history.
17. `GET /api/stats` computes aggregated threat telemetry.
18. `POST /api/chat` delivers assistant responses from Lense.
19. Lense chat provides interactive React Router navigation actions.
20. Gemini-empty fallback operates seamlessly without crashes.
21. `DELETE /api/scans/:id` removes single scan.
22. `DELETE /api/me/data` permanently erases all user data.

---

## 10. Demo Credentials for Hackathon Judges

| Field | Value |
|---|---|
| **Email** | `demo@trustlense.dev` |
| **Password** | `Demo@1234` |
| **Quick Login** | Click **"Use Demo"** button on the Login page for 1-click access |

---

## 11. API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System health and AI engine status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/scan` | Analyze text payload with chosen security mode | Optional |
| `GET` | `/api/scans` | List historical scans with filtering & pagination | Optional |
| `GET` | `/api/scans/:id` | Fetch specific scan record | Optional |
| `DELETE` | `/api/scans/:id` | Delete scan record | Yes |
| `GET` | `/api/stats` | Aggregated threat metrics for dashboard | Optional |
| `POST` | `/api/chat` | Chat with 24/7 AI security assistant Lense | Optional |
| `GET` | `/api/audit-logs` | Retrieve user audit trail | Yes |
| `DELETE` | `/api/me/data` | Permanently erase all personal scans & audit logs | Yes |
| `POST` | `/api/tickets` | Submit escalation ticket to security team | Optional |

---

## 12. Deployment

Refer to [`DEPLOY_CHECKLIST.md`](./DEPLOY_CHECKLIST.md) for step-by-step instructions to deploy the frontend to **Vercel** and backend to **Render** with **MongoDB Atlas** and **Google Gemini API**.

---

## 13. License

Distributed under the MIT License. Built for the AI Security, Privacy & Trust Hackathon.
