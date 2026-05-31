Ojas HealthTech V3
<p align="center">
  <img src="https://img.shields.io/badge/Ojas-V3-1e40af?style=for-the-badge&logo=stethoscope&logoColor=white" alt="Ojas V3" />
  <br/>
  <img src="https://img.shields.io/badge/NABH-Compliant-green?style=flat-square" alt="NABH" />
  <img src="https://img.shields.io/badge/AI-Powered-blue?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/Multi--Tenant-purple?style=flat-square" alt="Multi-Tenant" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
</p>
NABH-Compliant | AI-Powered | Multi-Tenant Post-Discharge Recovery Monitoring Platform
Ojas HealthTech is a production-grade healthcare platform that enables hospitals to monitor patients after discharge through automated WhatsApp check-ins, AI-driven risk scoring, and NABH-compliant reporting. Built for Indian healthcare standards with field-level AES-256 encryption, role-based access control, and comprehensive audit trails.
✨ Features
🔐 Security & Compliance
NABH Compliance — Automated COP 7.3, 7.3.1, 7.4, 5.6 reporting
AES-256 Field-Level Encryption — Patient PII encrypted at rest via Fernet (PBKDF2HMAC)
JWT Authentication — 15-minute access tokens + 7-day refresh tokens with secure rotation
RBAC — SUPER_ADMIN → HOSPITAL_ADMIN → COORDINATOR → DOCTOR
Multi-Tenant Isolation — Hospital-level data segregation with automatic tenant scoping
Audit Logging — Every action logged with IP, user agent, timestamp, and success status
Rate Limiting — Configurable per-endpoint limits via SlowAPI
🤖 AI & Automation
Heuristic Risk Scoring — Real-time pain, fever, swelling, bleeding detection with keyword analysis
Readmission Risk Prediction — Age, surgery type, response rate, missed check-ins, open escalations
AI Coach Suggestions — Context-aware action recommendations for each escalation type
WhatsApp Automation — 360dialog API integration with simulated fallback mode
14-Day Check-in Protocol — Automated daily monitoring with family nudges for non-responders
📊 Dashboard & Analytics
Risk Distribution Charts — Recharts-powered visual analytics
Escalation Triage Board — Kanban-style OPEN → RESOLVED workflow
Patient Timeline — Complete activity history from enrollment to resolution
Response Rate Tracking — Per-patient and aggregate engagement metrics
NABH PDF Reports — One-click compliance report generation
📱 User Experience
Responsive Design — Full mobile support for ward rounds and field coordinators
Dark-Ready UI — Tailwind CSS with Ojas design system
Auto Token Refresh — Transparent 401 handling with request queuing
Real-time Validation — Form-level and API-level error handling
Loading States — Skeleton loaders and spinners throughout
🏗️ Architecture
plain
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render        │────▶│   Supabase      │
│   (Frontend)    │     │   (Backend)     │     │   (PostgreSQL)  │
│   React 18      │     │   FastAPI       │     │   Async Pooler  │
│   React Query   │     │   SQLAlchemy 2  │     │   Row-Level     │
│   Tailwind      │     │   Alembic       │     │   Security      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
   ┌──────────┐   ┌──────────┐    ┌──────────────┐
   │  User    │   │ 360dialog│    │  Local AI    │
   │ Browser  │   │ WhatsApp │    │  Scoring     │
   └──────────┘   └──────────┘    └──────────────┘
🚀 Quick Start
Prerequisites
Node.js 18+
Python 3.11+
PostgreSQL 15+ (or Supabase account)
Backend Setup
bash
# Clone repository
git clone https://github.com/your-org/ojas-healthtech.git
cd ojas-healthtech/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY

# Database migrations
alembic upgrade head

# Seed demo data
python -c "from seed_data import seed; import asyncio; asyncio.run(seed())"

# Start server
uvicorn app.main:app --reload --port 8000
Frontend Setup
bash
cd ../frontend

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api/v1

# Development server
npm run dev

