# Ojas V3 — Production-Ready Post-Discharge Recovery Monitoring

## Zero-Cost Demo Setup

### 1. Backend (Local)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Seed demo data
python seed_data.py

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### 2. Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

### 3. Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@ojas.care | admin123 |
| Coordinator | nurse@cityhospital.com | nurse123 |
| Doctor | dr.gupta@cityhospital.com | doctor123 |

### 4. Deploy Frontend (Vercel — Free)
```bash
cd frontend
npm run build
# Drag 'dist/' folder to Vercel dashboard
```

### 5. Deploy Backend (Render/Railway — Free Tier)
- Push to GitHub
- Connect to Render/Railway
- Set environment variables
- Deploy

## Features
- AES-256 PHI encryption
- Multi-tenancy with data isolation
- RBAC (Super Admin, Hospital Admin, Coordinator, Doctor)
- AI Risk Scoring Engine
- Readmission Risk Prediction
- Smart Coordinator Suggestions
- NABH Report Generation (PDF)
- Audit Logging (ISO 27001)
- WhatsApp Integration (simulation mode without API key)
- PWA Support

## Environment Variables
```
DATABASE_URL=sqlite+aiosqlite:///./ojas.db
SECRET_KEY=your-secret-key
ENCRYPTION_KEY=your-32-byte-key
ENCRYPTION_SALT=your-salt
FRONTEND_URL=https://your-frontend.vercel.app
WHATSAPP_API_KEY=          # leave empty for simulation
WHATSAPP_API_URL=https://waba.360dialog.io/v1/messages
```
