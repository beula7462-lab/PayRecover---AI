<<<<<<< HEAD
# PayRecover AI — Full-Stack AI Revenue Recovery Agent

**PayRecover AI** is an enterprise-grade full-stack revenue recovery application designed to monitor failed digital payment transactions, calculate revenue at risk, evaluate recovery probabilities using an explainable deterministic AI scoring engine, prioritize recovery queues, execute simulated recovery workflows, and dynamically update revenue metrics and analytics in real time.

> **Disclaimer**: This application uses ONLY synthetic/demo payment data and simulated recovery actions. It DOES NOT process real financial transactions, store real credit cards, or handle real banking credentials.

---

## 🌟 Key Features

1. **Executive Dashboard**:
   - Dynamic real-time KPI metrics: **Revenue at Risk**, **Revenue Recovered**, **Recovery Rate %**, and **Failed Payments Count**.
   - Database-Driven AI Insights Feed (High-value risk alerts, bottleneck failure reasons, top probability quick wins, channel risk).
   - Priority recovery queue snapshot with instant action execution.

2. **Failed Payments Management**:
   - Complete searchable, filterable, and sortable transaction table.
   - Filters by Payment Status (`FAILED`, `PENDING_RECOVERY`, `RECOVERED`, `ACTION_EXECUTED`), Payment Method (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Wallet`), and Failure Reason.
   - Sorting by amount, date, and AI recovery probability.
   - Direct link to deep transaction analysis (`/transactions/[id]`).

3. **AI Transaction Disruption Analysis**:
   - Deep-dive card with animated/radial AI recovery probability ring.
   - Failure cause diagnosis and explainable scoring rule breakdown.
   - Direct recovery execution toolbar (`Retry Payment`, `Send Payment Link`, `Schedule Reminder`).
   - Historical execution audit trail.

4. **Autonomous AI Recovery Queue**:
   - Dedicated `/recovery-queue` page auto-ranked by weighted Priority Score (0–100).
   - One-click inline action execution with instant metrics recalculation across all pages without browser refreshes.

5. **Analytics & Financial Performance**:
   - Interactive Recharts data visualizers:
     - **Recovery Trend**: Timeline Area Chart comparing Recovered Revenue vs Revenue at Risk.
     - **Failure Cause Distribution**: Donut Chart breaking down failure categories.
     - **Payment Channel Performance**: Bar Chart measuring method-wise recovery rates.

---

## 🛠️ Architecture & Tech Stack

```
                               ┌──────────────────────────────────────────────┐
                               │           Next.js 14 Frontend                │
                               │  (React 18, TypeScript, Tailwind, Recharts)  │
                               └──────────────────────┬───────────────────────┘
                                                      │ REST HTTP / JSON APIs
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             FastAPI Backend                  │
                               │   (Python 3.11+, Pydantic v2, Uvicorn)       │
                               └──────────────┬────────────────┬──────────────┘
                                              │                │
                        ┌─────────────────────┘                └────────────────────┐
                        ▼                                                           ▼
         ┌─────────────────────────────┐                             ┌─────────────────────────────┐
         │     AI Scoring Engine       │                             │   PostgreSQL / SQLAlchemy   │
         │ (Explainable Deterministic) │                             │   (ORM + Alembic Migrations)│
         └─────────────────────────────┘                             └─────────────────────────────┘
```

- **Frontend**: Next.js App Router, TypeScript, React 18, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic, Uvicorn.
- **Database**: PostgreSQL (with automatic zero-config SQLite fallback for instant local testing).
- **DevOps**: Docker, Docker Compose, Pytest test suite, Railway deployment manifests.

---

## 🧠 AI Recovery Scoring Engine Logic

The AI Recovery Engine (`backend/app/ai/recovery_engine.py`) is explainable and deterministic:

### 1. Base Recovery Probability
- `Temporary Bank Error`: **88%**
- `Network Error`: **82%**
- `Timeout`: **78%**
- `Insufficient Funds`: **58%**
- `Bank Declined`: **42%**
- `Expired Card`: **38%**
- `Invalid Payment Details`: **30%**

### 2. Adjustments & Penalties
- **UPI Channel Multiplier**: `1.05x`
- **Attempt Count Penalty**: `-8%` per additional attempt beyond 1
- **Transaction Age Penalty**: `-5%` per 24 hours unresolved

### 3. Weighted Priority Formula
$$\text{Priority Score} = (\text{Amount Score} \times 0.35) + (\text{Probability Score} \times 0.40) + (\text{Urgency Score} \times 0.15) + (\text{Reason Score} \times 0.10)$$

Normalized to `0 - 100`:
- **80 – 100**: `HIGH` Priority
- **45 – 79**: `MEDIUM` Priority
- **0 – 44**: `LOW` Priority

---

## 📁 Repository Structure

```
payrecover-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI REST Routers (Dashboard, Transactions, Recovery, Analytics)
│   │   ├── ai/           # Explainable AI Recovery Scoring Engine
│   │   ├── core/         # Configuration & CORS settings
│   │   ├── db/           # SQLAlchemy Session & Base
│   │   ├── models/       # Transaction & RecoveryAction ORM models
│   │   ├── schemas/      # Pydantic Request/Response models
│   │   ├── services/     # Dashboard, Recovery, and Analytics services
│   │   └── main.py       # FastAPI Entrypoint
│   ├── alembic/          # DB Migrations
│   ├── tests/            # Pytest suite (15 automated tests)
│   ├── seed.py           # Synthetic Indian transaction generator (55 records)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js App Router pages (Dashboard, Payments, Detail, Queue, Analytics)
│   ├── components/       # Reusable Fintech UI components
│   ├── lib/              # API Client, Types & Utils
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── railway.json
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Option 1: Local Development (Python + Node.js)

1. **Clone & Setup Backend**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Seed Synthetic Data & Run Backend**:
   ```bash
   python seed.py
   python app/main.py
   ```
   FastAPI will start on `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

3. **Run Backend Pytest Suite**:
   ```bash
   python -m pytest
   ```

4. **Setup & Run Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Next.js frontend will start on `http://localhost:3000`.

---

### Option 2: Docker Compose

Start PostgreSQL database, FastAPI backend, and Next.js frontend with a single command:

```bash
docker-compose up --build
```

Access the app at:
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`

---

## ☁️ Railway Production Deployment

1. **Deploy PostgreSQL**: Create a PostgreSQL database instance on Railway. Copy `DATABASE_URL`.
2. **Deploy Backend Service**:
   - Environment variables:
     - `DATABASE_URL`: `${{ Postgres.DATABASE_URL }}`
     - `CORS_ORIGINS`: `https://<your-frontend-domain>.up.railway.app`
   - Build Command: `pip install -r requirements.txt && alembic upgrade head && python seed.py`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`
3. **Deploy Frontend Service**:
   - Environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend-domain>.up.railway.app/api`
   - Railway auto-detects `Dockerfile` or Node build.

---

## 📋 Acceptance Criteria Checklist

- [x] Next.js 14 Frontend with Dark-Blue Fintech Aesthetic & ₹ (INR) currency
- [x] FastAPI REST Backend with Pydantic v2 & SQLAlchemy ORM
- [x] PostgreSQL & Alembic Migrations support (+ zero-config SQLite fallback)
- [x] Deterministic Explainable AI Scoring Engine (`recovery_engine.py`)
- [x] 55 Synthetic Indian Failed & Recovered Payment records generated via `seed.py`
- [x] Dynamic Database-Driven AI Insights Feed
- [x] Search, Filter, Sort, Pagination on Payments Table
- [x] Radial AI Probability Gauge on Transaction Detail Page
- [x] Prioritized AI Recovery Queue sorted by Priority Score
- [x] Recovery Action Execution (`RETRY_PAYMENT`, `SEND_PAYMENT_LINK`, `SCHEDULE_REMINDER`)
- [x] Dynamic real-time KPI metric updates upon recovery execution
- [x] Recharts Analytics (Trends Line Chart, Failure Donut Chart, Payment Method Bar Chart)
- [x] 15 Pytest Automated Unit & API Integration Tests passing (0.75s)
- [x] Multi-stage Dockerfiles & Docker Compose configuration
- [x] Railway Deployment Manifest (`railway.json`)
- [x] Privacy/Safety Note (Synthetic Demo Data Only)