# Production build
npm run build
⚙️ Environment Variables
Backend (backend/.env)
Table
Variable	Required	Description
DATABASE_URL	✅	postgresql+asyncpg://...
SECRET_KEY	✅	JWT signing key (≥32 chars)
ENCRYPTION_KEY	✅	AES-256 key (30+ chars, padded to 32)
ENCRYPTION_SALT	✅	PBKDF2 salt (never change after encrypting data)
FRONTEND_URL	✅	CORS origin, no trailing slash
ENVIRONMENT	✅	development or production
RESET_KEY	✅	SHA-256 hash for superadmin DB reset
WHATSAPP_API_KEY	❌	360dialog API key (simulated if absent)
DATABASE_USE_NULLPOOL	❌	true for Supabase connection pooler
Frontend (frontend/.env)
Table
Variable	Required	Description
VITE_API_URL	✅	Backend URL + /api/v1
👥 Demo Credentials
Table
Email	Password	Role	Permissions
admin@ojas.care	admin123	SUPER_ADMIN	Full system access
nurse@cityhospital.com	nurse123	COORDINATOR	Patient CRUD, escalations
dr.gupta@cityhospital.com	doctor123	DOCTOR	Read, reports, escalation view
📡 API Endpoints
Authentication
Table
Method	Endpoint	Auth	Description
POST	/api/v1/auth/login	Public	Login with JWT tokens
POST	/api/v1/auth/refresh	Public	Refresh access token
POST	/api/v1/auth/logout	Bearer	Revoke refresh tokens
GET	/api/v1/auth/me	Bearer	Current user profile
POST	/api/v1/auth/verify-invite	Public	Check invite validity
POST	/api/v1/auth/accept-invite	Public	Create account from invite
Patients
Table
Method	Endpoint	Auth	Description
POST	/api/v1/patients	Bearer	Enroll new patient (auto-creates 14 check-ins)
GET	/api/v1/patients	Bearer	List with pagination, status filter
GET	/api/v1/patients/{id}	Bearer	Full detail with timeline, check-ins, escalations
POST	/api/v1/patients/{id}/checkin/{day}	Bearer	Submit check-in with AI risk scoring
Escalations
Table
Method	Endpoint	Auth	Description
GET	/api/v1/escalations	Bearer	List with AI coach suggestions
POST	/api/v1/escalations/{id}/resolve	Bearer	Resolve with notes
Reports
Table
Method	Endpoint	Auth	Description
GET	/api/v1/reports/nabh	Bearer	Download NABH compliance PDF
SuperAdmin
Table
Method	Endpoint	Auth	Description
POST	/api/v1/superadmin/hospitals	SuperAdmin	Create hospital
GET	/api/v1/superadmin/hospitals	SuperAdmin	List all hospitals
POST	/api/v1/superadmin/hospitals/{id}/invite	SuperAdmin	Invite user by email
GET	/api/v1/superadmin/audit-logs	SuperAdmin	Security event trail
POST	/api/v1/superadmin/reset-database	SuperAdmin	Full reset with X-Reset-Key
🔒 Security Model
Encryption
Algorithm: AES-256 via Fernet
Key Derivation: PBKDF2HMAC (SHA-256, 480k iterations)
Salt: Fixed per-deployment, never rotated
Fields Encrypted: full_name, mobile, family_mobile, doctor_name, bed_number, uhid, contact_email, contact_phone
Key Fingerprint: Exposed in /health for deploy verification
Authentication Flow
plain
Login → Access Token (15min) + Refresh Token (7d, hashed in DB)
   │
   ├──► API Calls (Bearer access_token)
   │
   └──► 401 Expired → /auth/refresh (refresh_token) → New Access Token
              │
              └──► Refresh Revoked → Redirect to Login
RBAC Permission Matrix
Table
Permission	SUPER_ADMIN	HOSPITAL_ADMIN	COORDINATOR	DOCTOR
patient:create	✅	✅	✅	❌
patient:read	✅	✅	✅	✅
patient:update	✅	✅	✅	❌
report:generate	✅	✅	❌	✅
user:manage	✅	✅	❌	❌
hospital:manage	✅	❌	❌	❌
🧪 Testing
bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test

# Load testing

🚢 Deployment
Render (Backend)
Connect GitHub repo to Render
Set environment variables in Render dashboard
Use render.yaml for infrastructure-as-code
Health check: GET /health
Vercel (Frontend)
Import GitHub repo
Set VITE_API_URL environment variable
Build command: npm run build
Output directory: dist
Supabase (Database)
Create project
Copy connection string with pooler
Set DATABASE_USE_NULLPOOL=true
Enable Row Level Security (optional)
📁 Project Structure
plain
Ojas-HealthTech/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, DB, security, encryption, RBAC, audit
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # AI scoring, PDF, WhatsApp
│   │   └── tasks/          # Async job queues
│   ├── seed_data.py        # Demo data
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client, React Query hooks
│   │   ├── components/     # Reusable UI (RiskBadge, EscalationCoach)
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # usePermission
│   │   ├── pages/          # Route components
│   │   └── components/layout/  # Sidebar, Layout
│   ├── index.html
│   └── vite.config.js
└── README.md
🤝 Contributing
We welcome contributions from healthcare technologists, security researchers, and UI/UX designers.
Fork the repository
Create feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open Pull Request
Please read our Contributing Guide and Code of Conduct.
📜 License
This project is licensed under the Ojas HealthTech Proprietary License — see LICENSE file for details.
🙏 Acknowledgments
NABH (National Accreditation Board for Hospitals & Healthcare Providers) for compliance standards
360dialog for WhatsApp Business API infrastructure
Supabase for managed PostgreSQL
Render for seamless backend deployment
Vercel for edge-distributed frontend hosting
📞 Support
Email: imshivam077@gmail.com
Documentation: docs.ojas.care
Status: status.ojas.care
<p align="center">
  <strong>Built with 💙 for better patient outcomes</strong>
  <br/>
  <em>© 2026 Ojas HealthTech. All rights reserved.</em>
</p>
