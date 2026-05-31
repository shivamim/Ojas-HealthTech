<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0f766e,50:0d9488,100:14b8a6&height=200&section=header&text=Ojas%20HealthTech&fontSize=62&fontColor=ffffff&fontAlignY=38&desc=NABH-Compliant%20Post-Discharge%20Patient%20Recovery%20Monitoring&descAlignY=60&descSize=17&animation=fadeIn"/>

<br/>

[![License](https://img.shields.io/badge/License-Proprietary-dc2626?style=for-the-badge&logo=shield&logoColor=white)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![NABH](https://img.shields.io/badge/NABH-Compliant-22c55e?style=for-the-badge&logo=checkmarx&logoColor=white)]()
[![AES-256](https://img.shields.io/badge/Encryption-AES--256-f59e0b?style=for-the-badge&logo=letsencrypt&logoColor=white)]()

<br/>

> **Ojas HealthTech** enables hospitals to monitor patients after discharge through automated WhatsApp check-ins, AI-driven risk scoring, and NABH-compliant reporting — built for Indian healthcare standards with enterprise-grade security.

<br/>

[📖 Documentation](https://docs.ojas.care) · [📊 Status](https://status.ojas.care) · [✉️ Contact](mailto:shivam.shukla1688@gmail.com) · [🐛 Report Bug](https://github.com/your-org/ojas-healthtech/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📡 API Reference](#-api-reference)
- [🔒 Security](#-security)
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
| **Field Encryption** | Patient PII encrypted at rest (AES-256 / PBKDF2HMAC) |
| **JWT Auth** | Short-lived access tokens with secure refresh rotation |
| **RBAC** | 4-tier role hierarchy with granular permission guards |
| **Multi-Tenant** | Hospital-level data isolation with auto tenant scoping |
| **Audit Logging** | IP, user agent, timestamp on every privileged action |
| **Rate Limiting** | Configurable per-endpoint throttling |

</td>
<td width="50%">

### 🤖 AI & Automation

| Feature | Details |
|---|---|
| **Heuristic Risk Scoring** | Real-time pain, fever, swelling, bleeding detection |
| **Readmission Prediction** | Age, surgery type, response rate, missed check-ins |
| **AI Coach Suggestions** | Context-aware recommended actions per escalation |
| **WhatsApp Automation** | 360dialog API with graceful simulation fallback |
| **14-Day Protocol** | Automated daily check-ins + family contact nudges |

</td>
</tr>
<tr>
<td width="50%">

### 📊 Dashboard & Analytics

| Feature | Details |
|---|---|
| **Risk Distribution** | Visual analytics across your patient cohort |
| **Escalation Board** | Kanban-style `OPEN → RESOLVED` triage workflow |
| **Patient Timeline** | Full activity history from enrollment to discharge |
| **Response Tracking** | Per-patient and aggregate engagement metrics |
| **NABH PDF Reports** | One-click compliance report generation |

</td>
<td width="50%">

### 🎨 User Experience

| Feature | Details |
|---|---|
| **Responsive Design** | Mobile-ready for ward rounds and field coordinators |
| **Tailwind UI** | Clean, accessible Ojas design system |
| **Token Auto-Refresh** | Transparent session handling with request queuing |
| **Real-time Validation** | Form-level and API-level error feedback |
| **Loading States** | Skeleton loaders throughout for smooth UX |

</td>
</tr>
</table>

---

## 🏗️ Architecture
┌──────────────────────────────────────────────────────────────┐
│                       OJAS HEALTHTECH                        │
└──────────────────────────────────────────────────────────────┘
│                      │                      │
▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   🌐 Frontend   │   │   ⚡ Backend     │   │  🐘 Database    │
│                 │──▶│                 │──▶│                 │
│  • React 18     │   │  • FastAPI      │   │  • PostgreSQL   │
│  • React Query  │   │  • SQLAlchemy 2 │   │  • Async Pooler │
│  • Tailwind CSS │   │  • Alembic      │   │  • AES-256 PII  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
│
┌─────────────────┼─────────────────┐
▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  💬 WhatsApp    │ │  🧠 AI Risk  │ │  📄 NABH Reports │
│  (360dialog)    │ │   Scoring    │ │   (PDF Engine)   │
└─────────────────┘ └──────────────┘ └──────────────────┘

---

## 🚀 Quick Start

### Prerequisites
✅ Node.js 18+
✅ Python 3.11+
✅ PostgreSQL 15+

### 🔧 Backend

```bash
# Clone the repository
git clone https://github.com/your-org/ojas-healthtech.git
cd ojas-healthtech/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# ✏️  Fill in your DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### 🎨 Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# ✏️  Set your API base URL in VITE_API_URL

# Start dev server
npm run dev
```

> 💡 Backend: `http://localhost:8000` · Frontend: `http://localhost:5173` · API Docs: `http://localhost:8000/docs` *(dev only)*

---

## ⚙️ Configuration

All secrets are managed via environment variables. **Never commit `.env` files.**

### Backend

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `SECRET_KEY` | ✅ | JWT signing secret — generate with `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | ✅ | AES-256 base key for patient PII |
| `ENCRYPTION_SALT` | ✅ | PBKDF2 salt — **never rotate after initial setup** |
| `FRONTEND_URL` | ✅ | CORS allowed origin, no trailing slash |
| `ENVIRONMENT` | ✅ | `development` or `production` |
| `WHATSAPP_API_KEY` | ❌ | 360dialog key (auto-simulates if absent) |

### Frontend

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Backend base URL pointing to the REST API |

---

## 📡 API Reference

> 📘 Full interactive documentation is available at `/docs` (Swagger UI) and `/redoc` when running locally. Endpoint paths are not published here — refer to the internal API docs or contact the team.

### Available Domains

| Domain | Description |
|---|---|
| **Authentication** | Login, logout, token refresh, user profile |
| **Patients** | Enrollment, listing, detail view, check-in submission |
| **Escalations** | Triage listing with AI suggestions, resolution workflow |
| **Reports** | NABH compliance PDF generation |

### Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header. Tokens are short-lived — clients should handle automatic refresh transparently.

```http
Authorization: Bearer <access_token>
```

### Response Format

```json
{
  "data": { ... },
  "message": "Success",
  "status": 200
}
```

Errors follow standard HTTP status codes with a JSON body containing a `detail` field.

---

## 🔒 Security

### Encryption at Rest

Patient PII is encrypted using **AES-256** with a hardened key derivation function. Encrypted fields include name, mobile numbers, UHID, bed number, doctor name, and contact details.

> ⚠️ The `ENCRYPTION_SALT` must remain constant for the lifetime of the database. Changing it without a full re-encryption pass will render all patient data unreadable.

### Authentication Flow
Login → Access Token (short-lived) + Refresh Token (longer-lived, hashed in DB)
│
├── API calls via Bearer token
└── On 401 → Auto-refresh → On failure → Re-login prompt

### Role Hierarchy

| Role | Patient Mgmt | Reports | User Mgmt | Hospital Mgmt |
|---|:---:|:---:|:---:|:---:|
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ |
| `HOSPITAL_ADMIN` | ✅ | ✅ | ✅ | ❌ |
| `COORDINATOR` | ✅ | ❌ | ❌ | ❌ |
| `DOCTOR` | Read only | ✅ | ❌ | ❌ |

---

## 🧪 Testing

```bash
# Backend — unit + integration tests
cd backend
pytest tests/ -v --cov=app

# Frontend — component tests
cd frontend
npm run test
```

---

## ☁️ Deployment

<table>
<tr>
<td width="33%">

### ⚡ Backend (Render)

1. Connect GitHub repo
2. Set all env vars in dashboard
3. Use `render.yaml` for IaC
4. Health check: `GET /health`

</td>
<td width="33%">

### 🌐 Frontend (Vercel)

1. Import GitHub repo
2. Set `VITE_API_URL` env var
3. Build: `npm run build`
4. Output: `dist/`

</td>
<td width="33%">

### 🐘 Database (Supabase)

1. Create Supabase project
2. Use Transaction pooler URL
3. Enable connection pooling
4. Enable RLS as needed

</td>
</tr>
</table>

---

## 📁 Project Structure
ojas-healthtech/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, DB, security, encryption, RBAC, audit
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # AI scoring, PDF generation, WhatsApp
│   │   └── tasks/         # Background job queues
│   ├── alembic/           # Database migrations
│   ├── requirements.txt
│   └── render.yaml
│
├── frontend/
│   ├── src/
│   │   ├── api/           # HTTP client + data-fetching hooks
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # Auth context provider
│   │   ├── hooks/         # Custom hooks (permissions, etc.)
│   │   └── pages/         # Route-level page components
│   ├── index.html
│   └── vite.config.js
│
└── README.md

---

## 🤝 Contributing

Contributions from healthcare technologists, security researchers, and designers are welcome.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit using conventional commits
git commit -m 'feat: add your feature description'

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting.

---

## 📄 License

Proprietary — see [LICENSE](LICENSE) for terms. All rights reserved.

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:14b8a6,50:0d9488,100:0f766e&height=120&section=footer"/>

**Built with ❤️ for better patient outcomes across India**

📧 [shivam.shukla1688@gmail.com](mailto:shivam.shukla1688@gmail.com) &nbsp;·&nbsp; 📖 [docs.ojas.care](https://docs.ojas.care) &nbsp;·&nbsp; 📊 [status.ojas.care](https://status.ojas.care)

© 2026 Ojas HealthTech. All rights reserved.

</div>
