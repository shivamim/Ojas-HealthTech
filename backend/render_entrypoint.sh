#!/bin/bash
set -e

cd backend || exit 1

echo "=== Checking database connection ==="
python -c "
import asyncio
from app.core.database import engine
from sqlalchemy import text

async def check_db():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text('SELECT 1'))
            print('Database connected successfully')
    except Exception as e:
        print(f'Database connection failed: {e}')
        exit(1)

asyncio.run(check_db())
"

echo "=== Checking if tables exist ==="
python -c "
import asyncio
from app.core.database import engine, Base
from sqlalchemy import inspect

async def init():
    async with engine.begin() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        
        tables = await conn.run_sync(check_tables)
        if 'users' not in tables:
            await conn.run_sync(Base.metadata.create_all)
            print('Tables created successfully')
        else:
            print('Tables already exist, skipping creation')

asyncio.run(init())
"

# NOTE: Seeding is now handled by main.py lifespan if tables are new.
# This block is a fallback for manual CLI runs.
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
            exit(1)

asyncio.run(check_seed())
" || python seed_data.py

echo "=== Starting server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
