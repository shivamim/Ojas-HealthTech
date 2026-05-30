import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings

# Use NullPool for serverless environments (Render free tier)
# NullPool doesn't maintain persistent connections — perfect for serverless
poolclass = NullPool if os.getenv("RENDER") or os.getenv("VERCEL") else None

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    poolclass=poolclass,
    pool_pre_ping=True,      # Verify connection before using (prevents stale connections)
    pool_recycle=300,        # Recycle connections every 5 minutes
    pool_size=5,             # Max 5 connections (Render free tier limit)
    max_overflow=0,          # No extra connections
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autoflush=False        # Better performance, explicit control
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()  # FIX: Rollback on error
            raise
        finally:
            await session.close()
