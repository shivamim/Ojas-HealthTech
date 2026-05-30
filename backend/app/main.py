import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
from app.core.database import engine, Base
from app.core.tenant import tenant_middleware
from app.routers import auth, superadmin, hospitals, patients, escalations, reports, whatsapp

app = FastAPI(
    title="Ojas V3 — Post-Discharge Recovery Monitoring",
    description="NABH-Compliant | AI-Powered | Multi-Tenant",
    version="3.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS — restrict in production via env
origins_raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [o.strip() for o in origins_raw.split(",") if o.strip()]  # FIX: Filter empty strings

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# Tenant middleware
@app.middleware("http")
async def tenant_mw(request, call_next):
    return await tenant_middleware(request, call_next)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(superadmin.router, prefix="/api/v1")
app.include_router(hospitals.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(escalations.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(whatsapp.router, prefix="/api/v1")


@app.on_event("startup")
async def startup():
    # FIX: Check if tables exist before creating (prevents race condition)
    async with engine.begin() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        
        tables = await conn.run_sync(check_tables)
        if 'users' not in tables:
            await conn.run_sync(Base.metadata.create_all)
            print("Database initialized — tables created")
        else:
            print("Database initialized — tables already exist")


@app.get("/")
async def root():
    return {"name": "Ojas V3 API", "status": "running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
