import os
import time
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.database import engine, Base, AsyncSessionLocal
from app.core.config import settings
from app.routers import auth, superadmin, hospitals, patients, escalations, reports, whatsapp

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Starting Ojas V3 in {settings.ENVIRONMENT} mode")

    async with engine.begin() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        try:
            tables = await conn.run_sync(check_tables)
        except SQLAlchemyError as e:
            print(f"❌ Database connection failed: {e}")
            tables = []

    if 'users' not in tables:
        print("📊 Tables not found — creating...")
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Tables created")
        except Exception as e:
            print(f"❌ Failed to create tables: {e}")
    else:
        print("✅ Tables already exist")

    if 'users' not in tables:
        print("🌱 Running seed data...")
        try:
            async with AsyncSessionLocal() as seed_db:
                from seed_data import seed
                await seed(seed_db)
                print("✅ Seed data loaded")
        except Exception as e:
            print(f"⚠️ Seed data error: {e}")

    yield
    print("🛑 Shutting down...")
    await engine.dispose()

app = FastAPI(
    title="Ojas V3 — Post-Discharge Recovery Monitoring",
    description="NABH-Compliant | AI-Powered | Multi-Tenant",
    version="3.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin",
                   "X-Requested-With", "X-Request-ID", "X-API-Key"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    max_age=86400,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def add_request_metadata(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(round(process_time, 4))

    if process_time > 1.0:
        print(f"⚠️ Slow request: {request.method} {request.url.path} took {process_time:.2f}s [{request_id}]")

    return response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    req_id = getattr(request.state, "request_id", None)
    print(f"💥 Database error [{req_id}]: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred", "request_id": req_id}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None)
    print(f"💥 Unhandled error [{req_id}]: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "request_id": req_id}
    )

app.include_router(auth.router, prefix="/api/v1")
app.include_router(superadmin.router, prefix="/api/v1")
app.include_router(hospitals.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(escalations.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(whatsapp.router, prefix="/api/v1")

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "name": "Ojas V3 API",
        "version": "3.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.ENVIRONMENT != "production" else None
    }

@app.get("/health")
async def health():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            db_healthy = result.scalar() == 1
    except Exception as e:
        print(f"Health check DB error: {e}")
        db_healthy = False

    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
