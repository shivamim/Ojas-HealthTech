import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.tenant import tenant_middleware
from app.routers import auth, superadmin, hospitals, patients, escalations, reports, whatsapp

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if tables exist
    async with engine.begin() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        tables = await conn.run_sync(check_tables)
        
        if 'users' not in tables:
            print("Tables not found — creating...")
            await conn.run_sync(Base.metadata.create_all)
            print("Tables created")
        else:
            print("Tables already exist")
    
    # Seed data (outside engine.begin() to avoid nested async issues)
    if 'users' not in tables:
        print("Running seed data...")
        async with AsyncSessionLocal() as seed_db:
            from seed_data import seed
            await seed()
            print("Seed data loaded")
    
    yield
    await engine.dispose()

app = FastAPI(
    title="Ojas V3 — Post-Discharge Recovery Monitoring",
    description="NABH-Compliant | AI-Powered | Multi-Tenant",
    version="3.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS
origins_raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [o.strip() for o in origins_raw.split(",") if o.strip()]

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

@app.get("/")
async def root():
    return {"name": "Ojas V3 API", "status": "running", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
