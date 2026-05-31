<div align="center">

<!-- Header Banner -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:0891b2,100:0e7490&height=200&section=header&text=Ojas%20HealthTech%20V3&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=NABH-Compliant%20%7C%20AI-Powered%20%7C%20Multi-Tenant%20Post-Discharge%20Recovery%20Monitoring&descAlignY=60&descSize=16&animation=fadeIn"/>

<br/>

[![License](https://img.shields.io/badge/License-Proprietary-dc2626?style=for-the-badge&logo=shield&logoColor=white)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![NABH](https://img.shields.io/badge/NABH-Compliant-22c55e?style=for-the-badge&logo=checkmarx&logoColor=white)]()
[![AES-256](https://img.shields.io/badge/Encryption-AES--256-f59e0b?style=for-the-badge&logo=letsencrypt&logoColor=white)]()

<br/>

> **Ojas HealthTech** is a production-grade healthcare platform that enables hospitals to monitor patients after discharge through automated WhatsApp check-ins, AI-driven risk scoring, and NABH-compliant reporting. Built for Indian healthcare standards with field-level AES-256 encryption, role-based access control, and comprehensive audit trails.

<br/>

[📖 Documentation](https://docs.ojas.care) · [📊 Status](https://status.ojas.care) · [✉️ Support](mailto:shivam.shukla1688@gmail.com) · [🐛 Report Bug](https://github.com/your-org/ojas-healthtech/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [👤 Demo Credentials](#-demo-credentials)
- [📡 API Endpoints](#-api-endpoints)
- [🔒 Security Model](#-security-model)
- [🧪 Testing](#-testing)
- [☁️ Deployment](#️-deployment)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Security & Compliance

| Feature | Details |
|---|---|
| **NABH Compliance** | Automated COP 7.3, 7.3.1, 7.4, 5.6 reporting |
| **AES-256 Encryption** | Patient PII encrypted at rest via Fernet (PBKDF2HMAC) |
| **JWT Authentication** | 15-min access + 7-day refresh tokens with secure rotation |
| **RBAC** | `SUPER_ADMIN` → `HOSPITAL_ADMIN` → `COORDINATOR` → `DOCTOR` |
| **Multi-Tenant Isolation** | Hospital-level data segregation with auto tenant scoping |
| **Audit Logging** | IP, user agent, timestamp, and success status on every action |
| **Rate Limiting** | Configurable per-endpoint limits via SlowAPI |

</td>
<td width="50%">

### 🤖 AI & Automation

| Feature | Details |
|---|---|
| **Heuristic Risk Scoring** | Real-time pain, fever, swelling, bleeding detection |
| **Readmission Risk Prediction** | Age, surgery type, response rate, missed check-ins |
| **AI Coach Suggestions** | Context-aware action recommendations per escalation |
| **WhatsApp Automation** | 360dialog API with simulated fallback mode |
| **14-Day Check-in Protocol** | Automated daily monitoring + family nudges |

</td>
</tr>
<tr>
<td width="50%">

### 📊 Dashboard & Analytics

| Feature | Details |
|---|---|
| **Risk Distribution Charts** | Recharts-powered visual analytics |
| **Escalation Triage Board** | Kanban-style `OPEN` → `RESOLVED` workflow |
| **Patient Timeline** | Complete activity history enrollment to resolution |
| **Response Rate Tracking** | Per-patient and aggregate engagement metrics |
| **NABH PDF Reports** | One-click compliance report generation |

</td>
<td width="50%">

### 🎨 User Experience

| Feature | Details |
|---|---|
| **Responsive Design** | Full mobile support for ward rounds & field coordinators |
| **Dark-Ready UI** | Tailwind CSS with Ojas design system |
| **Auto Token Refresh** | Transparent 401 handling with request queuing |
| **Real-time Validation** | Form-level and API-level error handling |
| **Loading States** | Skeleton loaders and spinners throughout |

</td>
</tr>
</table>

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────────┐
│                        OJAS HEALTHTECH V3                       │
└─────────────────────────────────────────────────────────────────┘
│                      │                      │
▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    🌐 Vercel    │   │   ⚡ Render      │   │  🐘 Supabase    │
│   (Frontend)    │──▶│   (Backend)     │──▶│  (PostgreSQL)   │
│                 │   │                 │   │                 │
│  • React 18     │   │  • FastAPI      │   │  • Async Pooler │
│  • React Query  │   │  • SQLAlchemy 2 │   │  • Row-Level    │
│  • Tailwind CSS │   │  • Alembic      │   │    Security     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
│                      │
▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│  💬 360dialog   │   │  🧠 Local AI    │
│  (WhatsApp API) │   │  (Risk Scoring) │
└─────────────────┘   └─────────────────┘

---

## 🚀 Quick Start

### Prerequisites
✅ Node.js 18+
✅ Python 3.11+
✅ PostgreSQL 15+ (or Supabase account)

### 🔧 Backend Setup

```bash
# Clone repository
git clone https://github.com/your-org/ojas-healthtech.git
cd ojas-healthtech/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# ✏️  Edit .env with your DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY

# Run database migrations
alembic upgrade head

# Seed demo data
python -c "from seed_data import seed; import asyncio; asyncio.run(seed())"

# Start the server 🚀
uvicorn app.main:app --reload --port 8000
```

### 🎨 Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# ✏️  Edit .env: VITE_API_URL=http://localhost:8000/api/v1

# Development server
npm run dev

# Production build
npm run build
```

> 💡 Backend runs at `http://localhost:8000` · Frontend at `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | `postgresql+asyncpg://...` |
| `SECRET_KEY` | ✅ | JWT signing key (≥32 chars) |
| `ENCRYPTION_KEY` | ✅ | AES-256 key (30+ chars, padded to 32) |
| `ENCRYPTION_SALT` | ✅ | PBKDF2 salt — **never change after encrypting data** |
| `FRONTEND_URL` | ✅ | CORS origin, no trailing slash |
| `ENVIRONMENT` | ✅ | `development` or `production` |
| `RESET_KEY` | ✅ | SHA-256 hash for superadmin DB reset |
| `WHATSAPP_API_KEY` | ❌ | 360dialog API key (simulated if absent) |
| `DATABASE_USE_NULLPOOL` | ❌ | `true` for Supabase connection pooler |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Backend URL + `/api/v1` |

---

## 👤 Demo Credentials

> ⚠️ For development and testing only. Do not use in production.

| Email | Password | Role | Permissions |
|---|---|---|---|
| `admin@ojas.care` | `admin123` | `SUPER_ADMIN` | Full system access |
| `nurse@cityhospital.com` | `nurse123` | `COORDINATOR` | Patient CRUD, escalations |
| `dr.gupta@cityhospital.com` | `doctor123` | `DOCTOR` | Read, reports, escalation view |

---

## 📡 API Endpoints

### 🔑 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Login with JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Bearer | Revoke refresh tokens |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |
| `POST` | `/api/v1/auth/verify-invite` | Public | Check invite validity |
| `POST` | `/api/v1/auth/accept-invite` | Public | Create account from invite |

### 🏥 Patients

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/patients` | Bearer | Enroll new patient (auto-creates 14 check-ins) |
| `GET` | `/api/v1/patients` | Bearer | List with pagination, status filter |
| `GET` | `/api/v1/patients/{id}` | Bearer | Full detail with timeline, check-ins, escalations |
| `POST` | `/api/v1/patients/{id}/checkin/{day}` | Bearer | Submit check-in with AI risk scoring |

### 🚨 Escalations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/escalations` | Bearer | List with AI coach suggestions |
| `POST` | `/api/v1/escalations/{id}/resolve` | Bearer | Resolve with notes |

### 📄 Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/reports/nabh` | Bearer | Download NABH compliance PDF |

### 🛡️ SuperAdmin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/superadmin/hospitals` | SuperAdmin | Create hospital |
| `GET` | `/api/v1/superadmin/hospitals` | SuperAdmin | List all hospitals |
| `POST` | `/api/v1/superadmin/hospitals/{id}/invite` | SuperAdmin | Invite user by email |
| `GET` | `/api/v1/superadmin/audit-logs` | SuperAdmin | Security event trail |
| `POST` | `/api/v1/superadmin/reset-database` | SuperAdmin | Full reset with `X-Reset-Key` |

---

## 🔒 Security Model

### Encryption
Algorithm    : AES-256 via Fernet
Key Derivation: PBKDF2HMAC (SHA-256, 480,000 iterations)
Salt         : Fixed per-deployment — NEVER rotate

**Encrypted Fields:** `full_name` · `mobile` · `family_mobile` · `doctor_name` · `bed_number` · `uhid` · `contact_email` · `contact_phone`

> 🔍 Key fingerprint is exposed at `/health` for deployment verification.

### Authentication Flow
Login
└──► Access Token (15 min) + Refresh Token (7 days, hashed in DB)
│
├──► API Calls (Bearer access_token)
│
└──► 401 Expired
└──► POST /auth/refresh → New Access Token
│
└──► Refresh Revoked → Redirect to Login

### RBAC Permission Matrix

| Permission | SUPER_ADMIN | HOSPITAL_ADMIN | COORDINATOR | DOCTOR |
|---|:---:|:---:|:---:|:---:|
| `patient:create` | ✅ | ✅ | ✅ | ❌ |
| `patient:read` | ✅ | ✅ | ✅ | ✅ |
| `patient:update` | ✅ | ✅ | ✅ | ❌ |
| `report:generate` | ✅ | ✅ | ❌ | ✅ |
| `user:manage` | ✅ | ✅ | ❌ | ❌ |
| `hospital:manage` | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 Testing

```bash
# Backend tests with coverage
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test

# Load testing
locust -f locustfile.py --host https://ojas-healthtech.onrender.com
```

---

## ☁️ Deployment

<table>
<tr>
<td width="33%">

### ⚡ Render (Backend)

1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard
3. Use `render.yaml` for infrastructure-as-code
4. Health check: `GET /health`

</td>
<td width="33%">

### 🌐 Vercel (Frontend)

1. Import GitHub repo to Vercel
2. Set `VITE_API_URL` environment variable
3. Build command: `npm run build`
4. Output directory: `dist`

</td>
<td width="33%">

### 🐘 Supabase (Database)

1. Create project in Supabase
2. Copy connection string with pooler
3. Set `DATABASE_USE_NULLPOOL=true`
4. Enable Row Level Security (optional)

</td>
</tr>
</table>

---

## 📁 Project Structure
Ojas-HealthTech/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, DB, security, encryption, RBAC, audit
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # AI scoring, PDF, WhatsApp
│   │   └── tasks/         # Async job queues
│   ├── seed_data.py       # Demo data
│   ├── requirements.txt
│   └── render.yaml
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client, React Query hooks
│   │   ├── components/    # Reusable UI (RiskBadge, EscalationCoach)
│   │   ├── context/       # AuthContext
│   │   ├── hooks/         # usePermission
│   │   ├── pages/         # Route components
│   │   └── components/layout/  # Sidebar, Layout
│   ├── index.html
│   └── vite.config.js
│
└── README.md

---

## 🤝 Contributing

We welcome contributions from healthcare technologists, security researchers, and UI/UX designers!

```bash
# 1️⃣  Fork the repository
# 2️⃣  Create your feature branch
git checkout -b feature/amazing-feature

# 3️⃣  Commit your changes
git commit -m 'Add amazing feature'

# 4️⃣  Push to branch
git push origin feature/amazing-feature

# 5️⃣  Open a Pull Request 🎉
```

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting.

---

## 📄 License

This project is licensed under the **Ojas HealthTech Proprietary License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

| | Service | Purpose |
|---|---|---|
| 🏥 | **NABH** | National Accreditation Board for Hospitals & Healthcare Providers — compliance standards |
| 💬 | **360dialog** | WhatsApp Business API infrastructure |
| 🐘 | **Supabase** | Managed PostgreSQL |
| ⚡ | **Render** | Seamless backend deployment |
| 🌐 | **Vercel** | Edge-distributed frontend hosting |

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0e7490,50:0891b2,100:06b6d4&height=120&section=footer"/>

**Built with ❤️ for better patient outcomes**

📧 [shivam.shukla1688@gmail.com](mailto:shivam.shukla1688@gmail.com) · 📖 [docs.ojas.care](https://docs.ojas.care) · 📊 [status.ojas.care](https://status.ojas.care)

© 2026 Ojas HealthTech. All rights reserved.

</div>
