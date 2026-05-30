#!/bin/bash
set -e

cd backend || exit 1

echo "=== Checking if tables exist ==="
python -c "
import asyncio
from app.core.database import engine, Base
from sqlalchemy import inspect

async def init():
    async with engine.begin() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            tables = inspector.get_table_names()
            return tables
        
        tables = await conn.run_sync(check_tables)
        if 'users' not in tables:
            await conn.run_sync(Base.metadata.create_all)
            print('Tables created successfully')
        else:
            print('Tables already exist, skipping creation')

asyncio.run(init())
"

echo "=== Checking if seed data exists ==="
python -c "
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def check_seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == 'admin@ojas.care'))
        user = result.scalar_one_or_none()
        if user:
            print('Seed data already exists, skipping')
        else:
            print('No seed data found, will seed')
            exit(1)  # Exit with error to trigger seeding

asyncio.run(check_seed())
" || python seed_data.py

echo "=== Starting server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
